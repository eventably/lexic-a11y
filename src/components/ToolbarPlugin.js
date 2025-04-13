// ToolbarPlugin.js
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  KEY_ESCAPE_COMMAND,
  COMMAND_PRIORITY_HIGH,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { 
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  $isListItemNode
} from '@lexical/list';
import { useTranslation } from 'react-i18next';

export function ToolbarPlugin({ showDocs, setShowDocs }) {
  const [editor] = useLexicalComposerContext();
  const { t } = useTranslation();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [activeHeadingTag, setActiveHeadingTag] = useState(null);
  const [isOrderedListActive, setIsOrderedListActive] = useState(false);
  const [isUnorderedListActive, setIsUnorderedListActive] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const dialogRef = useRef(null);
  const urlInputRef = useRef(null);

  // Helper to apply heading formatting with toggle functionality
  const setHeading = useCallback((tag) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      
      // Check if selection is already the same heading type
      let isAlreadyHeadingType = false;
      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();
      
      // Check the nearest block parent of selection
      const anchorParent = anchorNode.getParent();
      const focusParent = focusNode.getParent();
      
      // Simple case: heading is direct parent
      if (
        ($isHeadingNode(anchorParent) && anchorParent.getTag() === tag) ||
        ($isHeadingNode(focusParent) && focusParent.getTag() === tag)
      ) {
        isAlreadyHeadingType = true;
      }
      
      try {
        if (isAlreadyHeadingType) {
          // Convert to paragraph if already the heading type
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          // Convert to specified heading type
          $setBlocksType(selection, () => $createHeadingNode(tag));
        }
      } catch (error) {
        console.error('Error applying heading:', error);
        // Fallback implementation
        if (isAlreadyHeadingType) {
          const paragraph = $createParagraphNode();
          selection.insertNodes([paragraph]);
        } else {
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
  
  // Helper function to toggle list formats
  const toggleList = useCallback((listType) => {
    try {
      if (listType === 'bullet' && isUnorderedListActive) {
        // Remove the list if it's already active
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else if (listType === 'number' && isOrderedListActive) {
        // Remove the list if it's already active
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        // Apply the appropriate list type
        if (listType === 'bullet') {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else if (listType === 'number') {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }
      }
    } catch (error) {
      console.error('Error toggling list:', error);
    }
  }, [editor, isOrderedListActive, isUnorderedListActive]);

  // Update active formats when selection changes
  useEffect(() => {
    const updateToolbar = () => {
      try {
        const editorState = editor.getEditorState();
        
        editorState.read(() => {
          try {
            const selection = $getSelection();
            
            // Reset all format states when there's no valid selection
            if (!selection || !$isRangeSelection(selection)) {
              setActiveHeadingTag(null);
              setIsOrderedListActive(false);
              setIsUnorderedListActive(false);
              setIsBold(false);
              setIsItalic(false);
              setIsUnderline(false);
              setIsStrikethrough(false);
              return;
            }
            
            // Check for text formatting (bold, italic, etc.)
            try {
              // Only check format types when there's actual text content and selection is not collapsed
              const textContent = selection.getTextContent();
              const hasTextAndSelection = textContent && textContent.length > 0 && !selection.isCollapsed();
              
              // Default to false when no text is selected
              let boldActive = false;
              let italicActive = false;
              let underlineActive = false;
              let strikethroughActive = false;
              
              if (hasTextAndSelection) {
                // In Lexical, format types are represented by numerical values
                // We'll use the hasFormat method that's available on the selection
                boldActive = selection.hasFormat('bold');
                italicActive = selection.hasFormat('italic');
                underlineActive = selection.hasFormat('underline');
                strikethroughActive = selection.hasFormat('strikethrough');
              }
              
              // Update state for each format type
              setIsBold(boldActive);
              setIsItalic(italicActive);
              setIsUnderline(underlineActive);
              setIsStrikethrough(strikethroughActive);
            } catch (error) {
              // Reset formatting state on error
              setIsBold(false);
              setIsItalic(false);
              setIsUnderline(false);
              setIsStrikethrough(false);
            }
            
            // Check for headings, lists, etc.
            let headingTag = null;
            let orderedListActive = false;
            let unorderedListActive = false;
            
            try {
              // Get the anchor node safely
              const anchorNode = selection.anchor.getNode();
              if (!anchorNode) return;
              
              // Helper to check for headings
              const findHeadingTag = (node) => {
                if (!node) return null;
                
                // Check if node is a heading
                if ($isHeadingNode(node)) {
                  return node.getTag();
                }
                
                // Check parent
                try {
                  const parent = node.getParent();
                  if (parent && $isHeadingNode(parent)) {
                    return parent.getTag();
                  }
                } catch (e) {
                  // Ignore errors when getting parent
                }
                
                return null;
              };
              
              // Find headings
              headingTag = findHeadingTag(anchorNode);
              
              // Helper to safely get parent
              const getParentSafely = (node) => {
                if (!node) return null;
                try {
                  return node.getParent();
                } catch (e) {
                  return null;
                }
              };
              
              // Check for lists by traversing up the tree
              let current = anchorNode;
              let depth = 0;
              while (current && depth < 10) {
                if ($isListItemNode(current)) {
                  // Found a list item, find its parent list
                  let listParent = getParentSafely(current);
                  while (listParent && !$isListNode(listParent)) {
                    listParent = getParentSafely(listParent);
                  }
                  
                  if (listParent && $isListNode(listParent)) {
                    try {
                      const listType = listParent.getListType();
                      if (listType === 'bullet') {
                        unorderedListActive = true;
                      } else if (listType === 'number') {
                        orderedListActive = true;
                      }
                    } catch (e) {
                      // Ignore list type errors
                    }
                  }
                  break;
                }
                
                current = getParentSafely(current);
                depth++;
              }
            } catch (e) {
              // Silently fail node traversal
            }
            
            // Update state with active formats
            setActiveHeadingTag(headingTag);
            setIsOrderedListActive(orderedListActive);
            setIsUnorderedListActive(unorderedListActive);
          } catch (e) {
            // Reset all states if there's an error
            setActiveHeadingTag(null);
            setIsOrderedListActive(false);
            setIsUnorderedListActive(false);
            setIsBold(false);
            setIsItalic(false);
            setIsUnderline(false);
            setIsStrikethrough(false);
          }
        });
      } catch (error) {
        // Silently fail the entire update
      }
    };
    
    // Run on mount and register a listener
    updateToolbar();
    
    // Set up two listeners - one for editor changes and one for selection changes
    const removeUpdateListener = editor.registerUpdateListener(() => {
      // Just call updateToolbar - it has its own error handling
      updateToolbar();
    });
    
    // Also register for selection changes
    const removeSelectionListener = editor.registerCommand(
      'selection-change',
      () => {
        updateToolbar();
        return false; // Don't block other handlers
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // Clean up both listeners
    return () => {
      removeUpdateListener();
      removeSelectionListener();
    };
  }, [editor]);

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
          className={isBold ? 'active' : ''}
          aria-pressed={isBold}
        >
          <svg className="icon-bold" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12H14C16.2091 12 18 10.2091 18 8C18 5.79086 16.2091 4 14 4H6V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 12H15C17.2091 12 19 13.7909 19 16C19 18.2091 17.2091 20 15 20H6V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} 
          aria-label={t('italic')}
          className={isItalic ? 'active' : ''}
          aria-pressed={isItalic}
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
          className={isUnderline ? 'active' : ''}
          aria-pressed={isUnderline}
        >
          <svg className="icon-underline" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3V10C6 13.3137 8.68629 16 12 16C15.3137 16 18 13.3137 18 10V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 21H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} 
          aria-label={t('strikethrough')}
          className={isStrikethrough ? 'active' : ''}
          aria-pressed={isStrikethrough}
        >
          <svg className="icon-strikethrough" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 6C16 6 14.5 4 12 4C9.5 4 8 5.5 8 7.5C8 9.5 9 10 12 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 13C15.5 14 16 15 16 17C16 19.5 13.5 20.5 12 20.5C10 20.5 8 19 8 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="toolbar-group">
        <button 
          onClick={() => setHeading('h1')} 
          aria-label={t('heading1')} 
          className={`heading-button ${activeHeadingTag === 'h1' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h1' ? true : false}
        >
          H1
        </button>
        <button 
          onClick={() => setHeading('h2')} 
          aria-label={t('heading2')} 
          className={`heading-button ${activeHeadingTag === 'h2' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h2' ? true : false}
        >
          H2
        </button>
        <button 
          onClick={() => setHeading('h3')} 
          aria-label={t('heading3')} 
          className={`heading-button ${activeHeadingTag === 'h3' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h3' ? true : false}
        >
          H3
        </button>
        <button 
          onClick={() => setHeading('h4')} 
          aria-label={t('heading4')} 
          className={`heading-button ${activeHeadingTag === 'h4' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h4' ? true : false}
        >
          H4
        </button>
        <button 
          onClick={() => setHeading('h5')} 
          aria-label={t('heading5')} 
          className={`heading-button ${activeHeadingTag === 'h5' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h5' ? true : false}
        >
          H5
        </button>
        <button 
          onClick={() => setHeading('h6')} 
          aria-label={t('heading6')} 
          className={`heading-button ${activeHeadingTag === 'h6' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h6' ? true : false}
        >
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
          onClick={() => toggleList('bullet')} 
          aria-label={t('bulletList')}
          className={isUnorderedListActive ? 'active' : ''}
          aria-pressed={isUnorderedListActive ? true : false}
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
          onClick={() => toggleList('number')} 
          aria-label={t('numberedList')}
          className={isOrderedListActive ? 'active' : ''}
          aria-pressed={isOrderedListActive ? true : false}
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