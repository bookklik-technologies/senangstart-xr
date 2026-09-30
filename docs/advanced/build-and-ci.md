# Build & CI

How the library is built, verified and shipped.

## Toolchain

| Tool | Version | Purpose |
| --- | --- | --- |
| Webpack | ^5.107 | Bundling, dev server |
| Babel | ^7.24 | Transpile to chrome/edge 89, firefox 90, safari 13.1 |
| Jest | ^29 | Unit tests (jsdom + `jest-canvas-mock`) |
| ESLint | 9 | Lint, zero warnings tolerated |
| Prettier | 3 | Formatting |
| Playwright | 1.56.1 | Chromium integration checks (CI) |
| VitePress | ^1.6 | This documentation site |

The source is plain JavaScript (ES2022, CommonJS modules) — there is no
TypeScript in the project.

## Bundle outputs

The webpack build is environment-driven. It emits `senangstart-xr.js`
(development) or `senangstart-xr.min.js` (production) plus a source map, and
copies `Outfit-Regular.ttf` beside the bundle via a custom `BundledFont` plugin.

| Script | Output |
| --- | --- |
| `npm run dist` | `dist/` — production **and** development bundles |
| `npm run dist-min` | `dist/senangstart-xr.min.js` only |
| `npm run dist-dev` | `dist/senangstart-xr.js` only |
| `npm run dist-example` | `examples/js/` development bundle |
| `npm run dist-example-min` | `examples/js/` production bundle |
| `npm run dist:all` | `dist/` and `examples/js/`, both variants |

Production builds use a hidden source map; development builds use
`eval-source-map`.

## Local development

```bash
npm start
```

The webpack-dev-server serves the `examples/` folder at `http://localhost:8080`,
with the showcase scene at the root.

## Verification scripts

| Script | What it checks |
| --- | --- |
| `npm run check:build` | Bundle, source-map and font copies in `dist/` and `examples/js/` are in sync (hash comparison) |
| `npm run check:package` | `npm pack` then a strict consumer install with `aframe@1.8.0`; a failed install fails the check |
| `npm run check:browser` | Playwright integration runner over `scripts/fixtures/aframe.html` |
| `npm run audit:prod` | `npm audit` for production dependencies only |
| `npm run lint` | ESLint over `src/`, `tests/`, `scripts/` with `--max-warnings=0` |

## Tests

```bash
npm test          # single run
npm run test:watch
```

The suite is 14 Jest suites / 108 tests covering widgets, keyboard behavior,
sliders, flex layout, live updates, native editing, disabled states, cursor,
bevelbox, circle widgets, text and fonts, rounded panels and the `SXR` helpers.

### Docs-drift test

`tests/docs-drift.test.js` guarantees the documentation cannot drift from the
code. It loads the real components, then parses the documentation pages and
asserts that:

1. every component listed in the overview table registers its documented primitive
2. every documented property has a matching primitive mapping
3. every documented default value matches the component schema

The test reads the component tables from the pages under
[`docs/components/`](/components/) and the overview from
[`docs/components/index.md`](/components/). If you change a schema default,
update the docs page in the same commit or CI fails.

## CI

The GitHub Actions pipeline (Node 20) runs:

1. lint → jest → build → build checks → tarball/consumer install → `npm audit`
2. a six-job Chromium browser matrix — A-Frame **1.7.0, 1.7.1, 1.8.0** ×
   development/production bundle

Screenshots and resource counts are uploaded as artifacts. The browser runner
requires Playwright and its Chromium installation; its existence does not
establish a passing result — see
[AUDIT.md](https://github.com/bookklik-technologies/senangstart-xr/blob/main/AUDIT.md)
for the current release gates.

## Documentation site

This site is built with VitePress:

```bash
npm run docs:dev      # local dev server with hot reload
npm run docs:build    # static build to docs/.vitepress/dist
npm run docs:preview  # preview the built site
```

The build output is deployed to GitHub Pages by
`.github/workflows/docs.yml`.

## Release status

See [AUDIT.md](https://github.com/bookklik-technologies/senangstart-xr/blob/main/AUDIT.md)
for the current release gates and known limitations. Publishing and deployment
are manual.

## License

[MIT](https://github.com/bookklik-technologies/senangstart-xr/blob/main/LICENSE)
© Bookklik Technologies
