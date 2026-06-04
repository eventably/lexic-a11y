# Use Cases

Every user interaction the editor supports, documented in the
[`@afixt/usecase-runner`](https://www.npmjs.com/package/@afixt/usecase-runner)
YAML DSL so they can be exercised by automation. Generated tests target elements
exclusively through ARIA roles and accessible names — every failure is an
accessibility finding.

## Coverage

| Interaction                                   | Use case                                |
| --------------------------------------------- | --------------------------------------- |
| Focus the editor and type text                | `01-text-entry.uc.yaml`                 |
| Bold / italic / underline / strikethrough     | `02-inline-formatting-toolbar.uc.yaml`  |
| Same formats via Ctrl/Cmd+B / +I / +U         | `03-inline-formatting-keyboard.uc.yaml` |
| Heading levels via toolbar and Ctrl+Alt+[1-6] | `04-headings.uc.yaml`                   |
| Bullet/numbered lists, toolbar + shortcuts    | `05-lists.uc.yaml`                      |
| Insert a link via the accessible dialog       | `06-link-insert.uc.yaml`                |
| Cancel/Escape out of the link dialog          | `07-link-cancel.uc.yaml`                |
| Help overlay open/close, button + Ctrl/Cmd+D  | `08-help-overlay.uc.yaml`               |
| Undo / redo from the keyboard                 | `09-undo-redo.uc.yaml`                  |
| Automated WCAG audits (page + dialog scoped)  | `10-page-audit.uc.yaml`                 |

Toolbar toggle state is asserted through `aria-pressed` so each use case also
verifies the control semantics, not just the visual result.

## Assumed accessible names

The use cases address controls by the accessible names on the current feature
branches (PRs #50 and #51), which fix labels that previously rendered as raw
i18n keys:

- The editor surface: `Editor content` (added in PR #50)
- `Bullet List`, `Numbered List`, `Show Help` (translations added in PR #50)
- `Insert Link` (renamed from the uninformative `Link` in PR #51)

If a use case fails to locate one of these controls, check that those PRs have
merged — a failure here means the accessible name regressed.

## Running them

The runner is not a dependency of this package; install it where you want to
execute the use cases (Node >= 22):

```bash
npm install --no-save @afixt/usecase-runner @playwright/test
npx playwright install chromium

# Start the demo app in another shell
npm start

# Validate the YAML
npx usecase-runner validate usecases/*.uc.yaml

# Generate Playwright tests and run them
npx usecase-runner generate usecases/*.uc.yaml --outdir ./tests/generated --run
```

All ten use cases in this directory pass `npx usecase-runner validate` (v1.4.1).
