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
  SELECTION_CHANGE_COMMAND,
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

function ensureHttpProtocol(url) {
  if (!url) return url;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function ToolbarPlugin({ showDocs, setShowDocs, docsButtonRef }) {
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
  const [, setIsEditorFocused] = useState(false);
  const dialogRef = useRef(null);
  const urlInputRef = useRef(null);
  const linkButtonRef = useRef(null);
  const selectionRef = useRef(null);

  // Helper to apply heading formatting with toggle functionality
  const setHeading = useCallback((tag) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      let isAlreadyHeadingType = false;
      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();
      const anchorParent = anchorNode.getParent();
      const focusParent = focusNode.getParent();

      if (
        ($isHeadingNode(anchorParent) && anchorParent.getTag() === tag) ||
        ($isHeadingNode(focusParent) && focusParent.getTag() === tag)
      ) {
        isAlreadyHeadingType = true;
      }

      try {
        if (isAlreadyHeadingType) {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        }
      } catch (error) {
        console.error('Error applying heading:', error);
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

  // Helper to ensure editor focus before executing a toolbar action
  const handleButtonKeyDown = useCallback((e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      editor.focus();
      setTimeout(() => {
        action();
      }, 0);
    }
  }, [editor]);

  // Tab from help button to editor content area
  const handleToolbarKeyDown = useCallback((e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.classList.contains('docs-button')) {
        e.preventDefault();
        const editorBox = activeElement.closest('.editor-box');
        if (editorBox) {
          const contentEditable = editorBox.querySelector('.editor-input');
          if (contentEditable) {
            contentEditable.focus();
          }
        }
      }
    }
  }, []);

  // Close link dialog and return focus to link button
  const closeLinkDialog = useCallback(() => {
    setShowLinkDialog(false);
    setTimeout(() => {
      setLinkUrl('');
      setLinkText('');
      if (linkButtonRef.current) {
        linkButtonRef.current.focus();
      }
    }, 50);
  }, []);

  // Handle link button click - store selection before opening dialog
  const handleLinkButtonClick = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selectionRef.current = selection.clone();
        const selectedText = selection.getTextContent();
        if (selectedText) {
          setLinkText(selectedText);
        }
      }
    });
    setShowLinkDialog(true);
  }, [editor]);

  // Register keyboard shortcuts (scoped to this editor instance)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (!mod && e.key !== 'Escape') return;

      // Only fire shortcuts when this editor instance is focused
      const rootElement = editor.getRootElement();
      if (!rootElement) return;
      const editorBox = rootElement.closest('.editor-box');
      if (!editorBox || !editorBox.contains(document.activeElement)) return;

      // Shortcuts that Lexical doesn't handle natively
      if (mod && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'k': {
            e.preventDefault();
            handleLinkButtonClick();
            break;
          }
          case 'd':
            e.preventDefault();
            setShowDocs(prevState => !prevState);
            break;
          case '8':
            if (e.shiftKey) {
              e.preventDefault();
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            }
            break;
          case '7':
            if (e.shiftKey) {
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
  }, [editor, setShowDocs, t, setHeading, handleLinkButtonClick]);

  // Register Escape key to close link dialog
  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        if (showLinkDialog) {
          closeLinkDialog();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor, showLinkDialog, closeLinkDialog]);

  // Track editor focus state
  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handleFocus = () => setIsEditorFocused(true);
    const handleBlur = () => setIsEditorFocused(false);

    rootElement.addEventListener('focus', handleFocus);
    rootElement.addEventListener('blur', handleBlur);

    return () => {
      rootElement.removeEventListener('focus', handleFocus);
      rootElement.removeEventListener('blur', handleBlur);
    };
  }, [editor]);

  // Helper function to toggle list formats
  const toggleList = useCallback((listType) => {
    try {
      if (listType === 'bullet' && isUnorderedListActive) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else if (listType === 'number' && isOrderedListActive) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
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

            try {
              const textContent = selection.getTextContent();
              const hasTextAndSelection = textContent && textContent.length > 0 && !selection.isCollapsed();

              let boldActive = false;
              let italicActive = false;
              let underlineActive = false;
              let strikethroughActive = false;

              if (hasTextAndSelection) {
                boldActive = selection.hasFormat('bold');
                italicActive = selection.hasFormat('italic');
                underlineActive = selection.hasFormat('underline');
                strikethroughActive = selection.hasFormat('strikethrough');
              }

              setIsBold(boldActive);
              setIsItalic(italicActive);
              setIsUnderline(underlineActive);
              setIsStrikethrough(strikethroughActive);
            } catch (error) {
              setIsBold(false);
              setIsItalic(false);
              setIsUnderline(false);
              setIsStrikethrough(false);
            }

            let headingTag = null;
            let orderedListActive = false;
            let unorderedListActive = false;

            try {
              const anchorNode = selection.anchor.getNode();
              if (!anchorNode) return;

              const findHeadingTag = (node) => {
                if (!node) return null;
                if ($isHeadingNode(node)) {
                  return node.getTag();
                }
                try {
                  const parent = node.getParent();
                  if (parent && $isHeadingNode(parent)) {
                    return parent.getTag();
                  }
                } catch (e) {
                  // Ignore
                }
                return null;
              };

              headingTag = findHeadingTag(anchorNode);

              const getParentSafely = (node) => {
                if (!node) return null;
                try {
                  return node.getParent();
                } catch (e) {
                  return null;
                }
              };

              let current = anchorNode;
              let depth = 0;
              while (current && depth < 10) {
                if ($isListItemNode(current)) {
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
                      // Ignore
                    }
                  }
                  break;
                }

                current = getParentSafely(current);
                depth++;
              }
            } catch (e) {
              // Silently fail
            }

            setActiveHeadingTag(headingTag);
            setIsOrderedListActive(orderedListActive);
            setIsUnorderedListActive(unorderedListActive);
          } catch (e) {
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
        // Silently fail
      }
    };

    updateToolbar();

    const removeUpdateListener = editor.registerUpdateListener(() => {
      updateToolbar();
    });

    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeUpdateListener();
      removeSelectionListener();
    };
  }, [editor]);

  // Focus URL input when dialog opens
  useEffect(() => {
    if (showLinkDialog && urlInputRef.current) {
      setTimeout(() => {
        urlInputRef.current.focus();
      }, 50);
    }
  }, [showLinkDialog]);

  // Link click handler: open links in new tabs
  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        e.preventDefault();
        window.open(link.href, '_blank', 'noopener,noreferrer');
      }
    };

    rootElement.addEventListener('click', handleClick);
    return () => rootElement.removeEventListener('click', handleClick);
  }, [editor]);

  return (
    <div
      className="editor-toolbar"
      role="toolbar"
      aria-label={t('editorToolbar')}
      onKeyDown={handleToolbarKeyDown}
    >
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'))}
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
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'))}
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
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'))}
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
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'))}
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
          type="button"
          onClick={() => setHeading('h1')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => setHeading('h1'))}
          aria-label={t('heading1')}
          className={`heading-button ${activeHeadingTag === 'h1' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h1' ? true : false}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => setHeading('h2')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => setHeading('h2'))}
          aria-label={t('heading2')}
          className={`heading-button ${activeHeadingTag === 'h2' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h2' ? true : false}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => setHeading('h3')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => setHeading('h3'))}
          aria-label={t('heading3')}
          className={`heading-button ${activeHeadingTag === 'h3' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h3' ? true : false}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => setHeading('h4')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => setHeading('h4'))}
          aria-label={t('heading4')}
          className={`heading-button ${activeHeadingTag === 'h4' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h4' ? true : false}
        >
          H4
        </button>
        <button
          type="button"
          onClick={() => setHeading('h5')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => setHeading('h5'))}
          aria-label={t('heading5')}
          className={`heading-button ${activeHeadingTag === 'h5' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h5' ? true : false}
        >
          H5
        </button>
        <button
          type="button"
          onClick={() => setHeading('h6')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => setHeading('h6'))}
          aria-label={t('heading6')}
          className={`heading-button ${activeHeadingTag === 'h6' ? 'active' : ''}`}
          aria-pressed={activeHeadingTag === 'h6' ? true : false}
        >
          H6
        </button>
      </div>

      <div className="toolbar-group">
        <button
          type="button"
          ref={linkButtonRef}
          className="link-button"
          onClick={handleLinkButtonClick}
          onKeyDown={(e) => handleButtonKeyDown(e, handleLinkButtonClick)}
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
          type="button"
          onClick={() => toggleList('bullet')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => toggleList('bullet'))}
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
          type="button"
          onClick={() => toggleList('number')}
          onKeyDown={(e) => handleButtonKeyDown(e, () => toggleList('number'))}
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
          type="button"
          ref={docsButtonRef}
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
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeLinkDialog();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeLinkDialog();
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
            <h2 id="link-dialog-title">{t('insertLink')}</h2>
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
                  onClick={closeLinkDialog}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className="insert-button"
                  onClick={() => {
                    const finalUrl = ensureHttpProtocol(linkUrl);
                    if (finalUrl) {
                      setShowLinkDialog(false);

                      setTimeout(() => {
                        editor.focus();
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            if (linkText && selection.isCollapsed()) {
                              selection.insertText(linkText);
                              const updatedSelection = $getSelection();
                              if ($isRangeSelection(updatedSelection)) {
                                updatedSelection.modify('backward', linkText.length, 'character');
                                editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
                                  url: finalUrl,
                                  target: '_blank',
                                  rel: 'noopener noreferrer',
                                });
                              }
                            } else {
                              editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
                                url: finalUrl,
                                target: '_blank',
                                rel: 'noopener noreferrer',
                              });
                            }
                          }
                        });
                        setLinkUrl('');
                        setLinkText('');
                      }, 50);
                    } else {
                      closeLinkDialog();
                    }
                  }}
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
