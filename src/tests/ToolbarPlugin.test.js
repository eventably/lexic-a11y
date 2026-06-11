import { $createQuoteNode, $isQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { $createParagraphNode } from 'lexical';
import { I18nextProvider } from 'react-i18next';

import { ToolbarPlugin } from '../components/ToolbarPlugin';
import i18n from '../utils/i18n';

// Mock Lexical API
const mockEditor = {
  update: jest.fn((callback) => callback()),
  dispatchCommand: jest.fn(),
  registerCommand: jest.fn(() => () => {}),
  registerUpdateListener: jest.fn(() => () => {}),
  focus: jest.fn(),
  getEditorState: jest.fn().mockReturnValue({
    read: jest.fn((cb) => cb()),
  }),
};

// Mock Lexical hooks
jest.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [mockEditor],
}));

// Mock Lexical commands
const mockAnchorNode = {
  getParent: jest.fn(() => null),
};

const mockSelection = {
  isRange: true,
  isCollapsed: jest.fn(() => false),
  getTextContent: jest.fn(() => 'selected text'),
  insertText: jest.fn(),
  insertNodes: jest.fn(),
  modify: jest.fn(),
  hasFormat: jest.fn(() => false),
  anchor: {
    getNode: jest.fn(() => mockAnchorNode),
  },
  focus: {
    getNode: jest.fn(() => mockAnchorNode),
  },
};

jest.mock('lexical', () => {
  class ElementNode {}
  class TextNode {}
  return {
    $getSelection: jest.fn(() => mockSelection),
    $isRangeSelection: jest.fn(() => true),
    $createParagraphNode: jest.fn(() => ({})),
    KEY_ESCAPE_COMMAND: 'escape',
    COMMAND_PRIORITY_HIGH: 1,
    COMMAND_PRIORITY_LOW: 0,
    FORMAT_TEXT_COMMAND: 'format-text',
    UNDO_COMMAND: 'undo',
    REDO_COMMAND: 'redo',
    CAN_UNDO_COMMAND: 'can-undo',
    CAN_REDO_COMMAND: 'can-redo',
    ElementNode,
    TextNode,
  };
});

jest.mock('@lexical/list', () => ({
  INSERT_ORDERED_LIST_COMMAND: 'insert-ordered-list',
  INSERT_UNORDERED_LIST_COMMAND: 'insert-unordered-list',
  REMOVE_LIST_COMMAND: 'remove-list',
  $isListNode: jest.fn(() => false),
  $isListItemNode: jest.fn(() => false),
}));

jest.mock('@lexical/selection', () => ({
  $setBlocksType: jest.fn(),
}));

jest.mock('@lexical/rich-text', () => ({
  $createHeadingNode: jest.fn(() => ({})),
  $isHeadingNode: jest.fn(() => false),
  $createQuoteNode: jest.fn(() => ({})),
  $isQuoteNode: jest.fn(() => false),
}));

jest.mock('@lexical/link', () => ({
  TOGGLE_LINK_COMMAND: 'toggle-link',
}));

jest.mock('@lexical/react/LexicalHorizontalRuleNode', () => ({
  INSERT_HORIZONTAL_RULE_COMMAND: 'insert-horizontal-rule',
}));

// Helper for rendering with i18n provider
const renderWithI18n = (component) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
};

