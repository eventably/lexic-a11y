// Main entry point for the demo React app
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize the root element
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Also export the components for library usage
import Editor from './components/Editor';
import { ToolbarPlugin } from './components/ToolbarPlugin';
import i18n from './utils/i18n';

export { Editor as default, ToolbarPlugin, i18n };