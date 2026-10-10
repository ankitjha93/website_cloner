import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import * as cheerio from 'cheerio';
import { normalizeUrl, urlToLocalPath, getRelativePath, createProjectFolderName, formatBytes } from './utils.js';
import { processCssContent } from './cssParser.js';
import { TokenBucketRateLimiter } from './rateLimiter.js';
import { RobotsParser } from './robotsParser.js';

export class WebsiteCloner extends EventEmitter {
  constructor(options = {}) {
    super();
    this.targetUrl = options.targetUrl;
    this.maxDepth = Number(options.maxDepth) || 2;
    this.maxPages = Number(options.maxPages) || 50;
    this.concurrency = Math.min(Math.max(Number(options.concurrency) || 5, 1), 15);
    
    // Phase 2: Distributed resilience & compliance options
    this.requestsPerSecond = Math.max(1, Number(options.requestsPerSecond) || 5);
    this.rateLimiter = new TokenBucketRateLimiter(this.requestsPerSecond);
    this.respectRobots = options.respectRobots !== false;
    this.robotsParser = new RobotsParser();
    this.maxAssetSizeBytes = Number(options.maxAssetSizeBytes) || 50 * 1024 * 1024; // 50MB safeguard
    this.resume = options.resume === true;

    // Asset toggles
    this.downloadImages = options.downloadImages !== false;
    this.downloadCss = options.downloadCss !== false;
    this.downloadJs = options.downloadJs !== false;
    this.downloadFonts = options.downloadFonts !== false;
    this.downloadMedia = options.downloadMedia === true;
    this.stripTrackers = options.stripTrackers !== false;
    
    // Domain restrictions
    this.sameDomainOnly = options.sameDomainOnly !== false;
    this.allowSubdomains = options.allowSubdomains === true;

    // Output directory
    this.outputBaseDir = options.outputBaseDir || path.resolve(process.cwd(), 'clones');
    this.folderName = options.folderName || createProjectFolderName(this.targetUrl);
    this.projectDir = path.join(this.outputBaseDir, this.folderName);
    this.checkpointPath = path.join(this.projectDir, 'crawl_checkpoint.json');

    // State
    this.origin = null;
    this.hostname = null;
    this.pageQueue = []; // [{ url, depth }]
    this.visitedUrls = new Set();
    this.pagePathMap = new Map(); // url -> localRelativePath
    this.assetPathMap = new Map(); // url -> localRelativePath
    this.assetQueue = []; // [{ url, type }]
    this.queuedAssetUrls = new Set();

    this.stats = {
      pagesCrawled: 0,
      assetsDownloaded: 0,
      totalBytes: 0,
      errors: 0,
      startTime: null,
      endTime: null
    };

    this.isCancelled = false;
    this.activeWorkers = 0;
    this.siteTitle = '';
    this.favicon = '';
  }

