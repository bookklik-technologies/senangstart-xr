# Progress Bar

A linear progress bar. Set `percent` from `0.0` to `1.0`.

### a-sxr-progress-bar Component
#### Properties

| Property         | Description                                               | Default Value |
| --------         | -------------------------------------------------------   | ------------- |
| background-color | Background color of progress bar                          | #202127       |
| active-color     | Color for indicating progress level                       | #2563EB       |
| percent          | Progress amount, from 0.0 to 1.0                          | 0.5           |
| height           | Height of item                                            | 1             |
| width            | Width of item                                             | 1             |
| margin           | Margin around item                                        | 0 0 0 0       |


```html
<a-sxr-progressbar
	width="2.5" height="0.25"
	percent="0.4"
	margin="0 0 0.05 0"
>
</a-sxr-progressbar>
```

::: tip Primitive name
The component is `sxr-progress-bar` but the primitive is `a-sxr-progressbar`
(no hyphen between progress and bar).
:::

## Updating progress

`percent` is live-updatable:

```js
progressbar.setAttribute('percent', '0.8')
```

The fill animates to the new value without recreating the widget.

## Circular alternatives

For a ring-shaped meter use [Circle Loader](/components/circle-loader), or
[Circle Timer](/components/circle-timer) for a countdown ring.
