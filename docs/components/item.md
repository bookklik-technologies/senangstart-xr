# Item & Interactable

Two support components carry the properties that most widgets share. Neither
registers a primitive — they are attached to the entities that use them, and
the widget primitives map their `width`, `height`, `margin`, `key`, etc.
attributes onto them.

| Component | Primitive | Description |
| --- | --- | --- |
| sxr-item | `<none>` | Used by other components for common properties like height and width |
| sxr-interactable | `<none>` | Used by other components to define onclick behavior |

## sxr-item Component

Shared dimensions, depth, margin and bevel.

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
| type | Widget type identifier | '' |
| width | Width of item | 1 |
| height | Height of item | 1 |
| baseDepth | Depth of the item base | 0.01 |
| depth | Depth of item | 0.02 |
| gap | Gap between item and base | 0.025 |
| radius | Corner radius of the item base | 0 |
| margin | Margin around item | 0 0 0 0 |
| bevel | If true, the item bevel is enabled | false |
| bevelSegments | Segments of the item bevel | 5 |
| steps | Steps of the item bevel | 2 |
| bevelSize | Size of the item bevel | 0.1 |
| bevelOffset | Offset of the item bevel | 0 |
| bevelThickness | Thickness of the item bevel | 0.1 |

`margin` is a `vec4` and follows the CSS shorthand order
(top, right, bottom, left).

Read the current values at runtime with the [`SXR.getItem`](/api/sxr-namespace#getitem)
helper, which falls back to these documented defaults when the widget is
placed on an ordinary entity.

## sxr-interactable Component

Click/hover callbacks and keyboard shortcut registration.

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
| clickAction | Name of a global function called on click | |
| hoverAction | Name of a global function called on hover | |
| key | Textual shortcut key that activates the widget (e.g. `e`) | |
| keyCode | Legacy numeric shortcut key (e.g. 32 for Space) | -1 |

### Keyboard registry

A **single** window-level `keydown` listener dispatches to all registered
`sxr-interactable` instances, rather than one global capture listener per
widget. The listener is attached on the first registration and removed when the
last one unregisters.

- Multiple widgets bound to the same key all fire — bind distinct keys per widget.
- Shortcuts are ignored while the user is typing into an editable surface, during IME composition, and for auto-repeated keydowns.
- `key` works independently of the legacy numeric `keyCode`.
- When a widget's own shortcut key matches the focused key press, the widget skips its own focused `Enter`/`Space` handling, preventing duplicate activation.

Shortcut activation emits a `click` event with a `source: 'keyboard'` detail,
along with the `key` and `keyCode`:

```js
document.querySelector('a-sxr-button').addEventListener('click', (e) => {
  console.log(e.detail.source) // 'keyboard'
  console.log(e.detail.key)     // 'e'
})
```

### Instance methods

| Method | Purpose |
| --- | --- |
| `matchesEvent(event)` | True when this instance's `key` / `keyCode` matches the event |
| `setClickAction(action)` | Rebind the click callback name |
