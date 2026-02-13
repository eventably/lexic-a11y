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

## Git Workflow

This project follows **Git Flow**. You MUST adhere to this branching strategy:

- **`main`** — Production-ready code only. Never commit directly to main.
- **`develop`** — Integration branch. All feature work merges here first.
- **`feature/*`** — Branch off `develop` for new work. Name: `feature/<issue#>-<short-description>` (e.g., `feature/7-repo-standardization`).
- **`hotfix/*`** — Branch off `main` for urgent production fixes. Merge back into both `main` and `develop`.
- **`release/*`** — Branch off `develop` when preparing a release. Merge into both `main` and `develop`.

### Rules

1. Always create a feature branch off `develop` before making changes.
2. Never push directly to `main` or `develop` — always use pull requests.
3. PR target for features: `develop`. PR target for hotfixes: `main`.
4. Delete feature branches after merging.

## Code Style Guidelines

- Use functional React components with hooks
- Import order: React/core libraries → third-party → local files
- File/component naming: PascalCase for components, camelCase for utilities
- Use destructuring for props and state
- Maintain accessibility features (ARIA roles, labels, keyboard support)
- Error handling: Use try/catch for async operations
- Ensure proper aria-\* attributes on interactive elements
- Follow i18n patterns using react-i18next's useTranslation hook
- Always provide alt text for images and proper ARIA attributes
- Run ESLint with jsx-a11y plugin to catch accessibility issues
