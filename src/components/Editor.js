// Editor.js
import React, { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes } from '@lexical/html';
// No helper functions needed with the simplified HTML cleaning approach
import { ToolbarPlugin } from './ToolbarPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
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


export default function Editor({ onContentChange }) {
  const [showDocs, setShowDocs] = useState(false);
  const [, setHtmlOutput] = useState('');

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <ToolbarPlugin showDocs={showDocs} setShowDocs={setShowDocs} />
      
      <div className="editor-container">
        <div className="editor-content-area">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="editor-placeholder">Start writing...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <LinkPlugin />
          <ListPlugin />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              editorState.read(() => {
                // Generate HTML with default export (no custom transformer)
                const htmlString = $generateHtmlFromNodes(editor);
                
                // Use a simple regex to clean up the utility classes
                const cleanHtml = htmlString
                  .replace(/class="[^"]*"/g, '') // Remove all class attributes
                  .replace(/<(h[1-6]|p|ul|ol|li)([^>]*)>/g, '<$1>') // Clean heading, paragraph, and list tags
                  .replace(/<a([^>]*)(class="[^"]*")([^>]*)>/g, '<a$1$3>'); // Clean link tags
                
                setHtmlOutput(cleanHtml);
                onContentChange(cleanHtml);
              });
            }}
          />
        </div>
      </div>
      
      {showDocs && (
        <div className="editor-docs-overlay" aria-label="Editor documentation">
          <div className="editor-docs-content">
            <div className="editor-docs-header">
              <h2>Editor Shortcuts</h2>
              <button 
                onClick={() => setShowDocs(false)}
                aria-label="Close documentation"
                className="close-docs-button"
              >
                &times;
              </button>
            </div>
            <div className="editor-docs-body">
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
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>8</kbd>: Bullet List
                </li>
                <li>
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>7</kbd>: Numbered List
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
                  <kbd>Esc</kbd>: Exit editor focus
                </li>
              </ul>
              <h3>Usage Tips</h3>
              <p>
                Use the toolbar buttons or keyboard shortcuts to format your content.
              </p>
            </div>
          </div>
        </div>
      )}
    </LexicalComposer>
  );
}