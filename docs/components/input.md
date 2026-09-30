# Input

A text input field. By default the field is canvas-rendered and updated
programmatically; opt-in native editing gives you a real keyboard with paste
and IME support.

### a-sxr-input Component
#### Properties

| Property           | Description                                           | Default Value  |
| --------           | ----------------------------------------------------  | -------------  |
| onclick            | Function to call on click event                       |                |
| onhover            | Function to call on hover event                       |                |
| value              | Input text value                                      |                |
| native-editing     | Opt-in: activation focuses a synchronized native text field; emits `input` on changes and `change` on commit | false |
| key                | Textual shortcut key that activates the widget (e.g. 'e') |            |
| key-code           | Legacy numeric shortcut key (e.g. 32 for Space)       | -1            |

| font-size          | Font size for input                                   | 0.2            |
| font-family        | Font family for input                                 | Outfit-Regular.ttf |
| font-color         | Text input color                                      | #161618        |
| border-color       | Border color of input                                 | #1B1B1F        |
| background-color   | Background color of input                             | #F1F5F9        |
| border-hover-color | Border color when input is in hover state             | #0EA5E9        |
| hover-color        | Background color when input is in hover state         | #F1F5F9        |

| margin             | Margin around item                                    | 0 0 0 0        |
| height             | Height of item                                        | 1              |
| width              | Width of item                                         | 1              |

```html
<a-sxr-input
	width="2.5" height="0.75"
	onclick="inputActionFunction"
	font-family="Outfit-Regular.woff2"
	font-size="0.2"
	value="Hello Wor_"
	margin="0 0 0.05 0"
>
</a-sxr-input>
```

## Programmatic editing

Without native editing, the field is driven from JavaScript:

```js
const input = document.querySelector('a-sxr-input')

input.appendText('ld')     // append characters
input.delete()             // delete backwards (backspace)
input.setAttribute('value', 'Hello World')
```

## Native text editing (opt-in)

By default the input is a canvas-rendered field updated programmatically
(`appendText()`, `delete()`, or the `value` attribute). Adding
`native-editing="true"` makes activation (click / keyboard activation) focus a
visually hidden, labelled native `<input>` kept in sync with the widget: typing,
arrow-key caret/selection movement, paste and IME composition all work with the
real keyboard, `input` events fire as the text changes, and `change` fires on
commit (`Enter` or losing focus), once per changed value. Setting
`native-editing="false"` commits any pending edit and removes the native field.

```html
<a-sxr-input width="2.8" height="0.5"
	native-editing="true"
	value="Type here"
	margin="0 0 0.05 0">
</a-sxr-input>
```

```js
input.addEventListener('input', (e) => console.log('typing', e.detail.value))
input.addEventListener('change', (e) => console.log('committed', e.detail.value))
```

::: tip Desktop focused
Immersive (VR) text entry remains application-provided; this opt-in targets
desktop keyboard use. The release does not bundle a Quest virtual keyboard.
:::
