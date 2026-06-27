// html-to-nodes.js
// Convert an HTML string into Lexical nodes for a given editor.
import { $generateNodesFromDOM } from '@lexical/html';

/**
 * Parse an HTML string and convert it to Lexical nodes for the given editor.
 *
 * Must be called inside an `editor.update()` (or an `editorState` init
 * function) so Lexical's `$` helpers have an active editor state. Callers that
 * accept untrusted input should sanitize the HTML before passing it in (see
 * `sanitize-html.js`); trusted host content can be passed as-is to preserve
 * full fidelity (images, tables, code blocks).
 *
 * @param {import('lexical').LexicalEditor} editor active editor
 * @param {string} html HTML to convert
 * @returns {import('lexical').LexicalNode[]} generated nodes
 */
export function htmlToNodes(editor, html) {
  const dom = new DOMParser().parseFromString(html, 'text/html');
  return $generateNodesFromDOM(editor, dom);
}
