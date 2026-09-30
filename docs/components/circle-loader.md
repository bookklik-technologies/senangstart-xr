# Circle Loader

A circular ring meter that displays a percentage in the center.

### a-sxr-circle-loader Component
#### Properties

| Property           | Description                                               | Default Value |
| --------           | -------------------------------------------------------   | ------------- |
| active-color       | Color of ring that indicates loading progress             | #2563EB       |
| background-color   | Background color of item                                  | #202127       |
| loaded             | Initial percentage progress value                         | 0.5           |
| font-color         | Text color for progress percentage text                   | #F1F5F9       |
| font-family        | Font family for progress percentage text                  | Outfit-Regular.ttf |
| font-size          | Font size for progress percentage text                    | 0.2           |
| height             | Height of item                                            | 1             |
| width              | Width of item                                             | 1             |
| margin             | Margin around item                                        | 0 0 0 0       |

```html
<a-sxr-circle-loader
	height="0.75"
	font-family="Outfit-Regular.woff2"
	font-size="0.2"
	loaded="0.3456"
	margin="0 0 0.1 0"
	background-color="#999"
>
</a-sxr-circle-loader>
```

## Loading an asset

Drive `loaded` while an asset downloads:

```js
const loader = document.querySelector('a-sxr-circle-loader')

fetch('/model.glb')
  .then(response => response.body.getReader())
  .then(({ readableStream }) => {
    const total = +response.headers.get('content-length')
    const reader = readableStream.getReader()
    let received = 0

    const pump = () => readableStream && read()
    function read() {
      reader.read().then(({ done, value }) => {
        if (done) { loader.setAttribute('loaded', '1'); return }
        received += value.length
        loader.setAttribute('loaded', String(received / total))
        pump()
      })
    }
    pump()
  })
```

::: tip Property name
The progress value is `loaded` on this widget, not `percent` — `percent` is
used by [Progress Bar](/components/progress-bar) and the sliders.
:::
