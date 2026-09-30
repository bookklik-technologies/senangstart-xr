# SXR Namespace

Loading the bundle creates a global `window.SXR` namespace with the design
tokens, font registry, icon helpers, canvas text/icon renderers and keyboard
utilities that the widgets are built on. Most scenes never need it directly, but
it is the supported extension surface for custom components.

::: warning Internal fields
Entities created by `createTextEntity` and `createIconEntity` expose underscore
fields (`_sxrTextState`, `_sxrIconState`, `_sxrDisposed`, …). These are
implementation details, not a stable API — read them only when the documented
functions below are insufficient.
:::

## Colors

### `SXR.colors`

The brand palette, also listed in [Colors](/api/colors).

```js
SXR.colors.primary   // '#2563EB'
SXR.colors.surface   // '#202127'
```

### `SXR.getValidColor(color, fallback?)`

Normalizes a color value, substituting `SXR.colors.onSurface` (or `fallback`)
for empty strings, `'undefined'` and `'null'`.

```js
SXR.getValidColor('')          // '#F1F5F9'
SXR.getValidColor(undefined)   // '#F1F5F9'
```

## Fonts

See the full [Fonts API](/api/fonts).

| Function | Purpose |
| --- | --- |
| `SXR.registerFontFile(fontFile)` | Register a font file through the FontFace API; returns a Promise for the family name |
| `SXR.onFontResolved(fontFile, callback)` | Queue a callback for when a font settles; returns `true` if queued |
| `SXR.getCanvasFontFamily(fontFamily)` | Resolve a font argument to a canvas-usable family |
| `SXR.normalizeFontSize(fontSize, fallback?)` | Parse a font size, falling back when invalid |
| `SXR.getTextWidth(text, font)` | Measure text width on a shared canvas context |
| `SXR.fonts` | The font registry (`default`, `registered`, `pending`, `redrawQueue`) |
| `SXR.bundleBaseUrl` | Base URL of the running bundle, used to resolve the default font |

## Icons

See the full [Icons API](/api/icons).

| Function | Purpose |
| --- | --- |
| `SXR.icons` | Slug → inline SVG string map (246 icons) |
| `SXR.getIconSvg(icon, color?, thickness?)` | SVG string with `currentColor` replaced and optional stroke width |
| `SXR.getIconDataUrl(icon, color?, thickness?)` | `data:image/svg+xml` URL usable as an image source |
| `SXR.createIconEntity(options)` | Build an A-Frame entity rendering an icon |
| `SXR.redrawIconEntity(entity, options)` | Redraw an icon entity in place |

## Text rendering

| Function | Purpose |
| --- | --- |
| `SXR.createTextEntity(options)` | Build an A-Frame entity rendering wrapped canvas text |
| `SXR.redrawTextEntity(entity, options)` | Redraw a text entity in place, reusing canvas, texture and geometry |
| `SXR.createTextState(options)` | Create the persistent canvas + 2D context state |
| `SXR.drawTextToState(state, options)` | Run the fitting/layout algorithm and paint into a state |
| `SXR.computeTextCanvasSize(width, height, pixelRatio)` | Power-of-two canvas dimensions, clamped |

### `SXR.createTextEntity(options)`

Returns a new `a-entity` with a canvas-textured plane. Recognized options:

| Option | Default | Purpose |
| --- | --- | --- |
| `value` | `''` | The text to render |
| `width` | `1` | World width of the plane |
| `height` | `0.25` | World height of the plane |
| `color` | `SXR.colors.onSurface` | Fill color |
| `fontSize` | `min(0.2, height * 0.7)` | Requested font size in world units |
| `fontFamily` | system stack | Family name or font filename |
| `fontWeight` | `'600'` | CSS font weight |
| `lineHeight` | `fontSize * 1.25` | Line height in world units |
| `align` | `'center'` | `left`, `center` or `right` |
| `strokeColor` | `'transparent'` | Canvas stroke color |
| `strokeWidth` | `0` | Canvas stroke width |
| `pixelRatio` | `128` | Canvas resolution multiplier |
| `depthTest` | `false` | Let scene geometry occlude the text |

If `fontFamily` names a font file that is still loading, the entity registers
a redraw through `SXR.onFontResolved` so it repaints with the real typeface
once it arrives.

```js
const el = SXR.createTextEntity({
  value: 'Hello XR',
  width: 1.5,
  height: 0.3,
  color: SXR.colors.onSurface
})
sceneEl.appendChild(el)
```

### Fitting algorithm

`drawTextToState` wraps text on word boundaries, and when the result overflows
the box it **binary-searches a smaller font size** (floor 12px) until the text
fits both the width and the height. This is why long labels shrink instead of
clipping.

### `SXR.redrawTextEntity(entity, options)`

Repaints an existing text entity in place, reusing its canvas, texture and
geometry. Returns `true` when the redraw happened, or `false` when the box size
changed — in that case the caller should recreate the entity.

### `SXR.createIconEntity(options)`

Returns a new `a-entity` with a canvas-textured plane rendering an icon. The
SVG is drawn through an async `Image`, so pass `onLoad` to be notified when the
pixels are ready.

