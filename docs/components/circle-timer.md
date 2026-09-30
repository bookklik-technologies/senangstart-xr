# Circle Timer

A countdown ring with 25/50/75/100 tick marks and a remaining-seconds readout.

<DemoWidget title="Circle timer with progress meters" src="/senangstart-xr/demo/values.html" height="420" />

### a-sxr-circle-timer Component
#### Properties

| Property           | Description                                               | Default Value |
| --------           | -------------------------------------------------------   | ------------- |
| font-size          | Font size for countdown text                              | 0.2           |
| font-family        | Font family for progress countdown text                   | Outfit-Regular.ttf |
| font-color         | Text color for progress countdown text                    | #F1F5F9       |
| border-color       | Color of indicators that show 25/50/75/100 progress       | #1B1B1F       |
| background-color   | Background color of item                                  | #202127       |
| active-color       | Color of ring that indicates countdown progress           | #2563EB       |

| count-down         | Initial countdown value in seconds                        | 10            |
| callback           | Name of a global function that fires when countdown expires | ''          |

| width              | Width of item                                             | 1             |
| height             | Height of item                                            | 1             |
| margin             | Margin around item                                        | 0 0 0 0       |

```html
<a-sxr-circle-timer
	height="0.75"
	count-down="60"
	callback="timedout"
	font-family="Outfit-Regular.woff2"
	margin="0 0 0.1 0"
>
</a-sxr-circle-timer>
```

## Countdown

Set the starting duration in seconds with `count-down`. The ring drains once
the scene loads.

```js
const timer = document.querySelector('a-sxr-circle-timer')
timer.setAttribute('count-down', '30')
```

## Expiry callback

`callback` names a **global function** invoked when the countdown reaches zero.
The callback takes no arguments:

```js
function timedout() {
  console.log('time is up')
}
```

::: tip Prefer events
Global callbacks must exist on `window` before the scene loads — a typo
silently no-ops. Alternatively, listen for the widget's own events. See
[Interaction](/guide/interaction#callbacks-vs-events).
:::

## Tick marks

`border-color` paints the 25/50/75/100% indicator marks around the ring. Use a
contrasting color when the ring needs quick quarter readings.
