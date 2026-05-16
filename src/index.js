// Main entry point for the demo React app
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import Editor from './components/Editor';
import { ToolbarPlugin } from './components/ToolbarPlugin';
import i18n from './utils/i18n';

// Initialize the root element
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export { Editor as default, i18n, ToolbarPlugin };
