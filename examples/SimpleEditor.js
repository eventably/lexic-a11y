import React, { useState } from 'react';
import Editor from '../dist/index';
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
      <div className="simple-editor-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1>Lexical Accessible Editor Example</h1>
        <Editor onContentChange={setContent} />
        <div className="output-container" style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h2>Generated HTML</h2>
          <pre className="html-output" style={{ overflowX: 'auto', padding: '10px', backgroundColor: '#fff', border: '1px solid #ddd' }}>{content}</pre>
        </div>
      </div>
    </I18nextProvider>
  );
}