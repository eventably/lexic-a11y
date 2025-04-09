// App.js
import React, { useState } from 'react';
import Editor from './components/Editor';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';
import './styles/Editor.css';

export default function App() {
  const [content, setContent] = useState('');

  return (
    <I18nextProvider i18n={i18n}>
      <div>
        <h1>Lexical Rich Text Editor</h1>
        <Editor onContentChange={setContent} />
        <h2>Output HTML</h2>
        <pre>{content}</pre>
      </div>
    </I18nextProvider>
  );
}