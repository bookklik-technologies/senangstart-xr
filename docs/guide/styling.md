# Styling & Fonts

## Brand colors

SenangStart XR ships a slate/blue design system. These tokens are the defaults
used by every widget and are also available programmatically via
[`SXR.colors`](/api/colors).

| Token | Value | Legacy alias |
| ----- | ----- | ------------ |
| primary | `#2563EB` | key_orange |
| primaryGradient | `linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)` | |
| secondary | `#0EA5E9` | key_orange_light |
| darkBase | `#1B1B1F` | |
| darkDeeper | `#161618` | |
| darkCard | `#202127` | |
| accent | `#2563EB` | |
| slate100 | `#F1F5F9` | |
| success | `#10B981` | |
| warning | `#F59E0B` | |
| background | `#161618` | key_grey_dark |
| surface | `#202127` | key_grey |
| onSurface | `#F1F5F9` | key_offwhite, key_white |
| border | `#1B1B1F` | |
| error | `#EF4444` | |
| neutral | `#1B1B1F` | key_grey_light |

::: tip Legacy aliases
The `key_*` aliases are kept for backwards compatibility with older scenes.
New work should use the semantic token names.
:::

## Theming with the flex container

The fastest way to restyle a panel is to set style properties on its
[`a-sxr-flex-container`](/guide/layout) — children inherit them:

```html
<a-sxr-flex-container
  font-family="Outfit-Regular.ttf"
  font-color="#F1F5F9"
  border-color="#1B1B1F"
  background-color="#202127"
  hover-color="#0EA5E9"
  active-color="#2563EB"
  handle-color="#F1F5F9"
  opacity="1" width="4" height="3">
  <!-- inherits the palette above -->
</a-sxr-flex-container>
```

Individual widgets override inherited values by declaring their own.

## Text font

The default font family is `Outfit-Regular.ttf` (`SXR.fonts.default`), which is
**packaged with the npm tarball** and resolved relative to the bundle script
URL.

When a font **filename** (`*.ttf` / `*.otf` / `*.woff` / `*.woff2`) is passed,
the canvas renderer registers it through the FontFace API. Concurrent loads of
the same file are shared, and any text already rendered while the font was
loading is redrawn automatically once the font resolves.

While the font loads — or when FontFace is unavailable — text renders with the
system font stack (`Arial, Helvetica, sans-serif`).

### Using a custom font

Two options:

1. **Pass a font filename** — the library registers it for you. Custom font
   files resolve relative to the page URL.
2. **Pass a font-family name** that is already available to the canvas 2D
   context (e.g. `font-family="Arial"`).

```html
<a-sxr-label value="Custom type" font-family="Arial"></a-sxr-label>
```

Builds copy `Outfit-Regular.ttf` beside each bundle in `dist/` and
`examples/js/`; the source font remains at the repository root. See the
[Fonts API](/api/fonts) for the programmatic API.

## Font sizing

`font-size` is expressed in **A-Frame world units**, not pixels. The text
renderer auto-fits the widget box: it wraps text, then binary-searches a
smaller font size if the text still overflows, so labels stay legible and
inside their bounds.

## Occlusion

By default widget text and icons always draw on top of scene geometry (legacy
rendering). Applications that want scene geometry to occlude labels can opt in
per widget — see [Occlusion](/advanced/occlusion).
