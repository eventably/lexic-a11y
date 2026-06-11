// markdown-transformers.js
import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  HEADING,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
} from '@lexical/markdown';

// Markdown shortcut transformers curated to the node types actually
// registered in the editor (HeadingNode, ListNode/ListItemNode, QuoteNode,
// LinkNode) plus text formats the theme styles.
//
// Deliberately excluded:
// - CODE (requires CodeNode, not registered)
// - INLINE_CODE (the 'code' text format has no styling in the editor theme;
//   inline/block code lands with issue #25)
// - CHECK_LIST (check lists are not supported)
// - HIGHLIGHT (the 'highlight' text format has no styling in the theme)
export const EDITOR_TRANSFORMERS = [
  // Element transformers (block-level)
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  // Text-format transformers (inline)
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  // Text-match transformers
  LINK,
];
