import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolbarPlugin } from '../components/ToolbarPlugin';
import { I18nextProvider } from 'react-i18next';
import i18n from '../utils/i18n';

// Mock Lexical API
const mockEditor = {
  update: jest.fn((callback) => callback()),
  dispatchCommand: jest.fn(),
  registerCommand: jest.fn(() => () => {}),
  registerUpdateListener: jest.fn(() => () => {}),
  focus: jest.fn(),
  getRootElement: jest.fn(() => null),
  getEditorState: jest.fn().mockReturnValue({
    read: jest.fn(cb => cb())
  }),
};

// Mock Lexical hooks
jest.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [mockEditor],
}));

// Mock Lexical commands
const mockSelection = {
  isRange: true,
  isCollapsed: jest.fn(() => false),
  getTextContent: jest.fn(() => 'selected text'),
  insertText: jest.fn(),
  modify: jest.fn(),
  clone: jest.fn(() => mockSelection),
  hasFormat: jest.fn(() => false),
  anchor: { getNode: jest.fn(() => ({ getParent: jest.fn(() => null) })) },
  focus: { getNode: jest.fn(() => ({ getParent: jest.fn(() => null) })) },
};

jest.mock('lexical', () => ({
  $getSelection: jest.fn(() => mockSelection),
  $isRangeSelection: jest.fn(() => true),
  $createParagraphNode: jest.fn(),
  KEY_ESCAPE_COMMAND: 'escape',
  COMMAND_PRIORITY_HIGH: 1,
  FORMAT_TEXT_COMMAND: 'format-text',
  SELECTION_CHANGE_COMMAND: 'selection-change',
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

jest.mock('@lexical/list', () => ({
  INSERT_ORDERED_LIST_COMMAND: 'insert-ordered-list',
  INSERT_UNORDERED_LIST_COMMAND: 'insert-unordered-list',
  REMOVE_LIST_COMMAND: 'remove-list',
  $isListNode: jest.fn(() => false),
  $isListItemNode: jest.fn(() => false),
}));

// Helper for rendering with i18n provider
const renderWithI18n = (component) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
};

describe('ToolbarPlugin Component', () => {
  let showDocs;
  let setShowDocs;
  let docsButtonRef;

  beforeEach(() => {
    showDocs = false;
    setShowDocs = jest.fn();
    docsButtonRef = { current: null };
    mockEditor.dispatchCommand.mockClear();
    mockEditor.update.mockClear();
    mockEditor.focus.mockClear();
  });

  it('renders the toolbar with formatting buttons', () => {
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

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

    // List buttons
    expect(screen.getByLabelText('Bullet List')).toBeInTheDocument();
    expect(screen.getByLabelText('Numbered List')).toBeInTheDocument();

    // Help button
    expect(screen.getByLabelText('Show keyboard shortcuts help')).toBeInTheDocument();
  });

  it('all toolbar buttons have type="button"', () => {
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('dispatches FORMAT_TEXT_COMMAND when bold button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const boldButton = screen.getByLabelText('Bold');
    await user.click(boldButton);

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('format-text', 'bold');
  });

  it('dispatches FORMAT_TEXT_COMMAND when italic button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const italicButton = screen.getByLabelText('Italic');
    await user.click(italicButton);

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('format-text', 'italic');
  });

  it('dispatches FORMAT_TEXT_COMMAND when underline button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const underlineButton = screen.getByLabelText('Underline');
    await user.click(underlineButton);

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('format-text', 'underline');
  });

  it('dispatches FORMAT_TEXT_COMMAND when strikethrough button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const strikethroughButton = screen.getByLabelText('Strikethrough');
    await user.click(strikethroughButton);

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('format-text', 'strikethrough');
  });

  it('applies heading formatting when H1 button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const h1Button = screen.getByLabelText('H1');
    await user.click(h1Button);

    expect(mockEditor.update).toHaveBeenCalled();
  });

  it('registers escape key command handler', () => {
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    expect(mockEditor.registerCommand).toHaveBeenCalledWith(
      'escape',
      expect.any(Function),
      1
    );
  });

  it('opens link dialog when link button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const linkButton = screen.getByLabelText('Link');
    await user.click(linkButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Show keyboard shortcuts help')).toBeInTheDocument();
  });

  it('link dialog has h2 heading element', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const linkButton = screen.getByLabelText('Link');
    await user.click(linkButton);

    const dialogTitle = screen.getByText('Insert Link');
    expect(dialogTitle.tagName).toBe('H2');
  });

  it('link dialog has cancel and insert buttons with type="button"', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const linkButton = screen.getByLabelText('Link');
    await user.click(linkButton);

    const cancelButton = screen.getByText('Cancel');
    const insertButton = screen.getByText('Insert');
    expect(cancelButton).toHaveAttribute('type', 'button');
    expect(insertButton).toHaveAttribute('type', 'button');
  });

  it('toggles showDocs when help button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const helpButton = screen.getByLabelText('Show keyboard shortcuts help');
    await user.click(helpButton);

    expect(setShowDocs).toHaveBeenCalled();
  });

  it('help button has aria-pressed attribute', () => {
    renderWithI18n(
      <ToolbarPlugin showDocs={true} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    const helpButton = screen.getByLabelText('Show keyboard shortcuts help');
    expect(helpButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('assigns docsButtonRef to help button', () => {
    renderWithI18n(
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} docsButtonRef={docsButtonRef} />
    );

    expect(docsButtonRef.current).not.toBeNull();
    expect(docsButtonRef.current).toHaveClass('docs-button');
  });
});
