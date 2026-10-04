# Installation

SenangStart XR is a GUI framework built on top of [A-Frame](https://aframe.io). It ships as a single browser bundle that registers 18 `sxr-*` components and their matching `a-sxr-*` HTML primitives on the global `AFRAME` object.

<DemoWidget title="Controls in a live scene" src="/demo/controls.html" height="420" />

Supported A-Frame versions are **1.7.x and 1.8.x** (peer dependency `>=1.7.0 <1.9.0`). See [A-Frame Versions](/guide/aframe-versions).

## Local build

Include A-Frame, then the SenangStart XR bundle, in the `<head>` of your page:

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<!-- local build -->
<script src="dist/senangstart-xr.js"></script>
```

Then use the `a-sxr-*` primitives inside your `<a-scene>` (see the [Components](/components/) section):

```html
<a-scene>
  <a-sxr-flex-container
    flex-direction="column" justify-content="center" align-items="center"
    width="4" height="3" opacity="0"
    position="0 1.6 -2">
    <a-sxr-button width="2" height="0.6" value="Hello XR"
      onclick="handleClick"></a-sxr-button>
  </a-sxr-flex-container>
</a-scene>
```

## Install via npm

```bash
npm install @bookklik/senangstart-xr
```

A-Frame is a peer dependency (supported range: `>=1.7.0 <1.9.0`) and must be loaded on the page first. The package ships the built bundles and the bundled font in `dist/` / package root; reference `dist/senangstart-xr.min.js` via a `<script>` tag (the bundle registers its components against the global `AFRAME` object and is not `require()`-able):

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="node_modules/@bookklik/senangstart-xr/dist/senangstart-xr.min.js"></script>
```

## CDN usage

```html
<script src="https://unpkg.com/@bookklik/senangstart-xr@2.1.0/dist/senangstart-xr.min.js"></script>
```

::: warning Pin CDN versions
unpkg/jsdelivr redirects of unversioned URLs can serve a different release than the one you tested against.
:::

## Run the showcase example

A ready-to-run demo scene is included at [`examples/index.html`](https://github.com/bookklik-technologies/senangstart-xr/blob/main/examples/index.html). Start the bundled dev server:

```bash
npm start
```

Then open `http://localhost:8080` in a browser to see the widgets in action.

## Next steps

- [Layout with Flex Container](/guide/layout) — arrange widgets in 3D panels
- [Interaction](/guide/interaction) — callbacks, events, keyboard and VR lasers
- [Styling & Fonts](/guide/styling) — brand tokens and custom typefaces
- [SXR Namespace API](/api/sxr-namespace) — programmatic helpers
