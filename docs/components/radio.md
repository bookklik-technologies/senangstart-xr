# Radio

A radio button. Radios sharing a `group` name behave as a mutually exclusive
set, and the group supports WAI-ARIA arrow-key navigation.

### a-sxr-radio Component
#### Properties

| Property         | Description                                               | Default Value  |
| --------         | -------------------------------------------------------   | -------------- |
| on               | Event that triggers onclick action                        | click          |
| checked          | Whether the radio is initially selected                   | false          |
| active           | Whether the radio is enabled                              | true           |
| group            | Group name; selecting one radio unchecks same-group radios | ''            |

| value            | Text of the radio button label                            | ''             |
| font-family      | Font family for radio button                              | Outfit-Regular.ttf |
| font-size        | Font size for radio button                                | 0.2            |
| font-color       | Text color for radio button label                         | #161618        |
| border-color     | Border color of radio button                              | #1B1B1F        |
| background-color | Background color of radio button                          | #F1F5F9        |
| hover-color      | Background color when radio button is in hover state      | #0EA5E9        |
| handle-color     | Color of the radio center handle                          | #202127        |
| active-color     | Background color when radio button is pressed down        | #2563EB        |
| radiosizecoef    | Scale factor for the radio circle size                    | 1              |

| key              | Textual shortcut key that activates the widget (e.g. 'e') |            |
| key-code         | Legacy numeric shortcut key (e.g. 32 for Space)        | -1            |
| width            | Width of radio button                                     | 1              |
| height           | Height of radio button                                    | 1              |
| margin           | Margin around radio button                                | 0 0 0 0        |

```html
<a-sxr-radio
	width="2.5" height="0.75"
	onclick="toggleActionFunction"
	value="radio label"
	font-size="0.3"
	margin="0 0 0.05 0"
>
</a-sxr-radio>
```

## Groups

Give radios the same `group` value to make them mutually exclusive — selecting
one automatically unchecks its siblings.

```html
<a-sxr-flex-container flex-direction="column" item-padding="0.1" opacity="1"
                      width="3" height="2" position="0 1.6 -2">
  <a-sxr-radio group="quality" checked="true" value="Low"></a-sxr-radio>
  <a-sxr-radio group="quality" value="Medium"></a-sxr-radio>
  <a-sxr-radio group="quality" value="High"></a-sxr-radio>
</a-sxr-flex-container>
```

## Keyboard

| Key | Action |
| --- | --- |
| `Space` | Select the focused radio |
| `↑` `↓` | Move selection through the group |
| `←` `→` | Move selection through the group |

`aria-checked` reflects the selected state, and selection is animated.
`active="false"` disables the radio.
