import { normalizeUrl, getRelativePath } from './utils.js';

/**
 * Extracts and rewrites URLs inside CSS content (e.g. url(...) and @import).
 * @param {string} cssContent - Raw CSS text
 * @param {string} cssUrl - Original URL where CSS was fetched from
 * @param {string} cssLocalPath - Target local relative path for the CSS file
 * @param {Function} registerAsset - Callback `(assetUrl, inferredType) => localPath`
 * @returns {string} - Modified CSS with rewritten local relative URLs
 */
export function processCssContent(cssContent, cssUrl, cssLocalPath, registerAsset) {
  if (!cssContent || typeof cssContent !== 'string') return '';

  // Regex matching url(...) pattern
  // Matches: url('...'), url("..."), url(...)
  const urlPattern = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;

  let rewritten = cssContent.replace(urlPattern, (match, quote, rawAssetPath) => {
    // Clean and validate path
    rawAssetPath = rawAssetPath.trim();
    if (!rawAssetPath || rawAssetPath.startsWith('data:') || rawAssetPath.startsWith('#')) {
      return match;
    }

    const absoluteAssetUrl = normalizeUrl(rawAssetPath, cssUrl);
    if (!absoluteAssetUrl) return match;

    // Register asset in cloner
    const assetLocalPath = registerAsset(absoluteAssetUrl, 'css-asset');
    if (!assetLocalPath) return match;

    // Get relative path from CSS file to asset
    const relPath = getRelativePath(cssLocalPath, assetLocalPath);
    return `url('${relPath}')`;
  });

  // Regex matching @import "..." pattern (when not wrapped in url())
  const importPattern = /@import\s+(?:(['"])(.*?)\1);/gi;
  rewritten = rewritten.replace(importPattern, (match, quote, rawImportPath) => {
    rawImportPath = rawImportPath.trim();
    if (!rawImportPath || rawImportPath.startsWith('data:') || rawImportPath.startsWith('url(')) {
      return match;
    }

    const absoluteImportUrl = normalizeUrl(rawImportPath, cssUrl);
    if (!absoluteImportUrl) return match;

    const assetLocalPath = registerAsset(absoluteImportUrl, 'stylesheet');
    if (!assetLocalPath) return match;

    const relPath = getRelativePath(cssLocalPath, assetLocalPath);
    return `@import '${relPath}';`;
  });

  return rewritten;
}
