# Icon Button

A circular button showing an icon instead of text. Icons come from the
[SenangStart icon set](/api/icons) and are referenced by slug.

### a-sxr-icon-button Component
#### Properties

| Property           | Description                                               | Default Value |
| --------           | -------------------------------------------------------   | ------------- |
| on                 | Event that triggers onclick action                        | click         |

| font-color         | Text color for button label                               | #F1F5F9       |
| border-color       | Border color of button                                    | #1B1B1F       |
| background-color   | Background color of item                                  | #202127       |
| hover-color        | Background color when button is in hover state            | #0EA5E9       |
| active-color       | Background color when button is pressed down              | #2563EB       |
| icon               | SenangStart icon slug, e.g. `check`, `play`, `cog-6-tooth` | check         |
| icon-active        | Icon slug for the active state                            | ''            |
| icon-font          | Legacy option retained for compatibility                  | ''            |
| icon-font-size     | Icon size for button                                      | 0.4           |
| icon-occlusion     | Let scene geometry occlude the icon (opt-in depth test)   | false         |
| key                | Textual shortcut key that activates the widget (e.g. 'e') |               |
| key-code           | Legacy numeric shortcut key (e.g. 32 for Space)           | -1            |
| toggle             | Toggle status                                             | false         |
| toggle-state       | Setting the toggle button on/off state                    | false         |

| height             | Height of item                                            | 1             |
| width              | Width of item                                             | 1             |
| margin             | Margin around item                                        | 0 0 0 0       |

```html
<a-sxr-icon-button
	height="0.75"
	onclick="buttonActionFunction" key-code="32"
	icon="star"
	margin="0 0 0.05 0"
>
</a-sxr-icon-button>
```

## Icons

`icon` takes a slug from the [icon set](/api/icons) — 246 icons are available
(`check`, `play`, `cog-6-tooth`, `sparkles`, …). An unknown slug falls back to a
`?` glyph rather than failing.

`icon-active` swaps the displayed icon while the button is pressed, which is
the usual way to show a pressed/confirmed state:

```html
<a-sxr-icon-button icon="play" icon-active="pause"></a-sxr-icon-button>
```

`icon-font` is a legacy option retained for compatibility; new scenes should
use `icon`.

## Toggle mode

`toggle="true"` latches the button on and off, with the state held in
`toggle-state`.

## Occlusion

Icons draw on top of scene geometry by default. Set `icon-occlusion="true"` to
let scene geometry occlude the icon — see [Occlusion](/advanced/occlusion).
