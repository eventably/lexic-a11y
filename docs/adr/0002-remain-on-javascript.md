# ADR 0002: Remain on JavaScript (no TypeScript migration)

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** @karlgroves

## Context

Issue #14 (standardized tooling stack) proposed TypeScript with `strict: true`
(plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
`noImplicitOverride`) and `ts-reset` as the project foundation. The rest of that
issue's stack — flat ESLint config with the full plugin set, Prettier, Stylelint
with a11y rules, markdownlint, jscpd, lychee, license checking, size-limit,
layered Husky gates, security scanning, ADR/README templates — was delivered in
PR #15 (with the demo tooling moving to Vite in PR #12).

The same issue also set a ground rule: _"Do not replace anything that already
exists in this project unless the new proposal leads to a demonstrably higher
quality outcome … When in doubt, document the decision as an ADR rather than
swapping silently."_

The codebase is a small, mature JavaScript package (~10 source files): React
components around Lexical, with co-located Jest suites, a Playwright E2E suite,
and accessibility assertions at the component and browser levels.

## Decision

We will keep the source in JavaScript and will not migrate to TypeScript at this
time.

A full migration would touch every file in the package for a codebase this
small, invalidating open feature branches and the entire test-mock layer
(`jest.mock` factories typed against Lexical's API), while the marginal type
safety is already partially provided by:

- Lexical's own TypeScript definitions, which editors surface in JS files via
  `checkJs`-style inference;
- the ESLint correctness tier (`eslint-plugin-promise`, sonarjs, import-x);
- the unit/E2E suites that pin behavioral contracts.

## Alternatives considered

- **Full strict TS migration (as specified in #14)** — rejected for now: the
  conversion cost lands on every file and every open PR for a package with a
  stable, small API surface. Rejected per the issue's own no-regression ground
  rule rather than on the merits of TypeScript itself.
- **Incremental adoption (`allowJs` + new files in TS)** — viable later, but a
  mixed codebase adds config complexity (two lint parser configs, mixed Jest
  transforms) that outweighs the benefit at the current file count.
- **JSDoc + `tsc --checkJs` in CI** — lighter-weight option worth revisiting;
  not adopted now to keep the gate fast and the stack stable.

## Consequences

- **Positive:** open feature branches merge without churn; the tooling stack
  from #14 remains fully in force; contributors need no TS toolchain.
- **Negative:** no compile-time type checking; API misuse surfaces at test time
  rather than build time.
- **Follow-ups:** revisit if the package grows materially (e.g., >30 source
  files), if a public typed API becomes a consumer requirement, or when Lexical
  major upgrades make type-guided refactoring valuable. Track via a fresh issue
  at that point.

## References

- Issue: #14
- Delivered stack: PR #15 (tooling), PR #12 (Vite)
- Related: PR #50 (Playwright E2E + axe), PR #51 (component-level accessibility
  assertions)
