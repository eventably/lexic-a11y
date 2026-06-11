import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

// Mock text nodes returned by selection.getNodes() for clear-formatting tests
const mockTextNodes = [
  { setFormat: jest.fn(), setStyle: jest.fn() },
  { setFormat: jest.fn(), setStyle: jest.fn() },
];

const mockSelection = {
  isRange: true,
  isCollapsed: jest.fn(() => false),
  getTextContent: jest.fn(() => 'selected text'),
  getNodes: jest.fn(() => mockTextNodes),
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
    $isTextNode: jest.fn(() => true),
    $createParagraphNode: jest.fn(() => ({})),
    KEY_ESCAPE_COMMAND: 'escape',
    COMMAND_PRIORITY_HIGH: 1,
    FORMAT_TEXT_COMMAND: 'format-text',
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
}));

jest.mock('@lexical/link', () => ({
  TOGGLE_LINK_COMMAND: 'toggle-link',
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
    expect(screen.getByLabelText('Link')).toBeInTheDocument();
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

  it('renders the clear formatting button', () => {
    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const clearButton = screen.getByLabelText('Clear Formatting');
    expect(clearButton).toBeInTheDocument();
    // Action button, not a toggle — must not expose aria-pressed
    expect(clearButton).not.toHaveAttribute('aria-pressed');
  });

  it('clears inline formats and resets blocks when clear formatting is clicked', async () => {
    const user = userEvent.setup();
    const { $setBlocksType } = require('@lexical/selection');
    const { $createParagraphNode } = require('lexical');
    $setBlocksType.mockClear();
    $createParagraphNode.mockClear();
    mockTextNodes.forEach((node) => {
      node.setFormat.mockClear();
      node.setStyle.mockClear();
    });

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);
    await user.click(screen.getByLabelText('Clear Formatting'));

    expect(mockEditor.update).toHaveBeenCalled();

    // Inline marks and styles cleared on every selected text node
    mockTextNodes.forEach((node) => {
      expect(node.setFormat).toHaveBeenCalledWith(0);
      expect(node.setStyle).toHaveBeenCalledWith('');
    });

    // Blocks reset to paragraphs
    expect($setBlocksType).toHaveBeenCalled();
    const creator = $setBlocksType.mock.calls[$setBlocksType.mock.calls.length - 1][1];
    creator();
    expect($createParagraphNode).toHaveBeenCalled();

    // No list present here, so the list-removal command is not dispatched
    expect(mockEditor.dispatchCommand).not.toHaveBeenCalledWith('remove-list', undefined);
  });

  it('removes list formatting when clearing a list selection', async () => {
    const user = userEvent.setup();
    const { $isListItemNode } = require('@lexical/list');
    $isListItemNode.mockReturnValue(true);

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);
    await user.click(screen.getByLabelText('Clear Formatting'));

    // List blocks are unwrapped via REMOVE_LIST_COMMAND ($setBlocksType can't)
    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('remove-list', undefined);

    $isListItemNode.mockReturnValue(false);
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

    const linkButton = screen.getByLabelText('Link');
    await user.click(linkButton);

    // Verify editor state was read to get selection
    expect(mockEditor.getEditorState().read).toHaveBeenCalled();
  });
});
