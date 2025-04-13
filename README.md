# lexic-a11y: An accessible Lexical Rich Text Editor Package

An accessible and internationalized rich text editor built with React and Lexical. This package provides a modular editor focused on accessibility that supports core formatting options. It is designed to be easily integrated into any React application and to serve as a reusable component for projects requiring high accessibility (WCAG compliant) text editing capabilities.

## Overview

lexic-a11y is a self-contained, React-based editor that emphasizes accessibility, extensibility, and internationalization. It leverages the modern Lexical framework by Meta to provide a headless editing experience that can be easily extended and customized. Designed with WCAG-compliant practices in mind, it provides keyboard shortcuts and accessibility features that make rich text editing more accessible to all users.

## What It Does

* Rich Text Editing: Offers essential text formatting including bold, italic, underline, strikethrough, and a full range of headings (H1–H6).
* List Support: Create and manage ordered and unordered lists with proper semantic structure.
* Link Management: Insert and edit hyperlinks with an accessible dialog interface.
* Keyboard Shortcuts: Implements a variety of keyboard shortcuts for quick formatting actions (e.g., Ctrl/Cmd+B for bold, Ctrl/Cmd+Alt+1 for Heading 1) and efficient navigation.
* Documentation: Provides an overlay with available keyboard shortcuts and usage tips.
* Internationalization (i18n): Integrated with react-i18next to allow localization of toolbar labels and prompts, making it adaptable for multi-language projects.
* Accessibility: Designed with accessibility in mind, including ARIA roles, keyboard navigability, and semantic output to ensure compliance with WCAG standards.

## Features

* Core Formatting Options:
  * Text Styling: Bold, Italic, Underline, Strikethrough.
  * Headings: H1 through H6 with both toolbar buttons and keyboard shortcuts.
* List Formatting:
  * Ordered Lists: Create numbered lists with proper semantic structure.
  * Unordered Lists: Create bullet lists with proper semantic structure.
* Content Elements:
  * Links: Insert and edit hyperlinks with an accessible dialog.
* Keyboard Shortcuts:
  * Basic formatting: Ctrl/Cmd+B for bold, Ctrl/Cmd+I for italic, Ctrl/Cmd+U for underline.
  * Heading shortcuts: Ctrl/Cmd+Alt+[1–6] for H1–H6.
  * List shortcuts: Ctrl/Cmd+Shift+7 for ordered lists, Ctrl/Cmd+Shift+8 for unordered lists.
  * Link shortcut: Ctrl/Cmd+K to insert or edit links.
* Documentation:
  * Keyboard Shortcuts Help: Overlay displaying all available keyboard commands.
* Internationalization (i18n):
  * Built-in support using react-i18next.
  * Easy to add new languages and localize toolbar and prompt texts.
* Accessibility (WCAG Compliant):
  * ARIA roles and labels throughout the UI.
  * Fully keyboard accessible.
  * Semantic HTML output for screen readers and other assistive technologies.

## Installation

### Prerequisites

* Node.js (v14+ recommended)
* React (v16.8+, v17.0.0+, or v18.0.0+ for Hooks support)
* Package Manager (npm, Yarn, or similar)

### Steps

1. Clone the Repository:

```bash
git clone https://github.com/eventably/lexic-a11y.git
cd lexic-a11y
```

2. Install Dependencies:

```bash
npm install
```

or

```bash
yarn install
```

3. Build the Package:

If you plan to reuse this package in other projects, you can build it as a library:

```bash
npm run build
```

This will generate a bundled version of the editor that can be imported into your projects.

## Usage

### Integration in a React Project

#### 1. Import the Editor Component

In your React application, import the main Editor component:

```javascript
import React, { useState } from 'react';
import Editor from '@eventably/lexic-a11y';
import '@eventably/lexic-a11y/dist/styles.css'; // Import the styles

export default function App() {
  const [content, setContent] = useState('');

  return (
    <div>
      <h1>My Application with Lexical Editor</h1>
      <Editor onContentChange={setContent} />
      <h2>Output HTML</h2>
      <pre>{content}</pre>
    </div>
  );
}
```

#### 2. i18n Setup

Make sure your project wraps the application with an i18n provider:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18n from '@eventably/lexic-a11y/dist/i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);
```

#### 3. Styling

The CSS is included when you import the styles as shown above. This provides styling for the toolbar and editor components.

### Customizing the Editor

* **Theme**: The editor accepts a theme object via the configuration in Editor.js that lets you define class names for various parts of the editor.
* **Custom Styling**: Customize colors, fonts, and spacing by overriding the CSS classes to match your project's design guidelines.

### Extending the Editor

* **Keyboard Shortcuts**: The shortcuts are registered in ToolbarPlugin.js using event listeners. You can modify the key combinations or add new ones as needed.
* **Internationalization**: Update the i18n.js file to add additional languages or modify existing translations. Use the useTranslation hook within any component to localize additional UI elements.
* **Adding Features**: The editor is built with Lexical's modular architecture. To add further formatting options (e.g., images, horizontal rules, tables), follow Lexical's documentation to create and register new nodes.

## Development

### Running the Editor Locally

To run the editor in a development environment:

1. Start the Development Server:

```bash
npm start
```

This will launch the application in development mode. Open http://localhost:3000 to view it in your browser.

2. Making Changes:

* Edit the source files in the /src directory.
* The development server supports hot reloading, so your changes will appear automatically.

3. Running the Example Demo:

The repository includes a simple example implementation that showcases how to use the editor component:

```bash
# First build the library
npm run build

# Then run the example
npm run example
```

This will start a development server with the example at http://localhost:1234. The example demonstrates a basic integration of the editor component and displays the generated HTML output.

You can also view the demo directly with:

```bash
npm run build && npm run example
```

### Try it on CodeSandbox

You can also try the editor directly on CodeSandbox without installing anything locally:

[![Edit lexic-a11y](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/github/eventably/lexic-a11y/tree/develop/sandbox)

This opens our dedicated sandbox demo where you can interact with the editor and see how it works.

### Building for Production:

Once you are satisfied with your changes, build the package for production:

```bash
npm run build
```

The production-ready files will be output to the /dist directory.

## Contributing

We welcome contributions from the community! If you'd like to contribute:

* Fork the Repository: Create your own fork and submit pull requests.
* Submit Issues: Report bugs or request features using the repository's issue tracker.
* Follow the Code Style: Ensure your code aligns with the existing style and includes appropriate documentation/comments.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.