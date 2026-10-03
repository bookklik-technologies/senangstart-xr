# Button

A standard button with a text label. Supports hover/active color animations,
an optional toggle mode, focus color, rounded corners, optional bevel, and keyboard activation
via `Enter` / `Space`.

<DemoWidget title="Buttons in a live scene" src="/senangstart-xr/demo/controls.html" height="400" />

### a-sxr-button Component
#### Properties

| Property           | Description                                               | Default Value |
| --------           | -------------------------------------------------------   | ------------- |
| on                 | Event that triggers onclick action                        | click         |
| value              | Text of button label                                      |               |
| font-size          | Font size for button                                      | 0.2           |
| font-family        | Font family for button                                    | Outfit-Regular.ttf |
| font-color         | Text color for button label                               | #F1F5F9       |
| border-color       | Border color of button                                    | #1B1B1F       |
| focus-color        | Focus color of button                                     | #0EA5E9       |
| background-color   | Background color of button                                | #202127       |
| hover-color        | Background color when button is in hover state            | #0EA5E9       |
| active-color       | Background color when button is pressed down              | #2563EB       |
| toggle             | If true, button acts as toggle button with on/off state   | false         |
| toggle-state       | Setting the toggle button on/off state                    | false         |
| key                | Textual shortcut key that activates the widget (e.g. 'e') |               |
| key-code           | Legacy numeric shortcut key (e.g. 32 for Space)           | -1            |

| width              | Width of button                                           | 1             |
| height             | Height of button                                          | 1             |
| depth              | Depth of button                                           | 0.02          |
| base-depth         | Depth of the base of the button                           | 0.01          |
| gap                | Gap between button and base                               | 0.025         |
| margin             | Margin around button                                      | 0 0 0 0       |
| radius             | Corner radius shared by all four button corners           | 0             |

| bevel              | If true, button bevel is enabled                          | false         |
| bevel-segments     | Segments of the button bevel                              | 5             |
| steps              | Steps of the button bevel                                 | 2             |
| bevel-size         | Size of the button bevel                                  | 0.1           |
| bevel-offset       | Offset of the button bevel                                | 0             |
| bevel-thickness    | Thickness of the button bevel                             | 0.1           |

```html
<a-sxr-button
	width="2.5"
	height="0.7"
	base-depth="0.025"
	depth="0.1"
	gap="0.1"

	onclick="buttonActionFunction" key-code="32"
	value="Sample Button"
	font-family="Outfit-Regular.woff2"
	font-size="0.25"
	margin="0 0 0.05 0"

	font-color="black"
	active-color="red"
	hover-color="yellow"
	border-color="white"
	focus-color="black"
	background-color="orange"

	bevel="true"
>
</a-sxr-button>
```

## Rounded corners

Set `radius` to a positive value in scene units to round all four corners of
the base and button face. The default, `0`, keeps the square appearance.
Rounded corners work with or without `bevel="true"`.

```html
<a-sxr-button value="Continue" width="2" height="0.6" radius="0.12"></a-sxr-button>
```

The radius is clamped to half the smaller dimension; a larger value produces
a pill-shaped button. The face radius is reduced by `gap / 2` to keep the
border consistent. Negative or non-finite radii behave as `0`.

You can change `radius`, `width`, or `height` after initialization and the
geometry updates automatically:

```js
button.setAttribute('radius', '0.2')
```

## Interaction

- Click, or focus and press `Enter` / `Space`, to activate.
- The `on` property names the event that triggers the onclick action and can be
  rebound after initialization.
- `key` / `key-code` register a global shortcut — see
  [Interaction](/guide/interaction#keyboard-shortcuts).
- Callbacks are global function names; alternatively listen for the widget's
  own `click` event.

## Toggle mode

Set `toggle="true"` to make the button latch on and off. The current state is
held in `toggle-state`:

```html
<a-sxr-button toggle="true" toggle-state="false" value="Sound"></a-sxr-button>
```

```js
button.setAttribute('toggle-state', 'true')
```
