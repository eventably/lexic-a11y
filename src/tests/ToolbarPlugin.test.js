import { $isLinkNode } from '@lexical/link';
import { act, fireEvent, render, screen } from '@testing-library/react';
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
  getURL: jest.fn(() => 'https://example.com'),
  getTextContent: jest.fn(() => 'Example link'),
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
  $isLinkNode: jest.fn(() => false),
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

  it('opens the accessible link dialog with Ctrl+K instead of window.prompt', () => {
    const promptSpy = jest.fn();
    window.prompt = promptSpy;

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(promptSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/URL/)).toBeInTheDocument();
  });

  it('reflects cursor-in-link state on the link button via aria-pressed', () => {
    $isLinkNode.mockReturnValue(true);

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    const linkButton = screen.getByLabelText('Edit Link');
    expect(linkButton).toHaveAttribute('aria-pressed', 'true');

    $isLinkNode.mockReturnValue(false);
  });

  it('pre-fills the dialog with the existing link URL and text in edit mode', async () => {
    const user = userEvent.setup();
    $isLinkNode.mockReturnValue(true);

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    await user.click(screen.getByLabelText('Edit Link'));

    expect(screen.getByRole('heading', { name: 'Edit Link' })).toBeInTheDocument();
    expect(screen.getByLabelText(/URL/)).toHaveValue('https://example.com');
    expect(screen.getByLabelText(/Text/)).toHaveValue('Example link');

    $isLinkNode.mockReturnValue(false);
  });

  it('removes an existing link via the Remove Link button', async () => {
    const user = userEvent.setup();
    $isLinkNode.mockReturnValue(true);

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    await user.click(screen.getByLabelText('Edit Link'));
    await user.click(screen.getByRole('button', { name: 'Remove Link' }));

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('toggle-link', null);
    // Dialog closes and focus returns to the editor
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockEditor.focus).toHaveBeenCalled();

    $isLinkNode.mockReturnValue(false);
  });

  it('does not show Remove Link when inserting a new link', async () => {
    const user = userEvent.setup();

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    await user.click(screen.getByLabelText('Link'));

    expect(screen.getByRole('heading', { name: 'Insert Link' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove Link' })).not.toBeInTheDocument();
  });

  it('returns focus to the editor when the dialog is cancelled', async () => {
    const user = userEvent.setup();

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    await user.click(screen.getByLabelText('Link'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockEditor.focus).toHaveBeenCalled();
  });

  it('rejects a javascript: URL: disables Insert, shows an error, dispatches nothing', async () => {
    const user = userEvent.setup();

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    await user.click(screen.getByLabelText('Link'));
    await user.type(screen.getByLabelText(/URL/), 'javascript:alert(1)');

    const insertButton = screen.getByRole('button', { name: 'Insert' });
    expect(insertButton).toBeDisabled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByLabelText(/URL/)).toHaveAttribute('aria-invalid', 'true');

    // Even if the click somehow fires, no link command is dispatched.
    await user.click(insertButton);
    expect(mockEditor.dispatchCommand).not.toHaveBeenCalledWith('toggle-link', expect.anything());
  });

  it('enables Insert for a safe https URL', async () => {
    const user = userEvent.setup();

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    await user.click(screen.getByLabelText('Link'));
    await user.type(screen.getByLabelText(/URL/), 'https://example.com');

    expect(screen.getByRole('button', { name: 'Insert' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('edits an existing link in place without duplicating its text', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // Cursor is inside a link: $isLinkNode true => edit mode, and findLinkNode
    // returns the anchor node, which must behave like a LinkNode.
    $isLinkNode.mockReturnValue(true);
    mockAnchorNode.select = jest.fn();
    mockAnchorNode.getChildrenSize = jest.fn(() => 1);
    mockSelection.insertText.mockClear();
    mockEditor.dispatchCommand.mockClear();

    renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

    // Edit mode prefills the URL (https://example.com); submit it.
    await user.click(screen.getByLabelText('Edit Link'));
    await user.click(screen.getByRole('button', { name: 'Insert' }));

    // The update runs on a 50ms timeout after the dialog closes.
    act(() => {
      jest.advanceTimersByTime(60);
    });

    // The existing link's contents are selected and its URL updated in place;
    // the link text is NOT re-inserted (the bug this guards against).
    expect(mockAnchorNode.select).toHaveBeenCalled();
    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('toggle-link', {
      url: 'https://example.com',
      target: '_blank',
    });
    expect(mockSelection.insertText).not.toHaveBeenCalled();

    $isLinkNode.mockReturnValue(false);
    jest.useRealTimers();
  });
});
