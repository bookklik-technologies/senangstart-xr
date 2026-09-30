# Icon Label Button

A button combining an icon and a text label.

### a-sxr-icon-label-button Component
#### Properties

| Property         | Description                                            | Default Value |
| --------         | ----------------------------------------------------   | ------------- |
| on               | Event that triggers onclick action                     | click         |

| icon              | SenangStart icon slug, e.g. `check`, `sparkles`        | check         |
| icon-active      | Icon slug for the active state                         | ''            |
| icon-font        | Legacy option retained for compatibility               | ''            |
| icon-font-size   | Icon size for button                                   | 0.35          |
| icon-occlusion   | Let scene geometry occlude the icon (opt-in depth test) | false        |
| key              | Textual shortcut key that activates the widget (e.g. 'e') |            |
| key-code         | Legacy numeric shortcut key (e.g. 32 for Space)        | -1            |

| font-color       | Text color for button label                            | #F1F5F9       |
| value            | Text of button label                                   | ''            |
| font-family      | Font family for button                                 | Outfit-Regular.ttf |
| font-size        | Font size for button                                   | 0.2           |
| border-color     | Border color of button                                 | #1B1B1F       |
| background-color | Background color of button                             | #202127       |
| hover-color      | Background color when button is in hover state         | #0EA5E9       |
| active-color     | Background color when button is pressed down           | #2563EB       |
| toggle           | Toggle status                                          | false         |
| toggle-state     | Setting the toggle button on/off state                 | false         |

| height           | Height of button                                       | 1             |
| width            | Width of button                                        | 1             |
| margin           | Margin around button                                   | 0 0 0 0       |

```html
<a-sxr-icon-label-button
	width="2.5" height="0.75"
	onclick="buttonActionFunction"
	icon="sparkles"
	value="icon label"
	font-family="Outfit-Regular.woff2"
	font-size="0.16"
	margin="0 0 0.05 0"
>
</a-sxr-icon-label-button>
```

## Notes

- `value` holds the text label; `icon` holds the icon slug. Both are
  [live-updatable](/advanced/live-updates).
- `icon-active` swaps the icon in the pressed state.
- `icon-font` is a legacy option retained for compatibility.
- Set `icon-occlusion="true"` to let scene geometry occlude the icon — see
  [Occlusion](/advanced/occlusion).
