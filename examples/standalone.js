import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Editor from '../src/components/Editor';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/utils/i18n';
import '../src/styles/Editor.css';

function SimpleEditorDemo() {
  const [content, setContent] = useState('');

  return (
    <I18nextProvider i18n={i18n}>
      <div>
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

// Make sure DOM is loaded before mounting
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('example-root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <SimpleEditorDemo />
      </React.StrictMode>
    );
  } else {
    console.error("Container element #example-root not found!");
  }
});