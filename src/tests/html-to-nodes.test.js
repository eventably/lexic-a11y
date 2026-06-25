import { htmlToNodes } from '../utils/html-to-nodes';

jest.mock('@lexical/html', () => ({
  $generateNodesFromDOM: jest.fn(() => ['node-a', 'node-b']),
}));

describe('htmlToNodes', () => {
  beforeEach(() => {
    const { $generateNodesFromDOM } = require('@lexical/html');
    $generateNodesFromDOM.mockClear();
  });

  it('parses HTML and delegates to $generateNodesFromDOM with a parsed document', () => {
    const { $generateNodesFromDOM } = require('@lexical/html');
    const editor = { id: 'editor' };

    const nodes = htmlToNodes(editor, '<p>Hello</p>');

    expect($generateNodesFromDOM).toHaveBeenCalledTimes(1);
    const [passedEditor, passedDom] = $generateNodesFromDOM.mock.calls[0];
    expect(passedEditor).toBe(editor);
    // A real parsed HTML document whose body carries the supplied markup.
    expect(passedDom.body.querySelector('p').textContent).toBe('Hello');
    expect(nodes).toEqual(['node-a', 'node-b']);
  });
});
