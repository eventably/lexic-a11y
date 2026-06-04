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
}));

jest.mock('@lexical/table', () => ({
  INSERT_TABLE_COMMAND: 'insert-table',
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

  describe('table insertion', () => {
    it('opens the table dialog with accessible defaults', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

      await user.click(screen.getByLabelText('Insert Table'));

      expect(screen.getByRole('dialog', { name: 'Insert Table' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Rows/)).toHaveValue(3);
      expect(screen.getByLabelText(/Columns/)).toHaveValue(3);
      // Header row on by default for accessible tables
      expect(screen.getByLabelText(/Include header row/)).toBeChecked();
    });

    it('dispatches INSERT_TABLE_COMMAND with rows, columns, and headers', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

      await user.click(screen.getByLabelText('Insert Table'));
      await user.click(screen.getByRole('button', { name: 'Insert' }));

      expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('insert-table', {
        rows: '3',
        columns: '3',
        includeHeaders: true,
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('respects custom dimensions and header choice', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

      await user.click(screen.getByLabelText('Insert Table'));
      const rowsInput = screen.getByLabelText(/Rows/);
      const columnsInput = screen.getByLabelText(/Columns/);
      await user.clear(rowsInput);
      await user.type(rowsInput, '2');
      await user.clear(columnsInput);
      await user.type(columnsInput, '5');
      await user.click(screen.getByLabelText(/Include header row/));
      await user.click(screen.getByRole('button', { name: 'Insert' }));

      expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('insert-table', {
        rows: '2',
        columns: '5',
        includeHeaders: false,
      });
    });

    it('disables Insert for invalid dimensions', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

      await user.click(screen.getByLabelText('Insert Table'));
      await user.clear(screen.getByLabelText(/Rows/));

      expect(screen.getByRole('button', { name: 'Insert' })).toBeDisabled();
    });

    it('cancels without inserting', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ToolbarPlugin showDocs={false} setShowDocs={setShowDocs} />);

      await user.click(screen.getByLabelText('Insert Table'));
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockEditor.dispatchCommand).not.toHaveBeenCalledWith(
        'insert-table',
        expect.anything(),
      );
    });
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