  log(type, message) {
    this.emit('log', {
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  emitProgress(status = 'Cloning') {
    this.emit('progress', {
      status,
      pagesCrawled: this.stats.pagesCrawled,
      assetsDownloaded: this.stats.assetsDownloaded,
      totalBytes: this.stats.totalBytes,
      totalBytesFormatted: formatBytes(this.stats.totalBytes),
      errors: this.stats.errors,
      queueSize: this.pageQueue.length + this.assetQueue.length,
      elapsedMs: Date.now() - (this.stats.startTime || Date.now())
    });
  }

  cancel() {
    this.isCancelled = true;
    this.log('warning', 'Cloning operation was cancelled by user. Saving checkpoint...');
    this.saveCheckpoint().catch(() => {});
  }

  /**
   * Persists current crawl state to disk for crash recovery / resume
   */
  async saveCheckpoint() {
    try {
      const data = {
        targetUrl: this.targetUrl,
        folderName: this.folderName,
        origin: this.origin,
        hostname: this.hostname,
        siteTitle: this.siteTitle,
        favicon: this.favicon,
        visitedUrls: Array.from(this.visitedUrls),
        pageQueue: this.pageQueue,
        queuedAssetUrls: Array.from(this.queuedAssetUrls),
        assetQueue: this.assetQueue,
        pagePathMap: Array.from(this.pagePathMap.entries()),
        assetPathMap: Array.from(this.assetPathMap.entries()),
        stats: this.stats,
        savedAt: new Date().toISOString()
      };
      await fs.promises.mkdir(this.projectDir, { recursive: true });
      await fs.promises.writeFile(this.checkpointPath, JSON.stringify(data, null, 2), 'utf-8');
      this.log('info', `💾 Checkpoint saved: ${this.stats.pagesCrawled} pages, ${this.stats.assetsDownloaded} assets, ${this.pageQueue.length} pages queued.`);
    } catch (err) {
      this.log('warning', `Failed to save checkpoint: ${err.message}`);
    }
  }

  /**
   * Restores crawl state from existing checkpoint
   */
  async loadCheckpoint() {
    try {
      if (fs.existsSync(this.checkpointPath)) {
        const raw = await fs.promises.readFile(this.checkpointPath, 'utf-8');
        const data = JSON.parse(raw);
        this.targetUrl = data.targetUrl || this.targetUrl;
        this.origin = data.origin || this.origin;
        this.hostname = data.hostname || this.hostname;
        this.siteTitle = data.siteTitle || this.siteTitle;
        this.favicon = data.favicon || this.favicon;
        this.visitedUrls = new Set(data.visitedUrls || []);
        this.pageQueue = data.pageQueue || [];
        this.queuedAssetUrls = new Set(data.queuedAssetUrls || []);
        this.assetQueue = data.assetQueue || [];
        this.pagePathMap = new Map(data.pagePathMap || []);
        this.assetPathMap = new Map(data.assetPathMap || []);
        if (data.stats) {
          this.stats.pagesCrawled = data.stats.pagesCrawled || 0;
          this.stats.assetsDownloaded = data.stats.assetsDownloaded || 0;
          this.stats.totalBytes = data.stats.totalBytes || 0;
          this.stats.errors = data.stats.errors || 0;
        }
        this.log('success', `⚡ Resumed from checkpoint! Restored ${this.stats.pagesCrawled} pages, ${this.stats.assetsDownloaded} assets, ${this.pageQueue.length} queued pages.`);
        return true;
      }
    } catch (err) {
      this.log('warning', `Could not load checkpoint (${err.message}). Starting standard crawl.`);
    }
    return false;
  }

  isAllowedDomain(urlStr) {
    try {
      const u = new URL(urlStr);
      if (!this.sameDomainOnly) return true;
      if (u.hostname === this.hostname) return true;
      if (this.allowSubdomains && u.hostname.endsWith(`.${this.hostname}`)) return true;
      return false;
    } catch {
      return false;
    }
  }

  async start() {
    this.stats.startTime = Date.now();
    const normalizedRoot = normalizeUrl(this.targetUrl);
    if (!normalizedRoot) {
      throw new Error(`Invalid URL: ${this.targetUrl}`);
    }

    const rootUrlObj = new URL(normalizedRoot);
    this.origin = rootUrlObj.origin;
    this.hostname = rootUrlObj.hostname;

    await fs.promises.mkdir(this.projectDir, { recursive: true });

    let isResumed = false;
    if (this.resume) {
      isResumed = await this.loadCheckpoint();
    }

    if (!isResumed) {
      this.log('info', `Starting clone of: ${normalizedRoot}`);
      this.log('info', `Output directory: ${this.projectDir}`);
      this.log('info', `Depth limit: ${this.maxDepth}, Page limit: ${this.maxPages}, Concurrency: ${this.concurrency}, Rate: ${this.requestsPerSecond} req/s`);

      this.pageQueue.push({ url: normalizedRoot, depth: 1 });
      this.visitedUrls.add(normalizedRoot);
    }

    // Preflight Robots.txt RFC 9309 compliance
    if (this.respectRobots) {
      try {
        const robotsUrl = `${this.origin}/robots.txt`;
        const robotsRes = await this.fetchWithTimeout(robotsUrl, 'text', 8000, 1).catch(() => null);
        if (robotsRes && robotsRes.data) {
          this.robotsParser.parse(robotsRes.data);
          this.log('info', `🤖 robots.txt parsed: ${this.robotsParser.disallowRules.length} disallow rules found.`);
          if (this.robotsParser.crawlDelay) {
            const delayRps = 1 / this.robotsParser.crawlDelay;
            this.rateLimiter.setRate(Math.min(this.rateLimiter.rps, delayRps));
            this.log('info', `⏱️ robots.txt crawl-delay (${this.robotsParser.crawlDelay}s) enforced. Rate adjusted to ${this.rateLimiter.rps.toFixed(2)} req/s.`);
          }
        }
      } catch (err) {
        this.log('info', `Notice: robots.txt not reachable (${err.message}). Proceeding with standard crawl.`);
      }
    }

    this.emit('start', {
      folderName: this.folderName,
      targetUrl: normalizedRoot,
      projectDir: this.projectDir,
      isResumed
    });

    // Main crawling loop
    while (!this.isCancelled && (this.pageQueue.length > 0 || this.assetQueue.length > 0)) {
      // Process page if available and limit not reached
      if (this.pageQueue.length > 0 && this.stats.pagesCrawled < this.maxPages) {
        const pageItem = this.pageQueue.shift();
        await this.processPage(pageItem.url, pageItem.depth);
      }

      // Process batch of queued assets
      while (this.assetQueue.length > 0 && !this.isCancelled) {
        const batch = this.assetQueue.splice(0, this.concurrency);
        await Promise.all(batch.map(item => this.downloadAsset(item.url, item.type)));
      }

      // If page limit reached, clear remaining page queue
      if (this.stats.pagesCrawled >= this.maxPages && this.pageQueue.length > 0) {
        this.log('info', `Reached maximum page limit (${this.maxPages}). Finishing remaining asset downloads.`);
        this.pageQueue = [];
      }
    }

    if (this.isCancelled) {
      await this.saveCheckpoint();
      this.emitProgress('Cancelled');
      return null;
    }

    this.stats.endTime = Date.now();
    const durationSec = ((this.stats.endTime - this.stats.startTime) / 1000).toFixed(1);

    // Save metadata manifest
    const manifest = {
      folderName: this.folderName,
      targetUrl: this.targetUrl,
      title: this.siteTitle || this.hostname,
      favicon: this.favicon || null,
      clonedAt: new Date().toISOString(),
      stats: {
        pages: this.stats.pagesCrawled,
        assets: this.stats.assetsDownloaded,
        totalBytes: this.stats.totalBytes,
        totalBytesFormatted: formatBytes(this.stats.totalBytes),
        durationSec: `${durationSec}s`,
        errors: this.stats.errors
      },
      options: {
        maxDepth: this.maxDepth,
        maxPages: this.maxPages,
        sameDomainOnly: this.sameDomainOnly,
        requestsPerSecond: this.requestsPerSecond,
        respectRobots: this.respectRobots
      },
      rootHtml: 'index.html'
    };

    await fs.promises.writeFile(
      path.join(this.projectDir, 'site_manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    // Cleanup checkpoint file upon complete success
    await fs.promises.unlink(this.checkpointPath).catch(() => {});

    this.log('success', `Completed clone! ${this.stats.pagesCrawled} pages, ${this.stats.assetsDownloaded} assets, ${formatBytes(this.stats.totalBytes)} in ${durationSec}s`);
    this.emitProgress('Completed');

    this.emit('complete', manifest);
    return manifest;
  }

  /**
   * Resilient HTTP fetcher with Token-Bucket rate limiting, exponential backoff, and memory guard
   */
  async fetchWithTimeout(url, responseType = 'text', timeoutMs = 15000, maxRetries = 3) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (this.isCancelled) throw new Error('Cancelled');

      // Consume 1 token from bucket before making network request
      await this.rateLimiter.consume(1);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 MirroX/2.5',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          }
        });
        clearTimeout(timer);

        // Exponential backoff with jitter on 429 (Too Many Requests) or 503 (Service Unavailable)
        if (response.status === 429 || response.status === 503) {
          if (attempt < maxRetries) {
            const delay = await this.rateLimiter.waitBackoff(attempt);
            this.log('warning', `⚠️ HTTP ${response.status} on ${url}. Backing off for ${delay}ms (retry ${attempt + 1}/${maxRetries})...`);
            continue;
          }
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        // Memory bounds check: abort if file > maxAssetSizeBytes (e.g. 50MB)
        const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
        if (contentLength > this.maxAssetSizeBytes) {
          throw new Error(`Asset exceeded max memory guard (${formatBytes(contentLength)} > ${formatBytes(this.maxAssetSizeBytes)})`);
        }

        const contentType = response.headers.get('content-type') || '';
        let data;
        if (responseType === 'buffer') {
          const arrayBuffer = await response.arrayBuffer();
          if (arrayBuffer.byteLength > this.maxAssetSizeBytes) {
            throw new Error(`Asset buffer exceeded memory bound of ${formatBytes(this.maxAssetSizeBytes)}`);
          }
          data = Buffer.from(arrayBuffer);
        } else {
          data = await response.text();
        }

        return { data, contentType, status: response.status };
      } catch (err) {
        clearTimeout(timer);
        if (attempt < maxRetries && (err.name === 'AbortError' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
          const delay = await this.rateLimiter.waitBackoff(attempt);
          this.log('warning', `Network hiccup (${err.message}) on ${url}. Retrying in ${delay}ms...`);
          continue;
        }
        throw err;
      }
    }
  }

  async processPage(pageUrl, depth) {
    if (this.isCancelled) return;

    // Robots.txt exclusion check
    if (this.respectRobots) {
      try {
        const u = new URL(pageUrl);
        if (!this.robotsParser.isAllowed(u.pathname)) {
          this.log('warning', `🤖 Disallowed by robots.txt directive: ${pageUrl}`);
          return;
        }
      } catch {}
    }

    this.log('info', `Crawling [D${depth}] ${pageUrl}`);

    let htmlContent = '';
    let contentType = '';
    try {
      const res = await this.fetchWithTimeout(pageUrl, 'text');
      htmlContent = res.data;
      contentType = res.contentType;
      this.stats.totalBytes += Buffer.byteLength(htmlContent, 'utf-8');
    } catch (err) {
      this.stats.errors++;
      this.log('error', `Failed to fetch page ${pageUrl}: ${err.message}`);
      return;
    }

    const localRelativePath = urlToLocalPath(pageUrl, this.origin, contentType);
    this.pagePathMap.set(pageUrl, localRelativePath);

    const $ = cheerio.load(htmlContent);

    // Save title & favicon if first page
    if (!this.siteTitle) {
      this.siteTitle = $('title').first().text().trim();
    }
    if (!this.favicon) {
      const favEl = $('link[rel*="icon"]').first();
      if (favEl.length && favEl.attr('href')) {
        this.favicon = normalizeUrl(favEl.attr('href'), pageUrl);
      }
    }

    // 0. Clean & Strip Trackers, Ads & Cookie Popups if enabled
    if (this.stripTrackers) {
      const trackerDomains = [
        'google-analytics.com', 'googletagmanager.com', 'analytics.google.com',
        'facebook.net', 'connect.facebook.net', 'fbevents.js',
        'hotjar.com', 'clarity.ms', 'segment.com', 'segment.io',
        'doubleclick.net', 'adservice.google', 'criteo.net', 'adnxs.com',
        'adsbygoogle', 'tiktok.com/analytics', 'datadoghq-browser-agent',
        'onesignal.com', 'sentry.io'
      ];

      // Remove external script trackers
      $('script[src]').each((_, el) => {
        const src = $(el).attr('src') || '';
        if (trackerDomains.some(d => src.includes(d))) {
          this.log('info', `🛡️ Cleaned external tracker: ${src.slice(0, 60)}...`);
          $(el).remove();
        }
      });

      // Remove inline tracker snippets (gtag, fbq, ga, clarity, dataLayer)
      $('script:not([src])').each((_, el) => {
        const inlineCode = $(el).html() || '';
        if (
          inlineCode.includes('gtag(') ||
          inlineCode.includes('fbq(') ||
          inlineCode.includes('ga(') ||
          inlineCode.includes('clarity(') ||
          inlineCode.includes('hj(') ||
          inlineCode.includes('dataLayer.push') ||
          inlineCode.includes('adsbygoogle')
        ) {
          this.log('info', '🛡️ Cleaned inline analytics/ad code snippet');
          $(el).remove();
        }
      });

      // Remove cookie banners & consent overlays
      const cookieSelectors = [
        '#onetrust-consent-sdk', '#onetrust-banner-sdk',
        '#CybotCookiebotDialog', '.cookie-banner', '.cookie-consent',
        '#cookie-notice', '#cookie-banner', '.cc-window',
        '[aria-label*="cookie" i]', '[id*="cookie-banner" i]'
      ];
      cookieSelectors.forEach(sel => {
        const matches = $(sel);
        if (matches.length) {
          this.log('info', `🛡️ Removed cookie consent popup (${sel})`);
          matches.remove();
        }
      });
    }

    // Helper to queue an asset and get its local path
    const registerAsset = (assetUrl, assetType) => {

      if (!assetUrl) return null;
      if (this.assetPathMap.has(assetUrl)) {
        return this.assetPathMap.get(assetUrl);
      }

      const assetLocalPath = urlToLocalPath(assetUrl, this.origin);
      this.assetPathMap.set(assetUrl, assetLocalPath);

      if (!this.queuedAssetUrls.has(assetUrl)) {
        this.queuedAssetUrls.add(assetUrl);
        this.assetQueue.push({ url: assetUrl, type: assetType });
      }
      return assetLocalPath;
    };

    // 1. Process CSS <link rel="stylesheet">
    if (this.downloadCss) {
      $('link[rel="stylesheet"], link[rel="preload"][as="style"]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        const absUrl = normalizeUrl(href, pageUrl);
        if (!absUrl) return;

        const assetPath = registerAsset(absUrl, 'stylesheet');
        if (assetPath) {
          const rel = getRelativePath(localRelativePath, assetPath);
          $(el).attr('href', rel);
        }
      });
    }

    // 2. Process Scripts <script src="...">
    if (this.downloadJs) {
      $('script[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (!src) return;
        const absUrl = normalizeUrl(src, pageUrl);
        if (!absUrl) return;

        const assetPath = registerAsset(absUrl, 'script');
        if (assetPath) {
          const rel = getRelativePath(localRelativePath, assetPath);
          $(el).attr('src', rel);
        }
      });
    }

    // 3. Process Images <img src="..." srcset="..."> and <picture>
    if (this.downloadImages) {
      $('img, image').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && !src.startsWith('data:')) {
          const absUrl = normalizeUrl(src, pageUrl);
          if (absUrl) {
            const assetPath = registerAsset(absUrl, 'image');
            if (assetPath) {
              const rel = getRelativePath(localRelativePath, assetPath);
              $(el).attr('src', rel);
              $(el).removeAttr('data-src');
            }
          }
        }

        // srcset
        const srcset = $(el).attr('srcset') || $(el).attr('data-srcset');
        if (srcset) {
          const parts = srcset.split(',').map(part => {
            const trimmed = part.trim();
            const segments = trimmed.split(/\s+/);
            if (!segments[0] || segments[0].startsWith('data:')) return part;
            const absUrl = normalizeUrl(segments[0], pageUrl);
            if (absUrl) {
              const assetPath = registerAsset(absUrl, 'image');
              if (assetPath) {
                const rel = getRelativePath(localRelativePath, assetPath);
                return segments[1] ? `${rel} ${segments[1]}` : rel;
              }
            }
            return part;
          });
          $(el).attr('srcset', parts.join(', '));
          $(el).removeAttr('data-srcset');
        }
      });

      // Icons
      $('link[rel*="icon"], link[rel="apple-touch-icon"]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        const absUrl = normalizeUrl(href, pageUrl);
        if (!absUrl) return;
        const assetPath = registerAsset(absUrl, 'image');
        if (assetPath) {
          const rel = getRelativePath(localRelativePath, assetPath);
          $(el).attr('href', rel);
        }
      });
    }

    // 4. Process Videos & Audio if enabled
    if (this.downloadMedia) {
      $('video, audio, source').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('data:')) {
          const absUrl = normalizeUrl(src, pageUrl);
          if (absUrl) {
            const assetPath = registerAsset(absUrl, 'media');
            if (assetPath) {
              const rel = getRelativePath(localRelativePath, assetPath);
              $(el).attr('src', rel);
            }
          }
        }
      });
    }

    // 5. Process Inline <style> blocks
    $('style').each((_, el) => {
      const inlineCss = $(el).html();
      if (inlineCss) {
        const processed = processCssContent(inlineCss, pageUrl, localRelativePath, registerAsset);
        $(el).html(processed);
      }
    });

    // 6. Process style attributes on tags
    $('[style]').each((_, el) => {
      const styleAttr = $(el).attr('style');
      if (styleAttr && styleAttr.includes('url(')) {
        const processed = processCssContent(styleAttr, pageUrl, localRelativePath, registerAsset);
        $(el).attr('style', processed);
      }
    });

    // 7. Crawl Internal Links <a href="...">
    $('a[href]').each((_, el) => {
      const rawHref = $(el).attr('href');
      if (!rawHref) return;

      const trimmed = rawHref.trim();
      if (trimmed.startsWith('#') || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
        return;
      }

      const absUrl = normalizeUrl(trimmed, pageUrl);
      if (!absUrl) return;

      if (this.isAllowedDomain(absUrl)) {
        // Enqueue if within depth and limits
        if (depth < this.maxDepth && !this.visitedUrls.has(absUrl)) {
          if (this.visitedUrls.size < this.maxPages * 2) {
            this.visitedUrls.add(absUrl);
            this.pageQueue.push({ url: absUrl, depth: depth + 1 });
          }
        }

        // Link rewriting to target file
        const linkedPagePath = urlToLocalPath(absUrl, this.origin, 'text/html');
        const rel = getRelativePath(localRelativePath, linkedPagePath);
        $(el).attr('href', rel);
      }
    });

    // 8. Remove <base> tag to avoid breaking local file relative links
    $('base').remove();

    // 9. Save HTML file to disk
    const targetFilePath = path.join(this.projectDir, localRelativePath);
    await fs.promises.mkdir(path.dirname(targetFilePath), { recursive: true });
    await fs.promises.writeFile(targetFilePath, $.html(), 'utf-8');

    this.stats.pagesCrawled++;
    this.log('success', `Saved: ${localRelativePath} (Total pages: ${this.stats.pagesCrawled})`);
    this.emitProgress();

    // Periodic checkpoint save every 3 pages
    if (this.stats.pagesCrawled % 3 === 0) {
      await this.saveCheckpoint();
    }
  }

  async downloadAsset(assetUrl, type) {
    if (this.isCancelled) return;

    // Fast-path resume: If asset is already saved on local disk, skip network download
    const localRelativePath = this.assetPathMap.get(assetUrl) || urlToLocalPath(assetUrl, this.origin);
    const filePath = path.join(this.projectDir, localRelativePath);
    if (fs.existsSync(filePath)) {
      this.stats.assetsDownloaded++;
      this.emitProgress();
      return;
    }

    try {
      const isCss = type === 'stylesheet' || assetUrl.endsWith('.css');
      const res = await this.fetchWithTimeout(assetUrl, isCss ? 'text' : 'buffer');

      let content = res.data;

      // If CSS, process nested urls for fonts and images
      if (isCss && typeof content === 'string') {
        const registerNestedAsset = (nestedUrl, nestedType) => {
          if (!nestedUrl) return null;
          if (this.assetPathMap.has(nestedUrl)) {
            return this.assetPathMap.get(nestedUrl);
          }
          const nestedPath = urlToLocalPath(nestedUrl, this.origin);
          this.assetPathMap.set(nestedUrl, nestedPath);
          if (!this.queuedAssetUrls.has(nestedUrl)) {
            this.queuedAssetUrls.add(nestedUrl);
            this.assetQueue.push({ url: nestedUrl, type: nestedType });
          }
          return nestedPath;
        };

        content = processCssContent(content, assetUrl, localRelativePath, registerNestedAsset);
      }

      const filePath = path.join(this.projectDir, localRelativePath);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

      if (Buffer.isBuffer(content)) {
        await fs.promises.writeFile(filePath, content);
        this.stats.totalBytes += content.length;
      } else {
        await fs.promises.writeFile(filePath, content, 'utf-8');
        this.stats.totalBytes += Buffer.byteLength(content, 'utf-8');
      }

      this.stats.assetsDownloaded++;
      this.emitProgress();
    } catch (err) {
      this.stats.errors++;
      // Quiet warning for minor asset failures
      this.log('warning', `Skipped asset (${type}): ${assetUrl} (${err.message})`);
    }
  }
}
