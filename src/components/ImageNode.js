// ImageNode.js
import { DecoratorNode } from 'lexical';

// Convert a pasted/imported <img> element into an ImageNode. Images without
// alt text are imported as decorative rather than silently inaccessible.
function convertImageElement(domNode) {
  const src = domNode.getAttribute('src');
  if (!src) return null;
  const alt = domNode.getAttribute('alt') || '';
  const decorative = alt === '';
  return { node: $createImageNode({ src, alt, decorative }) };
}

/**
 * Block-level image node that always carries accessibility information:
 * either meaningful alt text, or an explicit decorative flag which renders
 * alt="" and role="presentation".
 */
export class ImageNode extends DecoratorNode {
  __src;

  __alt;

  __decorative;

  static getType() {
    return 'image';
  }

  static clone(node) {
    return new ImageNode(node.__src, node.__alt, node.__decorative, node.__key);
  }

  constructor(src, alt, decorative, key) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__decorative = Boolean(decorative);
  }

  static importJSON(serializedNode) {
    return $createImageNode({
      src: serializedNode.src,
      alt: serializedNode.alt,
      decorative: serializedNode.decorative,
    });
  }

  exportJSON() {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
      decorative: this.__decorative,
    };
  }

  static importDOM() {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  exportDOM() {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    if (this.__decorative) {
      element.setAttribute('alt', '');
      element.setAttribute('role', 'presentation');
    } else {
      element.setAttribute('alt', this.__alt);
    }
    return { element };
  }

  createDOM() {
    const span = document.createElement('span');
    span.className = 'editor-image';
    return span;
  }

  updateDOM() {
    return false;
  }

  getSrc() {
    return this.__src;
  }

  getAltText() {
    return this.__decorative ? '' : this.__alt;
  }

  isDecorative() {
    return this.__decorative;
  }

  decorate() {
    if (this.__decorative) {
      return <img src={this.__src} alt="" role="presentation" />;
    }
    return <img src={this.__src} alt={this.__alt} />;
  }
}

export function $createImageNode({ src, alt = '', decorative = false }) {
  return new ImageNode(src, alt, decorative);
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}
