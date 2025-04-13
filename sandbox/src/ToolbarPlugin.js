import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useTranslation } from 'react-i18next';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_NORMAL,
  $createParagraphNode,
  $getRoot,
} from 'lexical';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const { t } = useTranslation();

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  };

  const formatStrikethrough = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
  };

  const insertOrderedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const insertUnorderedList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatHeading = (headingSize) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(`h${headingSize}`));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  return (
    <div className="editor-toolbar" aria-label={t('editorToolbar')}>
      <div className="toolbar-group">
        <button onClick={formatBold} aria-label={t('bold')}>
          <strong>B</strong>
        </button>
        <button onClick={formatItalic} aria-label={t('italic')}>
          <em>I</em>
        </button>
        <button onClick={formatUnderline} aria-label={t('underline')}>
          <u>U</u>
        </button>
        <button onClick={formatStrikethrough} aria-label={t('strikethrough')}>
          <s>S</s>
        </button>
      </div>
      
      <div className="toolbar-group">
        <button onClick={() => formatHeading(1)} className="heading-button" aria-label={t('heading1')}>
          {t('heading1')}
        </button>
        <button onClick={() => formatHeading(2)} className="heading-button" aria-label={t('heading2')}>
          {t('heading2')}
        </button>
        <button onClick={() => formatHeading(3)} className="heading-button" aria-label={t('heading3')}>
          {t('heading3')}
        </button>
        <button onClick={formatParagraph} className="heading-button" aria-label="Paragraph">
          P
        </button>
      </div>
      
      <div className="toolbar-group">
        <button onClick={insertOrderedList} aria-label={t('orderedList')}>
          1.
        </button>
        <button onClick={insertUnorderedList} aria-label={t('unorderedList')}>
          •
        </button>
      </div>
    </div>
  );
}