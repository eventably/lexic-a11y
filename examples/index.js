import React from 'react';
import { createRoot } from 'react-dom/client';
import SimpleEditor from './SimpleEditor';

// Only mount once when the page loads for the first time
if (!window.hasRendered) {
  window.hasRendered = true;
  
  const container = document.getElementById('root');
  const root = createRoot(container);
  
  root.render(
    <React.StrictMode>
      <SimpleEditor />
    </React.StrictMode>
  );
}