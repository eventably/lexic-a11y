// This file is the entry point for CodeSandbox
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import Editor from '../src';
import i18n from '../src/utils/i18n';
import '../src/styles/Editor.css';

// A simplified version of SimpleEditor that imports directly from src instead of dist
function CodeSandboxEditor() {
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

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<CodeSandboxEditor />);