// ToolbarPlugin.js
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  KEY_ESCAPE_COMMAND,
  COMMAND_PRIORITY_HIGH,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode } from '@lexical/rich-text';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { 
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from '@lexical/list';
import { useTranslation } from 'react-i18next';

export function ToolbarPlugin({ showDocs, setShowDocs }) {
  const [editor] = useLexicalComposerContext();
  const { t } = useTranslation();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const dialogRef = useRef(null);
  const urlInputRef = useRef(null);

  // Helper to apply heading formatting
  const setHeading = useCallback((tag) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        try {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        } catch (error) {
          console.error('Error applying heading:', error);
          // Fallback implementation
          const element = $createHeadingNode(tag);
          selection.insertNodes([element]);
        }
      }
    });
  }, [editor]);

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (!mod && e.key !== 'Escape') return;

      // Basic formatting shortcuts
      if (mod && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            break;
          case 'i':
            e.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            break;
          case 'u':
            e.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            break;
          case 'k': {
            e.preventDefault();
            const url = window.prompt(t('enterUrl'));
            if (url !== null) {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null);
            }
            break;
          }
          case 'd':
            e.preventDefault();
            setShowDocs(prevState => !prevState);
            break;
          case '8':
            if (e.shiftKey) { // For * (Shift+8)
              e.preventDefault();
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            }
            break;
          case '7':
            if (e.shiftKey) { // For & (Shift+7)
              e.preventDefault();
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            }
            break;
          default:
            break;
        }
      }

      // Heading shortcuts with Ctrl/Cmd + Alt + [1-6]
      if (mod && e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setHeading('h1');
            break;
          case '2':
            e.preventDefault();
            setHeading('h2');
            break;
          case '3':
            e.preventDefault();
            setHeading('h3');
            break;
          case '4':
            e.preventDefault();
            setHeading('h4');
            break;
          case '5':
            e.preventDefault();
            setHeading('h5');
            break;
          case '6':
            e.preventDefault();
            setHeading('h6');
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, setShowDocs, t, setHeading]);

  // Register Escape key to close link dialog
  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        if (showLinkDialog) {
          setShowLinkDialog(false);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor, showLinkDialog]);

  // Focus URL input when dialog opens
  useEffect(() => {
    if (showLinkDialog && urlInputRef.current) {
      // Slight delay to ensure the dialog is fully rendered
      setTimeout(() => {
        urlInputRef.current.focus();
      }, 50);
    }
  }, [showLinkDialog]);

  return (
    <div className="editor-toolbar" role="toolbar" aria-label={t('editorToolbar')}>
      <div className="toolbar-group">
        <button 
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} 
          aria-label={t('bold')}
        >
          <svg className="icon-bold" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12H14C16.2091 12 18 10.2091 18 8C18 5.79086 16.2091 4 14 4H6V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 12H15C17.2091 12 19 13.7909 19 16C19 18.2091 17.2091 20 15 20H6V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} 
          aria-label={t('italic')}
        >
          <svg className="icon-italic" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 20H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.5 4L9.5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} 
          aria-label={t('underline')}
        >
          <svg className="icon-underline" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3V10C6 13.3137 8.68629 16 12 16C15.3137 16 18 13.3137 18 10V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 21H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} 
          aria-label={t('strikethrough')}
        >
          <svg className="icon-strikethrough" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 6C16 6 14.5 4 12 4C9.5 4 8 5.5 8 7.5C8 9.5 9 10 12 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 13C15.5 14 16 15 16 17C16 19.5 13.5 20.5 12 20.5C10 20.5 8 19 8 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={() => setHeading('h1')} aria-label={t('heading1')} className="heading-button">
          H1
        </button>
        <button onClick={() => setHeading('h2')} aria-label={t('heading2')} className="heading-button">
          H2
        </button>
        <button onClick={() => setHeading('h3')} aria-label={t('heading3')} className="heading-button">
          H3
        </button>
        <button onClick={() => setHeading('h4')} aria-label={t('heading4')} className="heading-button">
          H4
        </button>
        <button onClick={() => setHeading('h5')} aria-label={t('heading5')} className="heading-button">
          H5
        </button>
        <button onClick={() => setHeading('h6')} aria-label={t('heading6')} className="heading-button">
          H6
        </button>
      </div>

      <div className="toolbar-group">
        <button
          className="link-button"
          onClick={() => {
            // Get any selected text before opening dialog
            editor.getEditorState().read(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const selectedText = selection.getTextContent();
                if (selectedText) {
                  setLinkText(selectedText);
                }
              }
            });
            setShowLinkDialog(true);
          }}
          aria-label={t('link')}
        >
          <svg className="icon-link" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17H7C4.24 17 2 14.76 2 12C2 9.24 4.24 7 7 7H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="button-text">{t('link')}</span>
        </button>
      </div>

      <div className="toolbar-group">
        <button 
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} 
          aria-label={t('bulletList')}
        >
          <svg className="icon-list-ul" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4" cy="6" r="2" fill="currentColor" />
            <line x1="9" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="4" cy="12" r="2" fill="currentColor" />
            <line x1="9" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="4" cy="18" r="2" fill="currentColor" />
            <line x1="9" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button 
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} 
          aria-label={t('numberedList')}
        >
          <svg className="icon-list-ol" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H4V7H3V6Z" fill="currentColor" />
            <path d="M3 10V9H5V6H3V5H5V4H4V3H3V4H2V6H3V7H2V9H3V10H2V12H5V10H3Z" fill="currentColor" />
            <path d="M3 18H4V15H2V16H3V18Z" fill="currentColor" />
            <line x1="9" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="9" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="9" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="toolbar-group toolbar-right">
        <button 
          onClick={() => setShowDocs(prevState => !prevState)} 
          aria-label={t('showHelp')}
          aria-pressed={showDocs}
          className={`docs-button ${showDocs ? 'active' : ''}`}
        >
          <svg className="icon-help" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 18V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 15C12 11 16 11 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {showLinkDialog && (
        <div 
          className="link-dialog-overlay"
          onClick={() => setShowLinkDialog(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowLinkDialog(false);
            }
          }}
          role="presentation"
        >
          <div 
            ref={dialogRef}
            className="link-dialog" 
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-dialog-title"
            tabIndex={-1}
          >
            <h3 id="link-dialog-title">{t('insertLink')}</h3>
            <div className="link-dialog-form">
              <div className="form-group">
                <label htmlFor="link-url">{t('url')}:</label>
                <input 
                  ref={urlInputRef}
                  type="text" 
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="link-text">{t('text')}:</label>
                <input 
                  type="text" 
                  id="link-text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder={t('linkText')}
                />
              </div>

              <div className="link-dialog-buttons">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowLinkDialog(false);
                    setTimeout(() => {
                      setLinkUrl('');
                      setLinkText('');
                    }, 50);
                  }}
                >
                  {t('cancel')}
                </button>
                <button 
                  type="button" 
                  className="insert-button"
                  onClick={() => {
                    if (linkUrl) {
                      // Close dialog first to prevent editor focus issues
                      setShowLinkDialog(false);
                      
                      // Small delay to ensure the dialog is fully closed
                      setTimeout(() => {
                        editor.focus();
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            if (linkText && selection.isCollapsed()) {
                              // If there's link text but no selection, insert the text with the link
                              selection.insertText(linkText);
                              // Need to get selection again after text insertion
                              const updatedSelection = $getSelection();
                              if ($isRangeSelection(updatedSelection)) {
                                updatedSelection.modify('backward', linkText.length, 'character');
                                editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
                                  url: linkUrl,
                                  target: '_blank',
                                });
                              }
                            } else {
                              // Apply link to the current selection
                              editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
                                url: linkUrl,
                                target: '_blank',
                              });
                            }
                          }
                        });
                        setLinkUrl('');
                        setLinkText('');
                      }, 50);
                    } else {
                      setShowLinkDialog(false);
                      setLinkUrl('');
                      setLinkText('');
                    }
                  }}
                  disabled={!linkUrl}
                >
                  {t('insert')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}