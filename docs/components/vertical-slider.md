# Vertical Slider

A vertical slider with a hover indicator bubble showing the value under the
pointer, and an output label that can format the value through a function.

### a-sxr-vertical-slider Component
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
| hover-color         | Handle color while hovering                               | #0EA5E9        |
| hover-font-size     | Font size of label indicating where user is hovering      | 0.2            |
| hover-height        |  Height of label indicating where user is hovering        | 0.35           |
| hover-percent       | Current percentage where user is hovering                 |                |
| hover-width         | Width of label indicating where user is hovering          | 0.7            |
| keyboard-step       | Percent added/removed per arrow-key press when focused    | 0.05           |
| key                 | Textual shortcut key that activates the widget (e.g. 'e') |                |
| key-code            | Legacy numeric shortcut key (e.g. 13 for Enter)           | -1             |
| margin              | Margin around item                                        | '0 0 0 0'      |
| onclick             | Javascript function to execute on click                   |                |
| onhover             | Javascript function to execute on hover                   |                |
| opacity             | Transparency of the vertical slider background            | 1.0            |
| output-font-size    |  Font size of label indicating output value               | 0.2            |
| output-function     |  Name of function to calculate output value from percent  |                |
| output-text-depth   |   Distance from output text to label background           | 0.25           |
| output-width        |  Width of label indicating output value                   | 1.0            |
| percent             |  Current selected slider value, from 0.0 to 1.0           | 0.5            |
| slider-bar-depth    |                                                           | 0.03           |
| slider-bar-width    |  Width of the slider track                                | 0.08           |
| top-bottom-padding  |  Padding applied to the track height                      | 0.25           |
| height              | Height of item                                            | 1              |
| width               | Width of item                                             | 1              |

```html
<a-sxr-vertical-slider
	width="2.5" height="0.75"
	onclick="slideActionFunction"
	percent="0.29"
	margin="0 0 0.05 0"
>
</a-sxr-vertical-slider>
```

## Callback signature

The `onclick` callback receives **`(percent)`** — for both pointer and keyboard
activation:

```js
function slideActionFunction(percent) {
  console.log('vertical slider moved to', percent)
}
```

## Output label

`output-function` names a **global function** that converts the raw percent
into the displayed text:

```js
function toDegrees(percent) {
  return Math.round(percent * 360) + '°'
}
```

```html
<a-sxr-vertical-slider output-function="toDegrees" percent="0.5"></a-sxr-vertical-slider>
```

The label's width, font size and depth are controlled by `output-width`,
`output-font-size` and `output-text-depth`.

## Hover indicator

While the pointer is over the track, a bubble shows the percentage at that
position. Its appearance is controlled by `hover-width`, `hover-height`,
`hover-font-size` and `hover-percent`; the handle adopts `hover-color`.

## Keyboard

`↑` `↓` (and `←` `→`) step by `keyboard-step`; `Home`/`End` jump to 0/1.
