// ToolbarPlugin.js
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  KEY_ESCAPE_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import {
  $toggleBold,
  $toggleItalic,
  $toggleUnderline,
  $toggleStrikethrough,
  $setBlocksType
} from '@lexical/rich-text';
import { $createHeadingNode } from '@lexical/rich-text';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
// Temporarily comment out missing imports
// import { INSERT_IMAGE_COMMAND } from '@lexical/image';
// import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
// Table functionality removed
import { useTranslation } from 'react-i18next';

export function ToolbarPlugin({ setActiveTab }) {
  const [editor] = useLexicalComposerContext();
  const { t } = useTranslation();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const dialogRef = useRef(null);
  const urlInputRef = useRef(null);

  const format = useCallback((action) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        action(selection);
      }
    });
  }, [editor]);

  // Helper to apply heading formatting.
  const setHeading = useCallback((tag) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  }, [editor]);

  // Register keyboard shortcuts.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (!mod && e.key !== 'Escape') return;

      // Basic formatting shortcuts.
      if (mod && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            format($toggleBold);
            break;
          case 'i':
            e.preventDefault();
            format($toggleItalic);
            break;
          case 'u':
            e.preventDefault();
            format($toggleUnderline);
            break;
          case 'k': {
            e.preventDefault();
            const url = window.prompt(t('enterUrl'));
            if (url !== null) {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null);
            }
            break;
          }
          case 'p':
            e.preventDefault();
            setActiveTab('preview');
            break;
          default:
            break;
        }
      }

      // Heading shortcuts with Ctrl/Cmd + Alt + [1-6].
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
  }, [editor, format, setActiveTab, t, setHeading]);

  // Register Escape key to move focus (switch to Preview tab).
  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        if (showLinkDialog) {
          setShowLinkDialog(false);
          return true;
        }
        setActiveTab('preview');
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor, setActiveTab, showLinkDialog]);

  // Focus URL input when dialog opens
  useEffect(() => {
    if (showLinkDialog && urlInputRef.current) {
      // Slight delay to ensure the dialog is fully rendered
      setTimeout(() => {
        urlInputRef.current.focus();
      }, 50);
    }
  }, [showLinkDialog]);

  // Image upload functionality to be implemented later
  // const handleImageUpload = (e) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const url = reader.result;
  //       const altText = window.prompt(t('enterAltText'));
  //       if (typeof url === 'string') {
  //         // Temporarily commented out due to missing import
  //         // editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
  //         //   src: url,
  //         //   altText: altText || '',
  //         // });
  //         console.log('Image upload not available in this version');
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  return (
    <div className="editor-toolbar" role="toolbar" aria-label={t('editorToolbar')}>
      <div className="toolbar-group">
        <button onClick={() => format($toggleBold)} aria-label={t('bold')}>
          <svg className="icon-bold" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12H14C16.2091 12 18 10.2091 18 8C18 5.79086 16.2091 4 14 4H6V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 12H15C17.2091 12 19 13.7909 19 16C19 18.2091 17.2091 20 15 20H6V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={() => format($toggleItalic)} aria-label={t('italic')}>
          <svg className="icon-italic" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 20H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.5 4L9.5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={() => format($toggleUnderline)} aria-label={t('underline')}>
          <svg className="icon-underline" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3V10C6 13.3137 8.68629 16 12 16C15.3137 16 18 13.3137 18 10V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 21H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={() => format($toggleStrikethrough)} aria-label={t('strikethrough')}>
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

      {showLinkDialog && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div 
          className="link-dialog-overlay"
          onClick={() => setShowLinkDialog(false)}
        >
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
          <div 
            ref={dialogRef}
            className="link-dialog" 
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-dialog-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
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
                  // Using custom focus management via useEffect instead
                  // autoFocus
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