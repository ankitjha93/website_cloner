import path from 'path';
import crypto from 'crypto';

/**
 * Normalizes a URL by trimming, removing hash fragments, and ensuring valid protocol.
 */
export function normalizeUrl(rawUrl, baseUrl = null) {
  try {
    let resolved;
    if (baseUrl) {
      resolved = new URL(rawUrl, baseUrl);
    } else {
      if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        rawUrl = 'https://' + rawUrl;
      }
      resolved = new URL(rawUrl);
    }
    // Remove hash
    resolved.hash = '';
    return resolved.href;
  } catch (err) {
    return null;
  }
}

/**
 * Sanitize a string to be safely used as a folder or file name on Windows & POSIX.
 */
export function sanitizeName(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || 'unnamed';
}

/**
 * Creates a unique safe project folder name for a given target URL.
 */
export function createProjectFolderName(targetUrl) {
  try {
    const urlObj = new URL(targetUrl);
    const host = sanitizeName(urlObj.hostname);
    const timestamp = Date.now();
    return `${host}_${timestamp}`;
  } catch {
    return `site_${Date.now()}`;
  }
}

/**
 * Determines a local relative storage path for a URL within the project root.
 * E.g.,
 * https://example.com/ -> index.html
 * https://example.com/about -> about.html (or about/index.html)
 * https://example.com/css/main.css -> assets/css/main.css
 * https://cdn.com/lib.js -> assets/external/cdn_com_lib.js
 */
export function urlToLocalPath(targetUrl, baseOrigin, contentType = '') {
  try {
    const urlObj = new URL(targetUrl);
    const isSameOrigin = urlObj.origin === baseOrigin;
    let pathname = decodeURIComponent(urlObj.pathname);

    // If external domain asset
    let prefix = '';
    if (!isSameOrigin) {
      prefix = path.posix.join('assets', 'external', sanitizeName(urlObj.hostname));
    }

    // Clean up trailing slash or root
    if (pathname === '/' || pathname === '') {
      return path.posix.join(prefix, 'index.html');
    }

    // Extract file name and extension
    let ext = path.posix.extname(pathname);
    let base = path.posix.basename(pathname, ext);
    let dir = path.posix.dirname(pathname);

    // If dir is '/' or '.', normalize
    if (dir === '/' || dir === '.') dir = '';
    if (dir.startsWith('/')) dir = dir.slice(1);

    // If no extension, check if it's an HTML page or infer from contentType
    if (!ext) {
      if (contentType.includes('text/html') || !contentType) {
        // e.g. /about -> about.html or /about/index.html
        ext = '.html';
      } else if (contentType.includes('image/jpeg')) {
        ext = '.jpg';
      } else if (contentType.includes('image/png')) {
        ext = '.png';
      } else if (contentType.includes('image/svg')) {
        ext = '.svg';
      } else if (contentType.includes('image/webp')) {
        ext = '.webp';
      } else if (contentType.includes('text/css')) {
        ext = '.css';
      } else if (contentType.includes('javascript')) {
        ext = '.js';
      }
    }

    // If query string exists, append a short hash to avoid collisions for dynamic assets
    if (urlObj.search && urlObj.search.length > 1) {
      const hash = crypto.createHash('md5').update(urlObj.search).digest('hex').slice(0, 6);
      base = `${base}_${hash}`;
    }

    base = sanitizeName(base);
    const sanitizedDir = dir ? dir.split('/').filter(Boolean).map(sanitizeName).join('/') : '';

    let resultPath;
    if (prefix) {
      resultPath = path.posix.join(prefix, sanitizedDir, `${base}${ext}`);
    } else {
      resultPath = path.posix.join(sanitizedDir, `${base}${ext}`);
    }

    return resultPath.replace(/\\/g, '/');
  } catch (err) {
    const hash = crypto.createHash('md5').update(targetUrl).digest('hex').slice(0, 10);
    return `assets/asset_${hash}.dat`;
  }
}

/**
 * Calculates relative path from one local file path to another (using posix forward slashes).
 * Example: from "blog/post-1.html" to "assets/css/style.css" -> "../assets/css/style.css"
 */
export function getRelativePath(fromFilePath, toFilePath) {
  const fromDir = path.posix.dirname(fromFilePath);
  let rel = path.posix.relative(fromDir, toFilePath);
  if (!rel.startsWith('.') && !rel.startsWith('/')) {
    rel = './' + rel;
  }
  return rel.replace(/\\/g, '/');
}

/**
 * Format bytes to readable string (e.g. 1.25 MB)
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
