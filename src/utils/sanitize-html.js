// sanitize-html.js
// Sanitize pasted HTML down to the node set the editor supports.

// Tags kept as-is (attributes stripped, except a[href])
const ALLOWED_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'UL',
  'OL',
  'LI',
  'BLOCKQUOTE',
  'A',
  'BR',
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'S',
  'STRIKE',
  'DEL',
]);

// Tags removed together with their content
const DROPPED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'META',
  'LINK',
  'TITLE',
  'HEAD',
  'IMG',
  'SVG',
  'VIDEO',
  'AUDIO',
  'CANVAS',
  'FORM',
  'INPUT',
  'BUTTON',
  'SELECT',
  'TEXTAREA',
]);

// Block-ish containers mapped to <p> so their text keeps block structure
const BLOCK_TO_PARAGRAPH = new Set(['DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER']);

const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;

function sanitizeElement(element, doc) {
  // Process children first (live childNodes — copy before mutating)
  Array.from(element.childNodes).forEach((child) => {
    if (child.nodeType === 1) {
      sanitizeElement(child, doc);
    } else if (child.nodeType !== 3) {
      // Drop comments, processing instructions, etc.
      child.remove();
    }
  });

  // Uppercase so foreign-content elements (SVG/MathML) — whose tagName preserves
  // case, e.g. 'svg' — still match the uppercase tag sets below.
  const tag = element.tagName.toUpperCase();

  if (DROPPED_TAGS.has(tag)) {
    element.remove();
    return;
  }

  if (ALLOWED_TAGS.has(tag)) {
    // Strip every attribute; keep only a safe href on links
    const href = tag === 'A' ? element.getAttribute('href') : null;
    Array.from(element.attributes).forEach((attr) => element.removeAttribute(attr.name));
    if (tag === 'A') {
      if (href && SAFE_HREF.test(href.trim())) {
        element.setAttribute('href', href.trim());
      } else {
        // Unsafe or missing href: keep the text, drop the link
        unwrap(element);
      }
    }
    return;
  }

  if (BLOCK_TO_PARAGRAPH.has(tag)) {
    const p = doc.createElement('p');
    while (element.firstChild) {
      p.appendChild(element.firstChild);
    }
    element.replaceWith(p);
    return;
  }

  // Anything else (span, font, o:p, table fragments…): unwrap, keep children
  unwrap(element);
}

function unwrap(element) {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  element.remove();
}

/**
 * Sanitize an HTML string pasted into the editor.
 *
 * Normalizes content to the editor's supported tags, strips inline styles,
 * classes, ids, event handlers and unsafe URLs, removes scripts/embeds/images,
 * and converts generic block containers to paragraphs.
 *
 * @param {string} html raw clipboard HTML
 * @returns {string} sanitized HTML
 */
export function sanitizePastedHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  Array.from(doc.body.childNodes).forEach((child) => {
    if (child.nodeType === 1) {
      sanitizeElement(child, doc);
    } else if (child.nodeType !== 3) {
      child.remove();
    }
  });
  return doc.body.innerHTML;
}
