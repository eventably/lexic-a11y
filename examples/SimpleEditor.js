import React, { useState } from 'react';
import Editor from '../src/components/Editor';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/utils/i18n';
import '../src/styles/Editor.css';

/**
 * Simple example of how to use the Editor component
 */
export default function SimpleEditor() {
  const [content, setContent] = useState('');

  return (
    <I18nextProvider i18n={i18n}>
      <div className="simple-editor-wrapper">
        <h1>Lexical Accessible Editor Example</h1>
        <Editor onContentChange={setContent} />
        <div className="output-container">
          <h2>Generated HTML</h2>
          <pre className="html-output">{content}</pre>
        </div>
      </div>
    </I18nextProvider>
  );
}