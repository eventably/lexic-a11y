// InitialContentPlugin.js
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection } from 'lexical';
import { useEffect, useRef } from 'react';

import { htmlToNodes } from '../utils/html-to-nodes';

/**
 * Seeds the editor with initial HTML content exactly once, on mount.
 *
 * The host application supplies trusted HTML (e.g. a saved draft or a
 * pre-filled template), so the content is converted faithfully via
 * `$generateNodesFromDOM` without the strict paste sanitizer — preserving
 * images, tables, and code blocks. The seed runs a single time; later changes
 * to `html` are ignored so a user's edits are never clobbered by a re-render.
 *
 * @param {object} props
 * @param {string} [props.html] initial HTML content; falsy values are a no-op
 * @returns {null}
 */
export function InitialContentPlugin({ html }) {
  const [editor] = useLexicalComposerContext();
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current || !html) {
      return;
    }
    seededRef.current = true;

    editor.update(() => {
      const root = $getRoot();
      // Replace the default empty paragraph, then insert the parsed nodes at a
      // root selection so inline/text nodes are wrapped into blocks correctly.
      const nodes = htmlToNodes(editor, html);
      root.clear();
      root.select();
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes(nodes);
      } else {
        root.append(...nodes);
      }
    });
  }, [editor, html]);

  return null;
}
