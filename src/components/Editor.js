// Editor.js
import React, { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes } from '@lexical/html';
import { ToolbarPlugin } from './ToolbarPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
// Temporarily comment out missing imports
// import { ImageNode } from '@lexical/image';
// import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
  },
  heading: {
    h1: 'text-3xl font-bold mt-6 mb-4',
    h2: 'text-2xl font-bold mt-5 mb-3',
    h3: 'text-xl font-bold mt-4 mb-2',
    h4: 'text-lg font-bold mt-3 mb-2',
    h5: 'text-base font-bold mt-2 mb-1',
    h6: 'text-sm font-bold mt-2 mb-1',
  },
  list: {
    ul: 'list-disc ml-5 my-2',
    ol: 'list-decimal ml-5 my-2',
    li: 'my-1',
  },
  link: 'text-blue-600 underline',
  table: 'min-w-full border-collapse border border-gray-300 my-4',
  tableRow: 'border-t border-gray-300',
  tableCell: 'border border-gray-300 p-2',
  tableHeader: 'bg-gray-100 font-bold p-2 border border-gray-300',
};

const editorConfig = {
  namespace: 'UserContentEditor',
  theme,
  onError(error) {
    throw error;
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    LinkNode,
    // ImageNode,
    // HorizontalRuleNode,
  ],
};

const TABS = ['edit', 'preview', 'docs'];

export default function Editor({ onContentChange }) {
  const [activeTab, setActiveTab] = useState('edit');
  const [htmlOutput, setHtmlOutput] = useState('');

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-tabs" role="tablist" aria-label="Editor view options">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            aria-selected={activeTab === tab}
            role="tab"
            id={`${tab}Tab`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="editor-container" role="tabpanel" aria-labelledby={`${activeTab}Tab`}>
        {activeTab === 'edit' && (
          <>
            <ToolbarPlugin setActiveTab={setActiveTab} />
            <div className="editor-content-area">
              <RichTextPlugin
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={<div className="editor-placeholder">Start writing...</div>}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <LinkPlugin />
              <OnChangePlugin
                onChange={(editorState, editor) => {
                  editorState.read(() => {
                    const htmlString = $generateHtmlFromNodes(editor, null);
                    setHtmlOutput(htmlString);
                    onContentChange(htmlString);
                  });
                }}
              />
            </div>
          </>
        )}
        {activeTab === 'preview' && (
          <div
            className="editor-preview"
            aria-label="Preview mode"
            dangerouslySetInnerHTML={{ __html: htmlOutput }}
          />
        )}
        {activeTab === 'docs' && (
          <div className="editor-docs" aria-label="Editor documentation">
            <h2>Editor Shortcuts</h2>
            <ul>
              <li>
                <kbd>Ctrl</kbd> + <kbd>B</kbd>: Bold
              </li>
              <li>
                <kbd>Ctrl</kbd> + <kbd>I</kbd>: Italic
              </li>
              <li>
                <kbd>Ctrl</kbd> + <kbd>U</kbd>: Underline
              </li>
              <li>
                <kbd>Ctrl</kbd> + <kbd>K</kbd>: Insert Link
              </li>
              <li>
                <kbd>Ctrl</kbd> + <kbd>P</kbd>: Toggle Preview Mode
              </li>
              <li>
                <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>1</kbd>: Heading 1
              </li>
              <li>
                <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>2</kbd>: Heading 2
              </li>
              <li>
                <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>3</kbd>: Heading 3
              </li>
              <li>
                <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>4</kbd>: Heading 4
              </li>
              <li>
                <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>5</kbd>: Heading 5
              </li>
              <li>
                <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>6</kbd>: Heading 6
              </li>
              <li>
                <kbd>Esc</kbd>: Exit editor focus (moves to Preview tab)
              </li>
            </ul>
            <h3>Usage Tips</h3>
            <p>
              Use the toolbar buttons or keyboard shortcuts to format your content. Switch between Edit, Preview,
              and Documentation tabs for a full experience.
            </p>
          </div>
        )}
      </div>
    </LexicalComposer>
  );
}