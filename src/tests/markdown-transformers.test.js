// Uses the real @lexical/markdown module (no mocks) to validate that the
// curated transformer set only relies on node types the editor registers.
import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import {
  CHECK_LIST,
  CODE,
  HEADING,
  HIGHLIGHT,
  INLINE_CODE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  UNORDERED_LIST,
} from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

import { EDITOR_TRANSFORMERS } from '../utils/markdown-transformers';

// Must mirror editorConfig.nodes in src/components/Editor.js
const REGISTERED_NODES = [HeadingNode, ListNode, ListItemNode, QuoteNode, LinkNode];

describe('EDITOR_TRANSFORMERS', () => {
  it('includes the supported block transformers', () => {
    expect(EDITOR_TRANSFORMERS).toContain(HEADING);
    expect(EDITOR_TRANSFORMERS).toContain(QUOTE);
    expect(EDITOR_TRANSFORMERS).toContain(UNORDERED_LIST);
    expect(EDITOR_TRANSFORMERS).toContain(ORDERED_LIST);
    expect(EDITOR_TRANSFORMERS).toContain(LINK);
  });

  it('only depends on node types registered in the editor', () => {
    EDITOR_TRANSFORMERS.forEach((transformer) => {
      const dependencies = transformer.dependencies || [];
      dependencies.forEach((dependency) => {
        expect(REGISTERED_NODES).toContain(dependency);
      });
    });
  });

  it('excludes transformers for unregistered node types', () => {
    // CODE requires CodeNode, CHECK_LIST requires check-list support
    expect(EDITOR_TRANSFORMERS).not.toContain(CODE);
    expect(EDITOR_TRANSFORMERS).not.toContain(CHECK_LIST);
  });

  it('excludes text formats the editor theme does not style', () => {
    expect(EDITOR_TRANSFORMERS).not.toContain(INLINE_CODE);
    expect(EDITOR_TRANSFORMERS).not.toContain(HIGHLIGHT);
  });
});
