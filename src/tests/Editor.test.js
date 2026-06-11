import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';

import Editor from '../components/Editor';
import i18n from '../utils/i18n';

// Mock Lexical node types used in editorConfig
jest.mock('@lexical/rich-text', () => ({
  HeadingNode: class HeadingNode {},
  QuoteNode: class QuoteNode {},
}));

jest.mock('@lexical/list', () => ({
  ListNode: class ListNode {},
  ListItemNode: class ListItemNode {},
}));

jest.mock('@lexical/link', () => ({
  LinkNode: class LinkNode {},
}));

// Mock the Lexical components and plugins
jest.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: jest.fn(() => [{ update: jest.fn() }]),
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
  ContentEditable: () => <div data-testid="content-editable" />,
}));

jest.mock('@lexical/react/LexicalHistoryPlugin', () => ({
  HistoryPlugin: () => <div data-testid="history-plugin" />,
}));

jest.mock('@lexical/react/LexicalHorizontalRuleNode', () => ({
  HorizontalRuleNode: class HorizontalRuleNode {},
  INSERT_HORIZONTAL_RULE_COMMAND: 'insert-horizontal-rule',
}));

jest.mock('@lexical/react/LexicalHorizontalRulePlugin', () => ({
  HorizontalRulePlugin: () => <div data-testid="horizontal-rule-plugin" />,
}));

jest.mock('@lexical/react/LexicalMarkdownShortcutPlugin', () => ({
  MarkdownShortcutPlugin: () => <div data-testid="markdown-shortcut-plugin" />,
}));

// Capture the OnChangePlugin onChange prop so tests can exercise the export path
const mockOnChangeCapture = {};

jest.mock('@lexical/react/LexicalOnChangePlugin', () => ({
  OnChangePlugin: ({ onChange }) => {
    mockOnChangeCapture.onChange = onChange;
    return <div data-testid="on-change-plugin" />;
  },
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
  $generateHtmlFromNodes: jest.fn(() => '<p>Test HTML Output</p>'),
}));

jest.mock('../components/HeadingOutlinePlugin', () => ({
  HeadingOutlinePlugin: () => <div data-testid="heading-outline-plugin" />,
}));

jest.mock('../components/WordCountPlugin', () => ({
  WordCountPlugin: () => <div data-testid="word-count-plugin" />,
}));

// Stub the curated transformers so the real @lexical/markdown (which pulls in
// the mocked lexical packages above) is never loaded in this suite
jest.mock('../utils/markdown-transformers', () => ({
  EDITOR_TRANSFORMERS: [],
}));

// Mock ToolbarPlugin to expose setShowDocs trigger
jest.mock('../components/ToolbarPlugin', () => ({
  ToolbarPlugin: ({ setShowDocs }) => (
    <div data-testid="toolbar-plugin">
      <button data-testid="show-docs-button" onClick={() => setShowDocs(true)}>
        Show Docs
      </button>
    </div>
  ),
}));

const renderWithI18n = (component) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
};

describe('Editor Component', () => {
  it('renders without crashing', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('rich-text-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('content-editable')).toBeInTheDocument();
  });

  it('renders the editor plugins', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    expect(screen.getByTestId('history-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('horizontal-rule-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('link-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('list-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-shortcut-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('on-change-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('heading-outline-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('word-count-plugin')).toBeInTheDocument();
  });

  it('exports a clean semantic <hr> through the HTML cleanup path', () => {
    const { $generateHtmlFromNodes } = require('@lexical/html');
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    // Simulate Lexical emitting an hr with theme classes/attributes
    $generateHtmlFromNodes.mockReturnValueOnce(
      '<p>Intro</p><hr class="my-4" data-x="1"><p>End</p>',
    );
    mockOnChangeCapture.onChange({ read: (cb) => cb() }, {});

    expect(mockOnContentChange).toHaveBeenCalledWith('<p>Intro</p><hr><p>End</p>');
  });

  it('does not show docs overlay by default', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    expect(screen.queryByLabelText('Editor documentation')).not.toBeInTheDocument();
  });

  it('shows docs overlay when triggered via toolbar', async () => {
    const user = userEvent.setup();
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    const showDocsButton = screen.getByTestId('show-docs-button');
    await user.click(showDocsButton);

    expect(screen.getByLabelText('Editor documentation')).toBeInTheDocument();
    expect(screen.getByText('Editor Shortcuts')).toBeInTheDocument();
  });

  it('displays editor documentation content in docs overlay', async () => {
    const user = userEvent.setup();
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    const showDocsButton = screen.getByTestId('show-docs-button');
    await user.click(showDocsButton);

    expect(screen.getByText('Usage Tips')).toBeInTheDocument();
    expect(screen.getByText(/Use the toolbar buttons or keyboard shortcuts/)).toBeInTheDocument();
  });
});
