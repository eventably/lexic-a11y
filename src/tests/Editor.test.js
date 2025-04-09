import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Editor from '../components/Editor';
import { I18nextProvider } from 'react-i18next';
import i18n from '../utils/i18n';

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

jest.mock('@lexical/html', () => ({
  $generateHtmlFromNodes: () => '<p>Test HTML Output</p>',
}));

jest.mock('../components/ToolbarPlugin', () => ({
  ToolbarPlugin: () => <div data-testid="toolbar-plugin" />,
}));

const renderWithI18n = (component) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
};

describe('Editor Component', () => {
  it('renders without crashing', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);
    
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
  });

  it('starts with the edit tab active', () => {
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);
    
    const editTab = screen.getByText('Edit');
    expect(editTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('toolbar-plugin')).toBeInTheDocument();
  });

  it('switches to preview tab when clicked', async () => {
    const user = userEvent.setup();
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);
    
    const previewTab = screen.getByText('Preview');
    await user.click(previewTab);
    
    expect(previewTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('Preview mode')).toBeInTheDocument();
  });

  it('switches to docs tab when clicked', async () => {
    const user = userEvent.setup();
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);
    
    const docsTab = screen.getByText('Docs');
    await user.click(docsTab);
    
    expect(docsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('Editor documentation')).toBeInTheDocument();
    expect(screen.getByText('Editor Shortcuts')).toBeInTheDocument();
  });
  
  it('displays editor documentation in the docs tab', async () => {
    const user = userEvent.setup();
    const mockOnContentChange = jest.fn();
    renderWithI18n(<Editor onContentChange={mockOnContentChange} />);
    
    // Switch to docs tab
    const docsTab = screen.getByText('Docs');
    await user.click(docsTab);
    
    // Verify documentation is displayed
    const docSection = screen.getByLabelText('Editor documentation');
    expect(docSection).toBeInTheDocument();
    expect(screen.getByText('Editor Shortcuts')).toBeInTheDocument();
    
    // Check for documentation header and usage tips
    expect(screen.getByText('Usage Tips')).toBeInTheDocument();
    expect(screen.getByText(/Use the toolbar buttons or keyboard shortcuts/)).toBeInTheDocument();
  });
});