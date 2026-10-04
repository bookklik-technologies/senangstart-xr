# Label

A canvas-rendered text label with wrapping, alignment and optional stroke.

### a-sxr-label Component
#### Properties

| Property         | Description                                             | Default Value  |
| --------         | ------------------------------------------------------- | -------------  |
| value            | Text of the label  			                             | ''             |
| align            | text-align: 'left','center','right' 		             | 'center'       |
| anchor           | text anchor position: 'left','center','right' 	         | 'center'       |
| line-height      | line-height of the label                                | 0.2            |
| letter-spacing   | letter spacing of the label                             | 0              |
| font-size        | Font size for label                                     | 0.2            |
| font-family      | Font family for label                                   | Outfit-Regular.ttf |
| font-color       | Text color of label                                     | #F1F5F9        |
| background-color | Background color of label                               | #202127        |
| opacity          | Opacity of the label background                         | 1.0            |
| text-depth       | distance from the text to label background              | 0.01           |
| text-occlusion   | Let scene geometry occlude the text (opt-in depth test)  | false          |
| text-stroke-color  | Color of the text stroke (canvas stroke style)        | ''             |
| text-stroke-width   | Width of the text stroke (-1 disables)               | -1             |
| height           | Height of item                                          | 1              |
| width            | Width of item                                           | 1              |
| margin           | Margin around item                                      | 0 0 0 0        |


```html
<a-sxr-label
	width="2.5" height="0.75"
	value="test label"
	font-family="Outfit-Regular.woff2"
	font-size="0.35"
	line-height="0.8"
	letter-spacing="0"
	margin="0 0 0.05 0"
>
</a-sxr-label>
```

## Multi-line text

Text wraps automatically within the label's `width`. Long text is shrunk with a
binary search over font size so it always fits the box rather than overflowing.

## Alignment

`align` controls text alignment inside the box (`left`, `center`, `right`) and
`anchor` controls which edge the text block is anchored to.

## Text stroke

Add an outline for legibility over busy 3D scenes:

```html
<a-sxr-label value="Warning"
             text-stroke-color="#000000"
             text-stroke-width="0.02"></a-sxr-label>
```

A `text-stroke-width` of `-1` (the default) disables the stroke.

## Occlusion

Labels draw on top of scene geometry by default. Set `text-occlusion="true"` to
let scene geometry occlude the text — see [Occlusion](/advanced/occlusion).
