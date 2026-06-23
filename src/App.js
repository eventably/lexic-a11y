// App.js
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import Editor from './components/Editor';
import './styles/Editor.css';
import i18n from './utils/i18n';

// Demo upload handler: reads the file into a data URL so the upload UI works
// without a backend. A real app would POST the file and return the hosted URL.
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [content, setContent] = useState('');

  return (
    <I18nextProvider i18n={i18n}>
      <div>
        <h1>Lexical Rich Text Editor</h1>
        <Editor onContentChange={setContent} onImageUpload={readFileAsDataUrl} />
        <h2>Output HTML</h2>
        <pre>{content}</pre>
      </div>
    </I18nextProvider>
  );
}
