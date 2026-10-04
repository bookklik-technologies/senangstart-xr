# Toggle

A switch with an animated track and handle. Exposes `role="switch"` and a
`checked` state; a disabled widget ignores activation.

### a-sxr-toggle Component
#### Properties

| Property         | Description                                               | Default Value  |
| --------         | -------------------------------------------------------   | -------------- |
| on               | Event that triggers onclick action                        | click          |
| key              | Textual shortcut key that activates the widget (e.g. 'e') |                |
| key-code         | Legacy numeric shortcut key (e.g. 32 for Space)           | -1             |
| checked          | Whether the toggle is on                                  | false          |
| active           | Whether the toggle is enabled                             | true           |
| toggle           | Toggle status                                             | false          |
| toggle-state     | Setting the toggle toggle button on/off state             | false          |
| value            | Text of the toggle button label                           | ''             |
| font-family      | Font family for toggle button                             | Outfit-Regular.ttf |
| font-size        | Font size for toggle button                               | 0.2            |
| font-color       | Text color for toggle button label                        | #161618        |
| border-width     |                                                           | 1              |
| border-color     | Border color of toggle button                             | #1B1B1F        |
| background-color | Background color of toggle button                         | #F1F5F9        |
| hover-color      | Background color when toggle button is in hover state     | #0EA5E9        |
| handle-color     | Color of the toggle handle                                | #F1F5F9        |
| active-color     | Background color when toggle button is pressed down       | #2563EB        |
| height           | Height of toggle button                                   | 1              |
| width            | Width of toggle button                                    | 1              |
| margin           | Margin around toggle button                               | 0 0 0 0        |

```html
<a-sxr-toggle
	width="2.5" height="0.75"
	onclick="testToggleAction"
	value="toggle label"
	font-family="Outfit-Regular.woff2"
	font-size="0.2"
	margin="0 0 0.05 0"
>
</a-sxr-toggle>
```

## States

| Property | Meaning |
| --- | --- |
| `checked` | The switch is on or off |
| `active` | The switch is enabled; `false` renders it disabled and ignores activation |

`aria-checked` follows `checked`, so assistive technology and keyboard users see
the current state.

## Interaction

Click, or focus and press `Enter` / `Space`, to flip the state. Disabled
(`active="false"`) widgets ignore activation.