describe('ToolbarPlugin Component', () => {
  let setShowDocs;

  beforeEach(() => {
    setShowDocs = jest.fn();
    mockEditor.dispatchCommand.mockClear();
    mockEditor.update.mockClear();
    mockEditor.registerCommand.mockClear();
    mockEditor.registerUpdateListener.mockClear();
  });

  it('renders the toolbar with formatting buttons', () => {
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByLabelText('Bold')).toBeInTheDocument();
    expect(screen.getByLabelText('Italic')).toBeInTheDocument();
    expect(screen.getByLabelText('Underline')).toBeInTheDocument();
    expect(screen.getByLabelText('Strikethrough')).toBeInTheDocument();

    // Heading buttons
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByLabelText(`H${i}`)).toBeInTheDocument();
    }

    // Link button
    expect(screen.getByLabelText('Insert Link')).toBeInTheDocument();
  });

  it('dispatches bold command when bold button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const boldButton = screen.getByLabelText('Bold');
    await user.click(boldButton);

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('format-text', 'bold');
  });

  it('dispatches italic command when italic button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const italicButton = screen.getByLabelText('Italic');
    await user.click(italicButton);

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('format-text', 'italic');
  });

  it('dispatches underline command when underline button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const underlineButton = screen.getByLabelText('Underline');
    await user.click(underlineButton);

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('format-text', 'underline');
  });

  it('dispatches strikethrough command when strikethrough button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const strikethroughButton = screen.getByLabelText('Strikethrough');
    await user.click(strikethroughButton);

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('format-text', 'strikethrough');
  });

  it('applies heading formatting when H1 button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const h1Button = screen.getByLabelText('H1');
    await user.click(h1Button);

    expect(mockEditor.update).toHaveBeenCalled();
  });

  // Helper to find a command handler registered with the mock editor
  const getRegisteredHandler = (command) => {
    const call = mockEditor.registerCommand.mock.calls.find(([cmd]) => cmd === command);
    return call ? call[1] : null;
  };

  it('renders undo and redo buttons disabled by default', () => {
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const undoButton = screen.getByLabelText('Undo');
    const redoButton = screen.getByLabelText('Redo');

    expect(undoButton).toBeInTheDocument();
    expect(redoButton).toBeInTheDocument();
    // aria-disabled (not native disabled) so the controls stay in the tab order
    // and are announced as disabled rather than disappearing for AT users.
    expect(undoButton).toBeEnabled();
    expect(redoButton).toBeEnabled();
    expect(undoButton).toHaveAttribute('aria-disabled', 'true');
    expect(redoButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not dispatch undo while unavailable but stays focusable', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const undoButton = screen.getByLabelText('Undo');
    undoButton.focus();
    expect(undoButton).toHaveFocus();

    await user.click(undoButton);
    expect(mockEditor.dispatchCommand).not.toHaveBeenCalledWith('undo', undefined);
  });

  it('registers listeners for undo/redo availability', () => {
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    expect(getRegisteredHandler('can-undo')).toEqual(expect.any(Function));
    expect(getRegisteredHandler('can-redo')).toEqual(expect.any(Function));
  });

  it('enables the undo button when undo becomes available and dispatches UNDO_COMMAND', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    // Simulate the editor reporting undo availability
    act(() => {
      getRegisteredHandler('can-undo')(true);
    });

    const undoButton = screen.getByLabelText('Undo');
    expect(undoButton).toBeEnabled();
    expect(undoButton).toHaveAttribute('aria-disabled', 'false');

    await user.click(undoButton);
    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('undo', undefined);
  });

  it('enables the redo button when redo becomes available and dispatches REDO_COMMAND', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    // Simulate the editor reporting redo availability
    act(() => {
      getRegisteredHandler('can-redo')(true);
    });

    const redoButton = screen.getByLabelText('Redo');
    expect(redoButton).toBeEnabled();
    expect(redoButton).toHaveAttribute('aria-disabled', 'false');

    await user.click(redoButton);
    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('redo', undefined);
  });

  it('disables the undo button again when undo becomes unavailable', () => {
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    act(() => {
      getRegisteredHandler('can-undo')(true);
    });
    expect(screen.getByLabelText('Undo')).toBeEnabled();

    act(() => {
      getRegisteredHandler('can-undo')(false);
    });
    expect(screen.getByLabelText('Undo')).toHaveAttribute('aria-disabled', 'true');
  });
  it('renders the blockquote button with aria-pressed state', () => {
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const quoteButton = screen.getByLabelText('Blockquote');
    expect(quoteButton).toBeInTheDocument();
    expect(quoteButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles blockquote formatting when blockquote button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const quoteButton = screen.getByLabelText('Blockquote');
    await user.click(quoteButton);

    expect(mockEditor.update).toHaveBeenCalled();
  });

  it('applies a quote block when the selection is not already a quote', async () => {
    const user = userEvent.setup();
    $setBlocksType.mockClear();
    $createQuoteNode.mockClear();
    $isQuoteNode.mockReturnValue(false);

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);
    await user.click(screen.getByLabelText('Blockquote'));

    expect($setBlocksType).toHaveBeenCalled();
    // The block creator passed to $setBlocksType must produce a quote node
    const creator = $setBlocksType.mock.calls[$setBlocksType.mock.calls.length - 1][1];
    creator();
    expect($createQuoteNode).toHaveBeenCalled();
  });

  it('converts back to a paragraph when the selection is already a quote', async () => {
    const user = userEvent.setup();
    $setBlocksType.mockClear();
    $createParagraphNode.mockClear();
    $isQuoteNode.mockReturnValue(true);

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);
    await user.click(screen.getByLabelText('Blockquote'));

    expect($setBlocksType).toHaveBeenCalled();
    // The block creator passed to $setBlocksType must produce a paragraph node
    const creator = $setBlocksType.mock.calls[$setBlocksType.mock.calls.length - 1][1];
    creator();
    expect($createParagraphNode).toHaveBeenCalled();

    $isQuoteNode.mockReturnValue(false);
  });

  it('toggles blockquote with the Ctrl+Shift+Q keyboard shortcut', () => {
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    fireEvent.keyDown(document, { key: 'Q', ctrlKey: true, shiftKey: true });

    expect(mockEditor.update).toHaveBeenCalled();
  });

  it('renders the horizontal rule button', () => {
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    expect(screen.getByLabelText('Insert Horizontal Rule')).toBeInTheDocument();
  });

  it('dispatches INSERT_HORIZONTAL_RULE_COMMAND when the horizontal rule button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    await user.click(screen.getByLabelText('Insert Horizontal Rule'));

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('insert-horizontal-rule', undefined);
  });

  it('registers escape key command handler', () => {
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    expect(mockEditor.registerCommand).toHaveBeenCalledWith(
      'escape',
      expect.any(Function),
      1, // COMMAND_PRIORITY_HIGH
    );
  });

  it('registers update listener on mount', () => {
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    expect(mockEditor.registerUpdateListener).toHaveBeenCalled();
  });

  it('initializes the link dialog when link button is clicked', async () => {
    const user = userEvent.setup();

    mockSelection.getTextContent.mockReturnValueOnce('test link text');

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const linkButton = screen.getByLabelText('Insert Link');
    await user.click(linkButton);

    // Verify editor state was read to get selection
    expect(mockEditor.getEditorState().read).toHaveBeenCalled();
  });
});
