import { isSafeUrl, sanitizeUrl } from '../utils/sanitize-url';

describe('isSafeUrl', () => {
  it('accepts http(s), mailto, tel, and sms URLs', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('http://example.com/path?q=1')).toBe(true);
    expect(isSafeUrl('mailto:user@example.com')).toBe(true);
    expect(isSafeUrl('tel:+15551234567')).toBe(true);
    expect(isSafeUrl('sms:+15551234567')).toBe(true);
  });

  it('accepts relative URLs and fragments (no scheme)', () => {
    expect(isSafeUrl('/about')).toBe(true);
    expect(isSafeUrl('page.html')).toBe(true);
    expect(isSafeUrl('#section')).toBe(true);
  });

  it('rejects javascript:, data:, and vbscript: schemes', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('  javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
  });

  it('neutralizes control-character scheme obfuscation', () => {
    // WHATWG URL parsing strips tab/newline/CR, exposing the real scheme.
    expect(isSafeUrl('java\nscript:alert(1)')).toBe(false);
    expect(isSafeUrl('java\tscript:alert(1)')).toBe(false);
  });

  it('rejects empty and non-string input', () => {
    expect(isSafeUrl('')).toBe(false);
    expect(isSafeUrl('   ')).toBe(false);
    expect(isSafeUrl(null)).toBe(false);
    expect(isSafeUrl(undefined)).toBe(false);
  });
});

describe('sanitizeUrl', () => {
  it('returns the trimmed URL when safe', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
  });

  it('collapses unsafe URLs to about:blank', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('data:text/html,x')).toBe('about:blank');
    expect(sanitizeUrl(null)).toBe('about:blank');
  });
});
