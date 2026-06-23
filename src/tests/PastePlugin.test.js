import { fireEvent, render } from '@testing-library/react';

import { PastePlugin } from '../components/PastePlugin';

// Capture the PASTE_COMMAND handler registered with the editor
let pasteHandler = null;

// The editor root element the keydown listener is attached to
let rootEl = null;

const mockEditor = {
  registerCommand: jest.fn((command, handler) => {
    if (command === 'paste') {
      pasteHandler = handler;
    }
    return () => {
      pasteHandler = null;
    };
  }),
  registerRootListener: jest.fn((cb) => {
    rootEl = document.createElement('div');
    cb(rootEl, null);
    return () => {};
  }),
  update: jest.fn((cb) => cb()),
};

jest.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [mockEditor],
}));

const mockSelection = {
  insertRawText: jest.fn(),
  insertNodes: jest.fn(),
};

jest.mock('lexical', () => ({
  $getSelection: jest.fn(() => mockSelection),
  $isRangeSelection: jest.fn(() => true),
  COMMAND_PRIORITY_HIGH: 1,
  PASTE_COMMAND: 'paste',
}));

const mockGeneratedNodes = [{ type: 'paragraph' }];
jest.mock('@lexical/html', () => ({
  $generateNodesFromDOM: jest.fn(() => mockGeneratedNodes),
}));

const makePasteEvent = ({ html, text }) => ({
  preventDefault: jest.fn(),
  clipboardData: {
    getData: (type) => {
      if (type === 'text/html') return html || '';
      if (type === 'text/plain') return text || '';
      return '';
    },
  },
});

describe('PastePlugin', () => {
  beforeEach(() => {
    mockEditor.update.mockClear();
    mockSelection.insertRawText.mockClear();
    mockSelection.insertNodes.mockClear();
  });

  it('registers a PASTE_COMMAND handler', () => {
    render(<PastePlugin />);
    expect(pasteHandler).toEqual(expect.any(Function));
  });

  it('sanitizes HTML pastes and inserts the generated nodes', () => {
    const { $generateNodesFromDOM } = require('@lexical/html');
    render(<PastePlugin />);

    const event = makePasteEvent({
      html: '<p style="color:red" class="MsoNormal">Hello</p><script>x()</script>',
      text: 'Hello',
    });
    const handled = pasteHandler(event);

    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockSelection.insertNodes).toHaveBeenCalledWith(mockGeneratedNodes);

    // The DOM handed to Lexical must already be sanitized
    const dom = $generateNodesFromDOM.mock.calls[$generateNodesFromDOM.mock.calls.length - 1][1];
    expect(dom.body.innerHTML).toBe('<p>Hello</p>');
  });

  it('falls back to plain text when the clipboard has no HTML', () => {
    render(<PastePlugin />);

    const event = makePasteEvent({ text: 'just text' });
    const handled = pasteHandler(event);

    expect(handled).toBe(true);
    expect(mockSelection.insertRawText).toHaveBeenCalledWith('just text');
    expect(mockSelection.insertNodes).not.toHaveBeenCalled();
  });

  it('pastes as plain text after Ctrl+Shift+V even when HTML is available', () => {
    render(<PastePlugin />);

    fireEvent.keyDown(rootEl, { key: 'V', ctrlKey: true, shiftKey: true });
    const event = makePasteEvent({ html: '<p><strong>rich</strong></p>', text: 'rich' });
    const handled = pasteHandler(event);

    expect(handled).toBe(true);
    expect(mockSelection.insertRawText).toHaveBeenCalledWith('rich');
    expect(mockSelection.insertNodes).not.toHaveBeenCalled();
  });

  it('only applies the plain-text mode to the next paste', () => {
    render(<PastePlugin />);

    fireEvent.keyDown(rootEl, { key: 'V', ctrlKey: true, shiftKey: true });
    pasteHandler(makePasteEvent({ html: '<p>one</p>', text: 'one' }));
    mockSelection.insertRawText.mockClear();

    pasteHandler(makePasteEvent({ html: '<p>two</p>', text: 'two' }));
    expect(mockSelection.insertRawText).not.toHaveBeenCalled();
    expect(mockSelection.insertNodes).toHaveBeenCalled();
  });

  it('does not handle events without clipboard data', () => {
    render(<PastePlugin />);

    expect(pasteHandler({ preventDefault: jest.fn() })).toBe(false);
  });
});
