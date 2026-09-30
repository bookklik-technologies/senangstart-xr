# A-Frame Version Support

Supported A-Frame versions are **1.7.x and 1.8.x** (peer dependency `>=1.7.0 <1.9.0`).

The library is validated against the pinned releases
[1.7.0](https://aframe.io/releases/1.7.0/aframe.min.js),
[1.7.1](https://aframe.io/releases/1.7.1/aframe.min.js) and
[1.8.0](https://aframe.io/blog/aframe-v1.8.0/).

Earlier A-Frame versions (including 1.4.x, shown in some legacy snippets) are
**no longer tested** against this library.

## Compatibility matrix

| A-Frame | Status | Notes |
| --- | --- | --- |
| 1.8.0 | Supported | Latest validated release |
| 1.7.1 | Supported | Validated patch release |
| 1.7.0 | Supported | Minimum supported version |
| 1.6.x and below | Unsupported | Outside the peer dependency range |
| 1.9.0+ | Unsupported | Outside the peer dependency range |

## Why the version matters

SenangStart XR uses `AFRAME.THREE` from the embedded three.js instance that
A-Frame ships. Widgets build their geometry through that shared renderer, so
the library is only verified against the A-Frame releases listed above.

## Continuous integration checks

CI runs Chromium integration checks against A-Frame **1.7.0, 1.7.1 and 1.8.0**,
with each bundle variant (development and production). Screenshots and resource
counts are uploaded as artifacts.

The browser runner requires Playwright and its Chromium installation. Its
existence does not establish a passing result — see
[AUDIT.md](https://github.com/bookklik-technologies/senangstart-xr/blob/main/AUDIT.md)
for the current release gates.

## Loading order

A-Frame must be loaded **before** SenangStart XR. The bundle registers its
components against the global `AFRAME` object at parse time and throws if
`AFRAME` is not defined.

```html
<!-- A-Frame first -->
<script src="https://aframe.io/releases/1.8.0/aframe.min.js"></script>
<!-- SenangStart XR second -->
<script src="node_modules/@bookklik/senangstart-xr/dist/senangstart-xr.min.js"></script>
```
