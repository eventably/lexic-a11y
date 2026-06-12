import { $createImageNode, $isImageNode, ImageNode } from '../components/ImageNode';

// DecoratorNode needs an active editor in real Lexical; a plain class is
// enough to unit test ImageNode's own behavior
jest.mock('lexical', () => ({
  DecoratorNode: class DecoratorNode {
    constructor(key) {
      this.__key = key;
    }
  },
}));

describe('ImageNode', () => {
  it('creates a node with alt text', () => {
    const node = $createImageNode({ src: 'https://example.com/cat.png', alt: 'A cat' });

    expect($isImageNode(node)).toBe(true);
    expect(node.getSrc()).toBe('https://example.com/cat.png');
    expect(node.getAltText()).toBe('A cat');
    expect(node.isDecorative()).toBe(false);
  });

  it('exports accessible markup for meaningful images', () => {
    const node = $createImageNode({ src: 'cat.png', alt: 'A cat' });
    const { element } = node.exportDOM();

    expect(element.tagName).toBe('IMG');
    expect(element.getAttribute('src')).toBe('cat.png');
    expect(element.getAttribute('alt')).toBe('A cat');
    expect(element.hasAttribute('role')).toBe(false);
  });

  it('exports alt="" and role="presentation" for decorative images', () => {
    const node = $createImageNode({ src: 'flourish.png', alt: '', decorative: true });
    const { element } = node.exportDOM();

    expect(element.getAttribute('alt')).toBe('');
    expect(element.getAttribute('role')).toBe('presentation');
  });

  it('round-trips through JSON preserving accessibility data', () => {
    const node = $createImageNode({ src: 'cat.png', alt: 'A cat', decorative: false });
    const restored = ImageNode.importJSON(node.exportJSON());

    expect(restored.getSrc()).toBe('cat.png');
    expect(restored.getAltText()).toBe('A cat');
    expect(restored.isDecorative()).toBe(false);
  });

  it('renders decorative images with alt="" and role="presentation"', () => {
    const node = $createImageNode({ src: 'x.png', alt: '', decorative: true });
    const rendered = node.decorate();

    expect(rendered.props.alt).toBe('');
    expect(rendered.props.role).toBe('presentation');
  });

  it('renders meaningful images with their alt text', () => {
    const node = $createImageNode({ src: 'x.png', alt: 'Chart of Q3 sales' });
    const rendered = node.decorate();

    expect(rendered.props.alt).toBe('Chart of Q3 sales');
    expect(rendered.props.role).toBeUndefined();
  });

  it('imports <img> elements, treating missing alt as decorative', () => {
    const img = document.createElement('img');
    img.setAttribute('src', 'imported.png');
    const { conversion } = ImageNode.importDOM().img();
    const result = conversion(img);

    expect(result.node.getSrc()).toBe('imported.png');
    expect(result.node.isDecorative()).toBe(true);
  });

  it('ignores <img> elements without a src', () => {
    const img = document.createElement('img');
    const { conversion } = ImageNode.importDOM().img();

    expect(conversion(img)).toBeNull();
  });
});
