// WordCountPlugin.js
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Count words in a text string; whitespace-only text counts as zero words
export function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function WordCountPlugin() {
  const [editor] = useLexicalComposerContext();
  const { t } = useTranslation();
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    // Debounce so rapid typing doesn't recompute on every keystroke or flood
    // the polite live region with announcements; counts settle ~400ms after the
    // user pauses.
    let timeoutId;
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        editorState.read(() => {
          const text = $getRoot().getTextContent();
          setWordCount(countWords(text));
          setCharCount(text.length);
        });
      }, 400);
    });
    return () => {
      clearTimeout(timeoutId);
      unregister();
    };
  }, [editor]);

  return (
    <div className="editor-word-count" role="status" aria-live="polite">
      {t('wordCount', { count: wordCount })}, {t('charCount', { count: charCount })}
    </div>
  );
}
