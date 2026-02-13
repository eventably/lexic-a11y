// Editor.js
import React, { useState, useRef, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { ToolbarPlugin } from './ToolbarPlugin';
import { Shortcuts } from './Shortcuts';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { useTranslation } from 'react-i18next';

// Counter-based ID generator (React 16.8+ compatible alternative to useId)
let editorIdCounter = 0;
function useEditorId() {
  const idRef = React.useRef(null);
  if (idRef.current === null) {
    editorIdCounter += 1;
    idRef.current = `lexic-editor-${editorIdCounter}`;
  }
  return idRef.current;
}

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
  ],
};

// Inner component that has access to the Lexical composer context
function EditorContent({ editorId, label, required, t }) {
  const [editor] = useLexicalComposerContext();

  const handleContentKeyDown = useCallback((e) => {
    // Shift+Tab from editor content area moves focus to the help button in toolbar
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const editorBox = e.target.closest('.editor-box');
      if (editorBox) {
        const helpButton = editorBox.querySelector('.docs-button');
        if (helpButton) {
          helpButton.focus();
        }
      }
    }
  }, []);

  const handleContentClick = useCallback(() => {
    editor.focus();
  }, [editor]);

  const ariaLabel = [
    label,
    t('editorTitle'),
    required ? t('required') : '',
  ].filter(Boolean).join(' - ');

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="editor-content-area" onClick={handleContentClick}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            id={editorId}
            className="editor-input"
            aria-label={ariaLabel}
            aria-multiline="true"
            aria-required={required ? 'true' : undefined}
            tabIndex={-1}
            onKeyDown={handleContentKeyDown}
          />
        }
        placeholder={<div className="editor-placeholder">Start writing...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </div>
  );
}


export default function Editor({ onContentChange, label, required, error, errorMessage }) {
  const [showDocs, setShowDocs] = useState(false);
  const [, setHtmlOutput] = useState('');
  const docsButtonRef = useRef(null);
  const editorId = useEditorId();
  const { t } = useTranslation();

  const descriptionId = `${editorId}-description`;
  const errorId = `${editorId}-error`;

  // Build aria-label for the editor group
  const groupAriaLabel = [
    label,
    t('editorTitle'),
    required ? `(${t('required')})` : '',
  ].filter(Boolean).join(' ');

  // Build aria-describedby
  const describedByParts = [descriptionId];
  if (error && errorMessage) {
    describedByParts.push(errorId);
  }

  const handleEditorBoxKeyDown = useCallback((e) => {
    // Enter or Space on the editor-box itself (not on child elements) focuses the content editable
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('editor-box')) {
      e.preventDefault();
      const contentEditable = e.target.querySelector('.editor-input');
      if (contentEditable) {
        contentEditable.focus();
      }
    }
  }, []);

  const handleLabelClick = useCallback(() => {
    const contentEditable = document.getElementById(editorId);
    if (contentEditable) {
      contentEditable.focus();
    }
  }, [editorId]);

  const handleDocsOverlayClick = useCallback((e) => {
    // Only close when clicking the overlay background, not child elements
    if (e.target === e.currentTarget) {
      setShowDocs(false);
    }
  }, []);

  return (
    <div>
      {label && (
        <div className="editor-label-container">
          <span
            className={`editor-label ${error ? 'editor-label-error' : ''}`}
            role="button"
            tabIndex={0}
            onClick={handleLabelClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLabelClick(); } }}
            data-editor-for={editorId}
          >
            {label}
          </span>
          {required && (
            <span className="editor-required-indicator" aria-hidden="true">*</span>
          )}
        </div>
      )}

      <LexicalComposer initialConfig={editorConfig}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          className={`editor-box ${error ? 'editor-box-error' : ''}`}
          role="group"
          aria-label={groupAriaLabel}
          aria-describedby={describedByParts.join(' ')}
          onKeyDown={handleEditorBoxKeyDown}
        >
          <span id={descriptionId} className="sr-only">
            {t('editorDescription')}
          </span>

          <ToolbarPlugin
            showDocs={showDocs}
            setShowDocs={setShowDocs}
            docsButtonRef={docsButtonRef}
          />

          <div className="editor-container">
            <EditorContent
              editorId={editorId}
              label={label}
              required={required}
              t={t}
            />
            <HistoryPlugin />
            <LinkPlugin />
            <ListPlugin />
            <OnChangePlugin
              onChange={(editorState, editor) => {
                editorState.read(() => {
                  const htmlString = $generateHtmlFromNodes(editor);
                  const cleanHtml = htmlString
                    .replace(/class="[^"]*"/g, '')
                    .replace(/<(h[1-6]|p|ul|ol|li)([^>]*)>/g, '<$1>')
                    .replace(/<a([^>]*)(class="[^"]*")([^>]*)>/g, '<a$1$3>');
                  setHtmlOutput(cleanHtml);
                  onContentChange(cleanHtml);
                });
              }}
            />
          </div>
        </div>

        {showDocs && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
          <div
            className="editor-docs-overlay"
            onClick={handleDocsOverlayClick}
          >
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <div
              className="editor-docs-content"
              role="dialog"
              aria-modal="true"
              aria-label={t('editorShortcutsTitle')}
              onKeyDown={(e) => { if (e.key === 'Escape') setShowDocs(false); }}
            >
              <div className="editor-docs-header">
                <h2>{t('editorShortcutsTitle')}</h2>
                <button
                  type="button"
                  onClick={() => setShowDocs(false)}
                  aria-label="Close documentation"
                  className="close-docs-button"
                >
                  &times;
                </button>
              </div>
              <div className="editor-docs-body">
                <Shortcuts />
                <h3>{t('usageTips')}</h3>
                <p>{t('usageTipsDescription')}</p>
              </div>
            </div>
          </div>
        )}
      </LexicalComposer>

      {error && errorMessage && (
        <div id={errorId} className="editor-error-message" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
