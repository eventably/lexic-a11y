// PastePlugin.js
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from 'lexical';
import { useEffect, useRef } from 'react';

import { sanitizePastedHtml } from '../utils/sanitize-html';

// Sanitizes pasted HTML to the editor's supported node set and provides a
// paste-as-plain-text path via Ctrl/Cmd+Shift+V.
export function PastePlugin() {
  const [editor] = useLexicalComposerContext();
  const plainTextNextRef = useRef(false);

  // Track Ctrl/Cmd+Shift+V so the next paste is treated as plain text
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === 'v') {
        plainTextNextRef.current = true;
        // Reset if no paste event follows shortly
        setTimeout(() => {
          plainTextNextRef.current = false;
        }, 1000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const clipboardData = event && event.clipboardData ? event.clipboardData : null;
        if (!clipboardData) return false;

        const html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text/plain');
        const asPlainText = plainTextNextRef.current;
        plainTextNextRef.current = false;

        // Plain-text path: explicit Ctrl/Cmd+Shift+V, or no HTML available
        if (asPlainText || !html) {
          if (!text) return false;
          event.preventDefault();
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(text);
            }
          });
          return true;
        }

        // Rich path: sanitize, then convert to supported Lexical nodes
        event.preventDefault();
        editor.update(() => {
          try {
            const cleanHtml = sanitizePastedHtml(html);
            const dom = new DOMParser().parseFromString(cleanHtml, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertNodes(nodes);
            }
          } catch (error) {
            console.error('Error sanitizing pasted content:', error);
            // Fall back to plain text so the paste is never lost
            const selection = $getSelection();
            if ($isRangeSelection(selection) && text) {
              selection.insertRawText(text);
            }
          }
        });
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
