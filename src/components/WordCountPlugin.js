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
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent();
        setWordCount(countWords(text));
        setCharCount(text.length);
      });
    });
  }, [editor]);

  return (
    <div className="editor-word-count" role="status" aria-live="polite">
      {t('wordCount', { count: wordCount })}, {t('charCount', { count: charCount })}
    </div>
  );
}
