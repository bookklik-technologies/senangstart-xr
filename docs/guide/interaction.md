# Interaction

<DemoWidget title="Interactive controls: click, keyboard and fuse" src="/demo/controls.html" height="400" />

## Callbacks vs. events

Callbacks (`onclick`, `onhover`, `callback`) are the **names of global
functions** resolved on `window` at event time. Define them before the scene
loads — a typo silently no-ops.

```html
<a-sxr-button value="Press me" onclick="handleClick"></a-sxr-button>

<script>
  function handleClick(event) {
    console.log('clicked', event)
  }
</script>
```

Modern integrations can skip globals entirely and listen to the widget's own
events:

```js
document.querySelector('a-sxr-button')
  .addEventListener('click', (event) => console.log('clicked', event))
```

| Event | Detail | Emitted by |
| --- | --- | --- |
| `click` | The originating DOM/A-Frame event | All interactive widgets |
| `input` | `{ value }` while the value changes | `a-sxr-input` (native editing) |
| `change` | `{ value }` on commit | `a-sxr-input` (native editing) |
| `hovergui` / `leavegui` | Cursor enter/leave | `a-sxr-cursor` |

### Callback signatures

| Widget | Signature |
| --- | --- |
| [Slider](/components/slider) | `(event, percent)` |
| [Vertical Slider](/components/vertical-slider) | `(percent)` — for both pointer and keyboard activation |
| [Circle Timer](/components/circle-timer) | `()` when the countdown expires |

### Activation event names

The `on` property names the event that triggers the onclick action. It can be
changed after initialization and the listener rebinds to the new name.

## Keyboard shortcuts

Every interactive widget accepts a shortcut:

| Property | Purpose |
| --- | --- |
| `key` | Textual shortcut key that activates the widget (e.g. `e`) |
| `key-code` | Legacy numeric shortcut key (e.g. `32` for Space) |

- Keyboard activation is registered **per widget**; binding the same key to
  multiple widgets fires all of them.
- Shortcuts are ignored while the user is typing into a text field, during IME
  composition, and for auto-repeated keydowns.
- `key="e"` works independently of the legacy numeric `key-code="32"`. When a
  widget's own shortcut key matches the focused key press, only the shortcut
  fires (no duplicate activation).

## Keyboard operation (desktop)

When a widget holds DOM focus (click it, or Tab to it):

| Widget | Keys |
| --- | --- |
| Button | `Enter` / `Space` activate |
| Toggle | `Enter` / `Space` flip the state (disabled widgets ignore) |
| Radio | `Space` selects; arrow keys move through the group |
| Slider | `←`/`→` (and `↑`/`↓`) step by `keyboard-step`; `Home`/`End` jump to 0/1 |
| Vertical slider | `↑`/`↓` (and `←`/`→`) step by `keyboard-step`; `Home`/`End` jump to 0/1 |
| Input | `Enter` / `Space` activate; native editing requires `native-editing="true"` |

## Cursor

`a-sxr-cursor` provides the pointer used to interact with GUI elements. It has
four designs — `dot`, `ring`, `cross` and `reticle`.

```html
<a-entity id="cameraRig" position="0 1.6 0">
  <a-camera look-controls wasd-controls position="0 0 0">
    <a-sxr-cursor id="cursor"
                  fuse="true" fuse-timeout="2000"
                  color="#ECEFF1"
                  hover-color="#CFD8DC"
                  active-color="#607D8B"
                  design="ring">
    </a-sxr-cursor>
  </a-camera>
</a-entity>
```

The primitive includes a **pre-scoped raycaster** by default
(`objects: [sxr-interactable]`, `interval: 100`), so cursor raycasts only test
interactive widgets instead of the whole scene. Override it with a
`raycaster="..."` attribute if you need different targets.

```html
<a-sxr-cursor
  raycaster="objects: [sxr-interactable]"
  fuse="false">
</a-sxr-cursor>
```

## VR controllers

Widgets work with A-Frame's controller-based raycasters out of the box —
controller `click` events carry the ray intersection, so sliders and inputs
respond to the exact hit point:

```html
<a-entity id="leftHand" laser-controls="hand: left"
          raycaster="objects: [sxr-interactable]"></a-entity>
<a-entity id="rightHand" laser-controls="hand: right"
          raycaster="objects: [sxr-interactable]"></a-entity>
```

Use A-Frame's [`raycaster-origin`](https://aframe.io/docs/core/components/raycaster.html)
component on the controller entity to move the ray origin (e.g. to the tip of
a controller model).

::: tip Why `[sxr-interactable]`?
Every interactive widget carries the `sxr-interactable` component. Scoping
raycasters to that selector is what keeps VR pointer performance independent of
scene complexity.
:::
