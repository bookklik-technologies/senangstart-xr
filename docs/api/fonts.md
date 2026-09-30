# Fonts

Widget text is rendered to a **canvas 2D texture**, so the font must be usable
by the canvas context. SenangStart XR handles this through the FontFace API and
redraws text automatically once a font finishes loading.

## Default font

The default family is `Outfit-Regular.ttf`, exposed as `SXR.fonts.default`. It
ships inside the npm tarball and is resolved **relative to the bundle script
URL** (`SXR.bundleBaseUrl`), not the page — so it works from a CDN or
`node_modules` without copying anything.

```js
SXR.fonts.default  // 'Outfit-Regular.ttf'
```

## The font registry

`SXR.fonts` tracks loading state:

| Field | Purpose |
| --- | --- |
| `default` | The default font filename |
| `registered` | filename → family name (loaded), `false` (failed) or absent |
| `pending` | filename → shared in-flight load Promise |
| `redrawQueue` | filename → callbacks to run once the load settles |

## Registering a font

### `SXR.registerFontFile(fontFile)`

Registers a `*.ttf` / `*.otf` / `*.woff` / `*.woff2` file through the FontFace
API. Returns a Promise resolving to the family name, or `null` when the
argument is not a font filename, FontFace is unavailable, or the load fails.

```js
SXR.registerFontFile('Inter-Regular.woff2')
  .then((family) => console.log('ready:', family))
```

- **Concurrent calls share one load** — the same promise is returned to every caller.
- The family name is derived from the filename (`Inter-Regular.woff2` → `Inter-Regular`).
- Non-font arguments resolve to `null` without touching the network.

### `SXR.onFontResolved(fontFile, callback)`

Queues a callback for when a font loads (or fails). Returns `true` if the
callback was queued, `false` if the font already settled or the argument is
invalid — so you can tell whether the callback will ever run.

```js
if (SXR.onFontResolved('Inter-Regular.woff2', redrawMyLabels)) {
  // queued; redrawMyLabels will run when the font resolves
}
```

### `SXR.getCanvasFontFamily(fontFamily)`

Resolves a font argument to something the canvas can use:

- a **filename** → the registered family, or the system stack while it loads (and it kicks off the registration)
- a **family name** (e.g. `'Arial'`) → returned unchanged
- empty / `'undefined'` / `'null'` → `'Arial, Helvetica, sans-serif'`

### `SXR.normalizeFontSize(fontSize, fallback)`

Parses a font size, returning `fallback` (default `0.2`) when the value is not
a positive finite number.

## Custom fonts

Two approaches:

1. **Filename** — the library loads and registers it. Custom font files resolve
   relative to the **page URL**.

   ```html
   <a-sxr-label value="Custom" font-family="Inter-Regular.woff2"></a-sxr-label>
   ```

2. **Family name** — if the font is already available to canvas (e.g. a system
   font, or one added by your own `@font-face`):

   ```html
   <a-sxr-label value="Custom" font-family="Arial"></a-sxr-label>
   ```

## Rendering while loading

While a font loads — or when FontFace is unavailable — text renders with the
system stack (`Arial, Helvetica, sans-serif`). Once the font resolves, every
entity registered through `SXR.onFontResolved` **redraws in place** with the real
typeface. Widgets set this up for you, so a page can start with fallback text and
upgrade automatically.

## Build outputs

`Outfit-Regular.ttf` is copied beside each bundle in `dist/` and `examples/js/`;
the source font remains at the repository root. The
[BundledFont](https://github.com/bookklik-technologies/senangstart-xr/blob/main/webpack.config.js)
webpack plugin emits it as an asset.

## Sizing

`font-size` and `line-height` are in **A-Frame world units**. The renderer wraps
text and binary-searches a smaller size when the text would overflow the widget
box, so labels stay inside their bounds. Measure text with:

```js
SXR.getTextWidth('Hello', '600 20px Outfit-Regular')
```
