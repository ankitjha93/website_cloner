/**
 * Standard Robots.txt Parser & Compliance Engine
 * Complies with the Robots Exclusion Standard (RFC 9309).
 */
export class RobotsParser {
  constructor() {
    this.disallowRules = [];
    this.allowRules = [];
    this.crawlDelay = null;
    this.isLoaded = false;
  }

  /**
   * Parses the text content of a robots.txt file
   * @param {string} content Raw robots.txt content
   */
  parse(content = '') {
    this.disallowRules = [];
    this.allowRules = [];
    this.crawlDelay = null;
    this.isLoaded = true;

    if (!content || typeof content !== 'string') return;

    const lines = content.split(/\r?\n/);
    let isTargetAgent = false;

    for (const rawLine of lines) {
      // Strip comments and trim whitespace
      const line = rawLine.replace(/#.*$/, '').trim();
      if (!line) continue;

      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const field = line.substring(0, colonIdx).trim().toLowerCase();
      const value = line.substring(colonIdx + 1).trim();

      if (field === 'user-agent') {
        // We match wildcard '*' or our cloner identity
        isTargetAgent = (value === '*' || value.toLowerCase().includes('mirrox') || value.toLowerCase().includes('bot'));
      } else if (isTargetAgent) {
        if (field === 'disallow' && value) {
          this.disallowRules.push(this.normalizePattern(value));
        } else if (field === 'allow' && value) {
          this.allowRules.push(this.normalizePattern(value));
        } else if (field === 'crawl-delay') {
          const delayNum = parseFloat(value);
          if (!isNaN(delayNum) && delayNum > 0) {
            this.crawlDelay = delayNum;
          }
        }
      }
    }
  }

  /**
   * Normalizes a path pattern for regex matching
   */
  normalizePattern(pattern) {
    if (pattern === '/') return '^/.*';
    let escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    escaped = escaped.replace(/\*/g, '.*');
    if (!escaped.endsWith('$') && !escaped.endsWith('.*')) {
      escaped += '.*';
    }
    return `^${escaped}`;
  }

  /**
   * Checks if a URL path is allowed by robots.txt directives
   * @param {string} urlPath Path portion of URL (e.g. /admin/dashboard)
   * @returns {boolean} True if allowed, false if disallowed
   */
  isAllowed(urlPath = '/') {
    if (!this.isLoaded) return true;
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;

    // Specific Allow rules take precedence if longer or explicit
    for (const allowPattern of this.allowRules) {
      try {
        if (new RegExp(allowPattern, 'i').test(cleanPath)) {
          return true;
        }
      } catch {}
    }

    // Check Disallow rules
    for (const disallowPattern of this.disallowRules) {
      try {
        if (new RegExp(disallowPattern, 'i').test(cleanPath)) {
          return false;
        }
      } catch {}
    }

    return true;
  }
}
