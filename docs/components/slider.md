# Slider

A horizontal slider. The value is a percent from `0.0` to `1.0`; it responds
to clicks at the exact hit point, arrow keys, and Home/End.

<DemoWidget title="Sliders, input and progress meters" src="/senangstart-xr/demo/values.html" height="420" />

### a-sxr-slider Component
#### Properties

| Property            | Description                                               | Default Value  |
| --------            | -------------------------------------------------------   | -------------  |
| active-color        | Color of the active (filled) part of the track            | #2563EB        |
| background-color    | Background color of the track                             | #F1F5F9        |
| border-color        | Color of the inactive part of the track                   | #1B1B1F        |
| handle-color        | Color of the handle                                       | #F1F5F9        |
| handle-outer-radius | Outer radius of the handle                                | 0.17           |
| handle-inner-radius | Inner radius of the handle                                | 0.13           |
| handle-outer-depth  | Depth of the outer handle                                 | 0.04           |
| handle-inner-depth  | Depth of the inner handle                                 | 0.02           |
| height              | Height of item                                            | 1              |
| hover-color         | Handle color while hovering                               | #0EA5E9        |
| keyboard-step       | Percent added/removed per arrow-key press when focused    | 0.05           |
| key                 | Textual shortcut key that activates the widget (e.g. 'e') |                |
| key-code            | Legacy numeric shortcut key (e.g. 13 for Enter)           | -1             |
| left-right-padding  | Padding applied to the track width                        | 0.25           |
| margin              | Margin around item                                        | 0 0 0 0        |
| onclick             | Javascript function to execute on click                   |               |
| onhover             | Javascript function to execute on hover                   |               |
| percent             | Current slider value, from 0.0 to 1.0                     | 0.5            |
| slider-bar-depth    | Depth of the slider track                                 | 0.03           |
| slider-bar-height   | Height of the slider track                                | 0.05           |
| top-bottom-padding  | Padding applied to the track height                       | 0.125          |
| width               | Width of item                                             | 1              |

```html
<a-sxr-slider
	width="2.5" height="0.75"
	onclick="slideActionFunction"
	percent="0.29"
	margin="0 0 0.05 0"
>
</a-sxr-slider>
```

## Callback signature

The `onclick` callback receives **`(event, percent)`**:

```js
function slideActionFunction(event, percent) {
  console.log('slider moved to', percent)
}
```

## Keyboard

| Key | Action |
| --- | --- |
| `←` `→` | Step by `keyboard-step` (0.05 by default) |
| `↑` `↓` | Step by `keyboard-step` |
| `Home` | Jump to `0` |
| `End` | Jump to `1` |

`aria-valuenow` follows `percent`.

## VR controllers

Controller `click` events carry the ray intersection, so a VR laser sets the
slider to the exact point the ray hits. See
[VR controllers](/guide/interaction#vr-controllers).
