import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleEditor from './SimpleEditor';

// Use the new React 18 API
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SimpleEditor />
  </React.StrictMode>
);