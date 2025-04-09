# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
- React-based rich text editor using Lexical
- Accessibility-focused implementation with ARIA attributes
- i18n support via react-i18next

## Commands
- Install: `npm install`
- Start dev server: `npm start`
- Build package: `npm run build`
- Run tests: `npm test`
- Run tests with watch: `npm run test:watch`
- Lint code: `npm run lint`

## Code Style Guidelines
- Use functional React components with hooks
- Import order: React/core libraries → third-party → local files
- File/component naming: PascalCase for components, camelCase for utilities
- Use destructuring for props and state
- Maintain accessibility features (ARIA roles, labels, keyboard support)
- Error handling: Use try/catch for async operations
- Ensure proper aria-* attributes on interactive elements
- Follow i18n patterns using react-i18next's useTranslation hook
- Always provide alt text for images and proper ARIA attributes
- Run ESLint with jsx-a11y plugin to catch accessibility issues