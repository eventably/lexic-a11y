// sanitize-url.js
// Centralized URL safety check shared by the link and (future) media dialogs.
//
// Links are an XSS sink: a `javascript:` (or `data:`/`vbscript:`) href runs script
// on click. We use a *positive* protocol allowlist rather than a blocklist so
// obfuscated or unknown schemes fail closed. The WHATWG `URL` parser strips ASCII
// tab/newline/CR before parsing, which neutralizes the classic `java\nscript:`
// control-character bypass.

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:', 'sms:']);

/**
 * Returns true when `url` is safe to use as a link href.
 * Relative URLs and bare fragments (no scheme) are allowed; any explicit
 * scheme must be in the allowlist.
 * @param {unknown} url - The candidate URL to validate.
 * @returns {boolean} True when the URL is safe to use as an href.
 */
export function isSafeUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }
  const trimmed = url.trim();
  if (trimmed === '') {
    return false;
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    // No scheme => relative URL or fragment; safe (resolved against page origin).
    return true;
  }
  return SAFE_PROTOCOLS.has(parsed.protocol);
}

/**
 * Returns a safe href for `url`, collapsing anything unsafe to `about:blank`
 * so it can never execute. Use this when a value must always be assignable
 * (e.g. as a Lexical `validateUrl` fallback); prefer {@link isSafeUrl} to gate
 * user input before it is accepted.
 * @param {unknown} url - The candidate URL to sanitize.
 * @returns {string} The trimmed URL when safe, otherwise `about:blank`.
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') {
    return 'about:blank';
  }
  return isSafeUrl(url) ? url.trim() : 'about:blank';
}
