# Accessibility

## What the library provides

- **ARIA roles** are declared on interactive widgets, and widgets are
  keyboard-reachable (`tabindex="0"` on button, toggle, radio, sliders, input).
- **Keyboard operation** — see the full key table in
  [Interaction](/guide/interaction#keyboard-operation-desktop).
- **Accessible names** stay in sync: changing a widget's `value` updates its
  `aria-label` along with the rendered text.
- **Typing safety** — global shortcuts never fire while the user is typing in a
  text field, during IME composition, or on auto-repeated keydowns.
- **State reflection** — `aria-checked` and `aria-valuenow` follow the visual
  state of toggles, radios and sliders.

## Native text editing (opt-in)

By default an [`a-sxr-input`](/components/input) is a canvas-rendered field
updated programmatically. Adding `native-editing="true"` makes activation focus
a visually hidden, labelled native `<input>` kept in sync with the widget:

- typing, arrow-key caret/selection movement, paste and IME composition all work
  with the real keyboard
- `input` events fire as the text changes
- `change` fires on commit (`Enter` or losing focus), once per changed value

```html
<a-sxr-input width="2.8" height="0.5"
             native-editing="true"
             value="Type here"></a-sxr-input>
```

## Known limitations

::: warning Screen readers
Widget ARIA roles and labels live on 3D entities in the WebGL scene; **screen
readers do not announce them**. Keyboard operation is provided for sighted
keyboard users. For a screen-reader-accessible experience, provide a parallel
DOM interface alongside the scene.
:::

- **Immersive (VR) text entry is application-provided.** The release does not
  bundle a Quest virtual keyboard. On desktop, enable opt-in native editing to
  type with a real keyboard.
- **Focus indicators are visual only** (widget border/focus colors); there is
  no roving-tabindex container for flex layouts, so Tab order follows DOM
  order rather than visual layout order.
- **Focus is not persisted across DOM focus loss** in a way assistive tech can
  observe — focus state is expressed visually.