| Option | Default | Purpose |
| --- | --- | --- |
| `icon` | `''` | Icon slug |
| `width` | `options.size` or `0.25` | World width |
| `height` | `options.size` or `width` | World height (square by default) |
| `size` | `0.25` | Shorthand for width + height |
| `color` | `SXR.colors.onSurface` | Icon color |
| `thickness` | `null` | Override the SVG `stroke-width` |
| `scale` | `0.78` | Fraction of the canvas the icon occupies |
| `pixelRatio` | `768` | Canvas resolution multiplier |
| `depthTest` | `false` | Let scene geometry occlude the icon |
| `onLoad` | `null` | Callback invoked with the entity once drawn |

An unknown slug draws a `?` fallback glyph rather than failing.

```js
const icon = SXR.createIconEntity({
  icon: 'cog-6-tooth',
  size: 0.4,
  color: SXR.colors.secondary,
  onLoad: (el) => container.appendChild(el)
})
```

`SXR.redrawIconEntity(entity, options)` reschedules the draw in place, accepting
`icon`, `color`, `thickness`, `scale` and `depthTest`. It returns `false` when
the box size changed and the entity should be recreated.

## Items and layout

### `SXR.getItem(el)`

Reads the `sxr-item` data for a widget element. When the widget is placed on an
ordinary entity — or a primitive whose `sxr-item` has not parsed yet — it
returns the documented defaults instead, so widget init stays safe everywhere.

```js
const item = SXR.getItem(el)
item.width   // 1
item.margin  // {x: 0, y: 0, z: 0, w: 0}
```

### `SXR.watchGuiItem(el, callback)`

Subscribes to `componentchanged` events for `sxr-item` on `el` and calls back
with the new data whenever dimensions change. Returns the handler so the owning
component can detach it in `remove()`.

```js
init() {
  this._watch = SXR.watchGuiItem(this.el, (item) => this.rebuild(item))
},
remove() {
  this.el.removeEventListener('componentchanged', this._watch)
}
```

## Actions and callbacks

### `SXR.getActionFunction(name)`

Resolves a callback declared as a global function name (for example
`onclick="myFunction"`) against `window` **at event time**. Returns the
function, or `null` when the name is empty, unknown, or not callable.

```js
SXR.getActionFunction('myFunction')  // the function, or null
```

Because resolution happens on each event, you can redefine a global handler at
runtime and the widget picks it up immediately.

## Keyboard helpers

`SXR.keyboard` holds the predicates the widgets share. They are what make
shortcuts safe while the user is typing.

| Function | Purpose |
| --- | --- |
| `SXR.keyboard.isEditableTarget(target)` | True for `input`, `textarea`, `select` and contenteditable |
| `SXR.keyboard.isActivationPress(event)` | True for a non-repeated, non-composing `Enter` / `Space` |
| `SXR.keyboard.isActivationKey(key)` | True for `'Enter'`, `' '`, `'Spacebar'` |
| `SXR.keyboard.isArrowKey(key)` | True for the four arrow keys |

```js
SXR.keyboard.isEditableTarget(document.activeElement)  // gate your own shortcuts
```

## Identity and disposal

### `SXR.getUniqueId(prefix)`

Returns a collision-resistant id of the form `prefix_<counter>_<random>`.

### `SXR.removeEntity(entity)`

Removes an entity **and disposes its GPU resources** — text/icon textures,
materials and geometries — recursing into children. It sets a `_sxrDisposed`
flag first so pending async callbacks (icon image loads, font redraws) ignore
the entity instead of touching disposed resources.

Use it instead of `el.parentNode.removeChild(el)` for widgets, otherwise canvas
textures leak.

## Full reference summary

| Member | Kind | Summary |
| --- | --- | --- |
| `colors` | object | Brand palette |
| `fonts` | object | Font registry and redraw queue |
| `icons` | object | Slug → SVG map |
| `bundleBaseUrl` | string | Base URL of the running bundle |
| `getValidColor` | function | Normalize a color with a fallback |
| `registerFontFile` | function | Load and register a font file |
| `onFontResolved` | function | Queue a font-settled callback |
| `getCanvasFontFamily` | function | Resolve a font argument for canvas |
| `normalizeFontSize` | function | Parse a font size with a fallback |
| `getTextWidth` | function | Measure text on a shared canvas |
| `getIconSvg` | function | Colored SVG string |
| `getIconDataUrl` | function | Colored SVG data URL |
| `getUniqueId` | function | Collision-resistant id |
| `getItem` | function | Read `sxr-item` data with defaults |
| `watchGuiItem` | function | Observe `sxr-item` changes |
| `getActionFunction` | function | Resolve a global callback name |
| `removeEntity` | function | Remove an entity and dispose GPU resources |
| `keyboard` | object | Typing-safety predicates |
| `computeTextCanvasSize` | function | Power-of-two canvas dimensions |
| `createTextState` | function | Build the canvas + context state |
| `drawTextToState` | function | Fit and paint text into a state |
| `createTextEntity` | function | Build a text entity |
| `redrawTextEntity` | function | Repaint a text entity in place |
| `createIconEntity` | function | Build an icon entity |
| `redrawIconEntity` | function | Repaint an icon entity in place |
