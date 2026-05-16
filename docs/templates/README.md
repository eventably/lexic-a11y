# {{Project / Package Name}}

> One-sentence description.

## Features

- ...

## Install

```sh
npm install {{package-name}}
```

## Usage

```js
// minimal example
```

## API

Document public exports here. For richer docs, wire TypeDoc into the build.

## Development

```sh
npm install
npm run check:all
```

See [scripts](#scripts) for the full list.

## Scripts

| Script              | Purpose                                                      |
| ------------------- | ------------------------------------------------------------ |
| `npm run dev`       | Start local dev server (demo)                                |
| `npm run build`     | Build the library                                            |
| `npm test`          | Run the test suite                                           |
| `npm run lint`      | Run ESLint                                                   |
| `npm run check`     | Lint + format + stylelint + markdownlint                     |
| `npm run check:all` | Full gate: check + test + build + dupes + security + license |

## Contributing

1. Fork + branch off `develop` (`feature/<issue>-<slug>`).
2. Run `npm run check:all` before opening a PR.
3. Use Conventional Commits (enforced by commitlint).

## License

MIT
