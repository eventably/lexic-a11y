import { sanitizePastedHtml } from '../utils/sanitize-html';

describe('sanitizePastedHtml', () => {
  it('keeps supported semantic markup', () => {
    const html =
      '<h2>Title</h2><p>Body <strong>bold</strong> <em>italic</em></p><ul><li>One</li></ul>';
    expect(sanitizePastedHtml(html)).toBe(html);
  });

  it('strips inline styles, classes, and ids', () => {
    const html = '<p style="color: red" class="MsoNormal" id="x">Hello</p>';
    expect(sanitizePastedHtml(html)).toBe('<p>Hello</p>');
  });

  it('strips event handler attributes', () => {
    const html = '<p onclick="alert(1)">Hello</p>';
    expect(sanitizePastedHtml(html)).toBe('<p>Hello</p>');
  });

  it('removes script and style elements entirely', () => {
    const html = '<p>Safe</p><script>alert(1)</script><style>p{color:red}</style>';
    expect(sanitizePastedHtml(html)).toBe('<p>Safe</p>');
  });

  it('removes images and embeds', () => {
    const html = '<p>Text</p><img src="x.png" alt="x"><iframe src="https://evil.example"></iframe>';
    expect(sanitizePastedHtml(html)).toBe('<p>Text</p>');
  });

  it('handles Word-style markup (mso classes, o:p tags, font spans)', () => {
    const html =
      '<p class="MsoNormal" style="mso-margin-top-alt:auto"><span style="font-family:Calibri">Word text</span><o:p></o:p></p>';
    expect(sanitizePastedHtml(html)).toBe('<p>Word text</p>');
  });

  it('handles Google Docs-style markup (b wrapper with id, styled spans)', () => {
    const html =
      '<b id="docs-internal-guid-123" style="font-weight:normal"><p dir="ltr"><span style="font-size:11pt">Docs text</span></p></b>';
    expect(sanitizePastedHtml(html)).toBe('<b><p>Docs text</p></b>');
  });

  it('converts generic block containers to paragraphs', () => {
    const html = '<div>Block one</div><section>Block two</section>';
    expect(sanitizePastedHtml(html)).toBe('<p>Block one</p><p>Block two</p>');
  });

  it('keeps safe link hrefs and strips other link attributes', () => {
    const html =
      '<a href="https://example.com" target="_blank" rel="noopener" style="color:blue" onclick="x()">Link</a>';
    expect(sanitizePastedHtml(html)).toBe('<a href="https://example.com">Link</a>');
  });

  it('drops javascript: links but keeps their text', () => {
    const html = '<a href="javascript:alert(1)">Click me</a>';
    expect(sanitizePastedHtml(html)).toBe('Click me');
  });

  it('unwraps unsupported inline elements but keeps their content', () => {
    const html = '<p><font color="red">Old-school</font> <span>span text</span></p>';
    expect(sanitizePastedHtml(html)).toBe('<p>Old-school span text</p>');
  });

  it('removes HTML comments', () => {
    const html = '<p>Keep</p><!--[if mso]>conditional<![endif]-->';
    expect(sanitizePastedHtml(html)).toBe('<p>Keep</p>');
  });

  it('unwraps table fragments while keeping their text', () => {
    const html = '<table><tbody><tr><td>Cell text</td></tr></tbody></table>';
    expect(sanitizePastedHtml(html)).toBe('Cell text');
  });
});
