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

jest.mock('@lexical/table', () => ({
  TableNode: class TableNode {},
  TableRowNode: class TableRowNode {},
  TableCellNode: class TableCellNode {},
}));

jest.mock('@lexical/react/LexicalTablePlugin', () => ({
  TablePlugin: () => <div data-testid="table-plugin" />,
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
    expect(screen.getByTestId('link-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('list-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('on-change-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('table-plugin')).toBeInTheDocument();
  });

  it('exports clean, semantic table HTML with scoped header cells', () => {
    const { $generateHtmlFromNodes } = require('@lexical/html');
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    // Simulate Lexical's real export: a <colgroup> for sizing and a header row
    // of <th> cells with inline styles/classes.
    $generateHtmlFromNodes.mockReturnValueOnce(
      '<table class="min-w-full"><colgroup><col style="width:92px"><col></colgroup><tbody class="x"><tr class="y"><th style="width:75px" class="z">Name</th><th>Role</th></tr><tr><td style="width:75px">Ada</td><td>Engineer</td></tr></tbody></table>',
    );
    mockOnChangeCapture.onChange({ read: (cb) => cb() }, {});

    const exported = mockOnContentChange.mock.calls[0][0];
    // <colgroup>/<col> sizing markup is dropped.
    expect(exported).not.toMatch(/colgroup|<col\b/);
    // Header-row cells are scoped as column headers; no stray scope="row".
    expect(exported).toBe(
      '<table><tbody><tr><th scope="col">Name</th><th scope="col">Role</th></tr><tr><td>Ada</td><td>Engineer</td></tr></tbody></table>',
    );
    expect(exported).not.toContain('scope="row"');
  });

  it('handles <thead> and styled cells with attributes before style', () => {
    const { $generateHtmlFromNodes } = require('@lexical/html');
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);

    // A <thead> must NOT be corrupted into <th scope="col"ead>, and a cell whose
    // style attribute comes after colspan must still have its style stripped.
    $generateHtmlFromNodes.mockReturnValueOnce(
      '<table class="t"><thead><tr><th colspan="2" style="width:75px" class="z">Name</th></tr></thead><tbody><tr><td>Ada</td><td>Engineer</td></tr></tbody></table>',
    );
    mockOnChangeCapture.onChange({ read: (cb) => cb() }, {});

    const exported = mockOnContentChange.mock.calls[0][0];
    expect(exported).toContain('<thead>');
    expect(exported).not.toMatch(/scope="col"ead/);
    expect(exported).not.toContain('style=');
    // colspan is preserved and scope is added to the header cell.
    expect(exported).toContain('<th scope="col" colspan="2">');
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
