import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Editor from '../components/Editor';
import { I18nextProvider } from 'react-i18next';
import i18n from '../utils/i18n';

// Mock the Lexical components and plugins
jest.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: jest.fn(() => [{
    update: jest.fn(),
    focus: jest.fn(),
    getRootElement: jest.fn(() => null),
    getEditorState: jest.fn().mockReturnValue({
      read: jest.fn(cb => cb())
    }),
    registerCommand: jest.fn(() => () => {}),
    registerUpdateListener: jest.fn(() => () => {}),
  }]),
}));

jest.mock('@lexical/react/LexicalComposer', () => ({
  LexicalComposer: ({ children }) => <div data-testid="lexical-composer">{children}</div>,
}));

jest.mock('@lexical/react/LexicalRichTextPlugin', () => ({
  RichTextPlugin: ({ contentEditable, placeholder }) => (
    <div data-testid="rich-text-plugin">
      {contentEditable}
      {placeholder}
    </div>
  ),
}));

jest.mock('@lexical/react/LexicalContentEditable', () => ({
  ContentEditable: (props) => <div data-testid="content-editable" {...props} />,
}));

jest.mock('@lexical/react/LexicalHistoryPlugin', () => ({
  HistoryPlugin: () => <div data-testid="history-plugin" />,
}));

jest.mock('@lexical/react/LexicalOnChangePlugin', () => ({
  OnChangePlugin: () => <div data-testid="on-change-plugin" />,
}));

jest.mock('@lexical/react/LexicalErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('@lexical/react/LexicalLinkPlugin', () => ({
  LinkPlugin: () => <div data-testid="link-plugin" />,
}));

jest.mock('@lexical/react/LexicalListPlugin', () => ({
  ListPlugin: () => <div data-testid="list-plugin" />,
}));

jest.mock('@lexical/html', () => ({
  $generateHtmlFromNodes: () => '<p>Test HTML Output</p>',
}));

jest.mock('lexical', () => ({
  $getSelection: jest.fn(() => null),
  $isRangeSelection: jest.fn(() => false),
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
  HeadingNode: {},
  QuoteNode: {},
  $createHeadingNode: jest.fn(() => ({})),
  $isHeadingNode: jest.fn(() => false),
}));

jest.mock('@lexical/link', () => ({
  LinkNode: {},
  TOGGLE_LINK_COMMAND: 'toggle-link',
}));

jest.mock('@lexical/list', () => ({
  ListNode: {},
  ListItemNode: {},
  INSERT_ORDERED_LIST_COMMAND: 'insert-ordered-list',
  INSERT_UNORDERED_LIST_COMMAND: 'insert-unordered-list',
  REMOVE_LIST_COMMAND: 'remove-list',
  $isListNode: jest.fn(() => false),
  $isListItemNode: jest.fn(() => false),
}));

const renderWithI18n = (component) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
};

describe('Editor Component', () => {
  it('renders without crashing', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('content-editable')).toBeInTheDocument();
  });

  it('renders with editor-box wrapper with role group', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveClass('editor-box');
  });

  it('renders a label when label prop is provided', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} label="Description" />);

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Description')).toHaveClass('editor-label');
  });

  it('renders required indicator when required prop is true', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} label="Description" required={true} />);

    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders error message when error and errorMessage props are provided', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(
      <Editor
        onContentChange={mockOnContentChange}
        label="Description"
        error={true}
        errorMessage="This field is required"
      />
    );

    const errorEl = screen.getByRole('alert');
    expect(errorEl).toBeInTheDocument();
    expect(errorEl).toHaveTextContent('This field is required');
    expect(errorEl).toHaveClass('editor-error-message');
  });

  it('applies error styling when error prop is true', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(
      <Editor
        onContentChange={mockOnContentChange}
        error={true}
        errorMessage="Error"
        label="Test"
      />
    );

    const group = screen.getByRole('group');
    expect(group).toHaveClass('editor-box-error');
    expect(screen.getByText('Test')).toHaveClass('editor-label-error');
  });

  it('does not render error message when error is false', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(
      <Editor
        onContentChange={mockOnContentChange}
        error={false}
        errorMessage="This field is required"
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders visually hidden description for screen readers', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    const description = document.querySelector('.sr-only');
    expect(description).toBeInTheDocument();
    expect(description.textContent).toContain('Use Tab to reach the toolbar');
  });

  it('shows docs overlay when help button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    const helpButton = screen.getByLabelText('Show keyboard shortcuts help');
    await user.click(helpButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Editor Shortcuts')).toBeInTheDocument();
  });

  it('renders Shortcuts component in docs overlay', async () => {
    const user = userEvent.setup();
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    const helpButton = screen.getByLabelText('Show keyboard shortcuts help');
    await user.click(helpButton);

    expect(screen.getByText('Usage Tips')).toBeInTheDocument();
    // Check that kbd elements are rendered (from Shortcuts component)
    const kbdElements = document.querySelectorAll('kbd');
    expect(kbdElements.length).toBeGreaterThan(0);
  });

  it('closes docs overlay when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    // Open docs
    const helpButton = screen.getByLabelText('Show keyboard shortcuts help');
    await user.click(helpButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close docs
    const closeButton = screen.getByLabelText('Close documentation');
    await user.click(closeButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not render label when label prop is not provided', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    expect(document.querySelector('.editor-label')).not.toBeInTheDocument();
  });
});
