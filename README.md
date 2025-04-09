# lexic-ally: An accessible Lexical Rich Text Editor Package

A fully featured, accessible, and internationalized rich text editor built with React and Lexical. This package provides a robust, modular editor that supports an extensive array of formatting options and content types. It is designed to be easily integrated into any React application and to serve as a reusable component for projects requiring high accessibility (WCAG compliant) and comprehensive text editing capabilities.

## Overview

lexic-ally is a self-contained, React-based editor that emphasizes accessibility, extensibility, and internationalization. It leverages the modern Lexical framework by Meta to provide a headless editing experience that can be easily extended and customized. Designed with WCAG-compliant practices in mind, it offers a tabbed interface for editing, previewing, and viewing documentation on keyboard shortcuts and usage tips.

## What It Does

* Rich Text Editing: Offers advanced text formatting including bold, italic, underline, strikethrough, and a full range of headings (H1–H6).
* Content Insertion: Supports horizontal rules, links, images (both via URL and local file uploads), and tables with built-in tools to add or remove rows and columns.
* Keyboard Shortcuts: Implements a variety of keyboard shortcuts for quick formatting actions (e.g., Ctrl/Cmd+B for bold, Ctrl/Cmd+Alt+1 for Heading 1) and efficient navigation.
* Tabbed Interface: Provides three modes of operation:
  * Edit: The main editing interface where content is created and formatted.
  * Preview: A read-only view that renders the generated HTML output.
  * Documentation: A built-in guide that details available keyboard shortcuts and usage tips.
* Internationalization (i18n): Integrated with react-i18next to allow localization of toolbar labels and prompts, making it adaptable for multi-language projects.
* Accessibility: Designed with accessibility in mind, including ARIA roles, keyboard navigability, and semantic output to ensure compliance with WCAG standards.

## Features

* Extensive Formatting Options:
  * Text Styling: Bold, Italic, Underline, Strikethrough.
* Headings: H1 through H6 with both toolbar buttons and keyboard shortcuts.
* Horizontal Rule: Insert visual separators.
* Content Elements:
  * Links: Insert and edit hyperlinks.
  * Images: Upload images from local files or insert via URL; supports alt text for accessibility.
  * Tables: Create tables with an initial 3x3 layout, along with tools to add/remove rows and columns, and delete the entire table.
* Keyboard Shortcuts:
  * Basic formatting: Ctrl/Cmd+B, Ctrl/Cmd+I, Ctrl/Cmd+U, etc.
  * Heading shortcuts: Ctrl/Cmd+Alt+[1–6] for H1–H6.
  * Escape key to shift focus (e.g., to the Preview tab).
  * Shortcut to toggle preview mode: Ctrl/Cmd+P.
* Tabbed User Interface:
  * Edit Tab: Where users interact with the full-featured text editor.
  * Preview Tab: Displays the rendered HTML output.
  * Documentation Tab: Lists all available keyboard shortcuts and usage instructions.
* Internationalization (i18n):
  * Built-in support using react-i18next.
  * Easy to add new languages and localize toolbar and prompt texts.
* Accessibility (WCAG Compliant):
  * ARIA roles and labels throughout the UI.
  * Fully keyboard accessible.
  * Semantic HTML output for screen readers and other assistive technologies.

## Installation

### Prerequisites

* Node.js (v12+ recommended)
* React (v16.8+ for Hooks support)
* Package Manager (npm, Yarn, or similar)

### Steps

1. Clone the Repository:

```bash
git clone git@github.com:eventably/lexic-a11y.git
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

3. Build the Package (if applicable):

If you plan to reuse this package in other projects, you can build it as a library:

```bash
npm run build
```

This will generate a bundled version of the editor that can be imported into your projects.

## Usage

Integration in a React Project

1. Import the Editor Component:

In your React application, import the main Editor component:

```javascript
import React, { useState } from 'react';
import Editor from 'path-to-your-built-package/Editor';

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

2. i18n Setup:

Make sure your project wraps the application with an i18n provider:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18n from 'path-to-your-built-package/i18n';

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>,
  document.getElementById('root')
);
```

3. Styling:

Include the provided CSS file (Editor.css) in your project to ensure proper styling of the tabs, toolbar, and editor components.

## Customizing the Theme

* The editor accepts a theme object via the configuration in Editor.js that lets you define class names for various parts of the editor.
* Customize colors, fonts, and spacing in Editor.css to match your project’s design guidelines.

## Adding or Modifying Features

* Keyboard Shortcuts: The shortcuts are registered in ToolbarPlugin.js using event listeners. You can modify the key combinations or add new ones as needed.
* Internationalization: Update the i18n.js file to add additional languages or modify existing translations. Use the useTranslation hook within any component to localize additional UI elements.
* Extending Content Types: The editor is built with Lexical’s modular architecture. To add further formatting options (e.g., new block types or custom commands), follow Lexical’s documentation to create and register new nodes.
* Image and Table Tools: The image upload and table editing functionalities are implemented using file inputs and Lexical commands. They can be customized or extended by modifying the corresponding sections in ToolbarPlugin.js.

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

3. Building for Production:

Once you are satisfied with your changes, build the package for production:

```bash
npm run build
```

The production-ready files will be output to the /build directory.

## Contributing

We welcome contributions from the community! If you’d like to contribute:

* Fork the Repository: Create your own fork and submit pull requests.
* Submit Issues: Report bugs or request features using the repository’s issue tracker.
* Follow the Code Style: Ensure your code aligns with the existing style and includes appropriate documentation/comments.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
