# Live Attribute Updates

Widget attributes can be changed **after initialization** — via `setAttribute`
or the mapped primitive attributes. The following update live, without recreating
the widget.

## What updates live

| Category | Properties | Behavior |
| --- | --- | --- |
| Dimensions | `width`, `height`, `depth`, `base-depth`, `gap`, `radius`, `margin` | Geometry, bars, borders and label boxes rebuild to fit |
| Colors | `font-color`, `border-color`, `background-color`, `hover-color`, `active-color`, `handle-color`, `focus-color` | Resting and label colors refresh; running animations continue with the new values |
| Labels | `value` on buttons, toggles, radios, labels, inputs | Text redraws in place; `aria-label` stays in sync |
| Activation events | `on` | The activation listener rebinds to the new event name |
| States | `checked`, `percent`, `loaded`, `count-down`, `hover-percent` | Visuals and `aria-checked` / `aria-valuenow` follow |
| Layout | Flex container properties on `a-sxr-flex-container` | Children relayout, including after programmatic child insertion and removal |
| Icons | `icon`, `icon-active` | Icon redraws in place |

## Basic usage

```js
const button = document.querySelector('a-sxr-button')

button.setAttribute('value', 'Now playing')   // label redraws
button.setAttribute('font-color', '#10B981')  // color refreshes
button.setAttribute('width', '3')             // geometry rebuilds
```

## How it works

Components subscribe to A-Frame's `componentchanged` event. The
[`SXR.watchGuiItem`](/api/sxr-namespace#sxrwatchguitel-callback) helper filters
that stream for `sxr-item` changes and hands the new data to the owning
component, which rebuilds only what is affected:

```js
init() {
  this._watch = SXR.watchGuiItem(this.el, (item) => this.rebuild(item))
},
remove() {
  this.el.removeEventListener('componentchanged', this._watch)
}
```

Text and icon updates are cheaper still: `SXR.redrawTextEntity` and
`SXR.redrawIconEntity` reuse the existing canvas, texture and geometry, so
repainting a label does not allocate new GPU resources.

## Programmatic child changes

A flex container watches its children with a `MutationObserver` and a debounce,
so adding or removing widgets relayouts the panel:

```js
const panel = document.querySelector('a-sxr-flex-container')
const row = document.createElement('a-sxr-button')
row.setAttribute('value', 'New')
panel.appendChild(row)     // panel relayouts
row.remove()               // panel relayouts
```

## Callback signatures on update

Horizontal-slider callbacks receive `(event, percent)`. Vertical-slider
callbacks receive `(percent)` for **both** pointer and keyboard activation.

## Disposal

When removing widgets, use [`SXR.removeEntity`](/api/sxr-namespace#removeentity)
rather than `parentNode.removeChild(el)` so canvas textures, materials and
geometries are disposed instead of leaking:

```js
SXR.removeEntity(widget)
```
