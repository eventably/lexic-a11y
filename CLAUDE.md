# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@eventably/lexic-a11y` is an accessible, internationalized rich text editor React component built on Meta's Lexical framework. It is published as an npm library (CJS + ESM via Rollup) and also has a demo app (via react-scripts).

## Commands

- Install: `npm install`
- Build library (Rollup → `dist/`): `npm run build`
- Start demo dev server: `npm start` (react-scripts, port 3000)
- Run all tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run a single test file: `npx jest src/tests/Editor.test.js`
- Run a single test by name: `npx jest -t "renders without crashing"`
- Lint: `npm run lint`
- Run example demo: `npm run build && npm run example` (Parcel, port 1234)

## Architecture

### Dual entry points
- `src/index.js` — Demo app entry (renders `<App />` into DOM) AND re-exports library components (`Editor`, `ToolbarPlugin`, `i18n`)
- `src/index.react.js` — Clean React-only entry (just renders `<App />`, used by react-scripts)
- Rollup reads `src/index.js` to produce `dist/index.js` (CJS) and `dist/index.esm.js` (ESM), with CSS extracted to `dist/styles.css`

### Core components
- `src/components/Editor.js` — Main editor component. Composes Lexical's `LexicalComposer` with `RichTextPlugin`, `HistoryPlugin`, `LinkPlugin`, `ListPlugin`, and `OnChangePlugin`. Accepts an `onContentChange` callback that receives cleaned HTML (utility classes stripped). Contains the keyboard shortcuts documentation overlay.
- `src/components/ToolbarPlugin.js` — Toolbar with formatting buttons (bold, italic, underline, strikethrough, H1-H6, lists, links). Manages active state tracking by listening to editor update and selection-change events. Registers keyboard shortcuts via a document-level `keydown` listener. Contains the link insertion dialog (`role="dialog"`, `aria-modal`).

### Supporting files
- `src/utils/i18n.js` — i18next configuration with English translations. All toolbar labels and dialog strings use `useTranslation()` hook with keys defined here.
- `src/styles/Editor.css` — All editor styling (toolbar, editor area, link dialog, docs overlay)
- `src/App.js` — Demo wrapper that provides `I18nextProvider` and renders `Editor`

### Lexical node types registered
`HeadingNode`, `ListNode`, `ListItemNode`, `QuoteNode`, `LinkNode` (ImageNode and HorizontalRuleNode are commented out as future work)

### Testing approach
- Jest + jsdom + React Testing Library + user-event
- All Lexical internals are mocked (`@lexical/react/*`, `@lexical/html`) — tests verify component rendering and UI interactions, not Lexical editor behavior
- CSS imports are handled by `identity-obj-proxy`
- `jest.setup.js` mocks `window.matchMedia` and `HTMLCanvasElement.getContext`
- Tests wrap components with `I18nextProvider` using the real i18n config

## Code Style

- Functional React components with hooks
- Import order: React/core → third-party (`lexical`, `react-i18next`) → local files
- PascalCase for components, camelCase for utilities
- ESLint extends `eslint:recommended`, `plugin:react/recommended`, `plugin:react-hooks/recommended`, `plugin:jsx-a11y/recommended`
- `react/prop-types` is disabled
- All toolbar buttons must have `aria-label` (via i18n `t()` function) and toggle buttons must use `aria-pressed`
- SVG icons use `aria-hidden="true"` with labels on the parent button
- Keyboard shortcuts use `metaKey` on Mac, `ctrlKey` on other platforms
