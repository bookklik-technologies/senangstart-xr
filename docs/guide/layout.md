# Layout with Flex Container

`a-sxr-flex-container` arranges child widgets in a 3D panel using a
flexbox-inspired layout engine.

<DemoWidget title="Flex container layout and style inheritance" src="/senangstart-xr/demo/layout.html" height="420" />

::: warning `opacity` default
The container's default `opacity` is `0.0`, so a freshly added container is
invisible. Set `opacity` to a value between `0` and `1` to see the panel.
:::

## Basic usage

```html
<a-sxr-flex-container
    flex-direction="column" justify-content="center" align-items="center"
    item-padding="0.1" opacity="0.7" width="3.5" height="4.5"
    panel-color="#072B73"
    panel-rounded="0.2"
    position="0 2.5 -6" rotation="0 0 0"
>
  ... gui items here...
</a-sxr-flex-container>
```

## Direction and distribution

| Property | Purpose |
| --- | --- |
| `flex-direction` | Main axis: `row` or `column` |
| `justify-content` | Distribution along the main axis: `flexStart`, `center`, `flexEnd` |
| `align-items` | Distribution along the cross axis (perpendicular to `justify-content`) |
| `item-padding` | Spacing between children |

Children **relayout automatically** after insertion, removal, resize or any
other layout change — a `MutationObserver` plus a debounce handles it, so
programmatically adding or removing widgets keeps the panel correct.

## Panel background

| Property | Purpose |
| --- | --- |
| `is-top-container` | Renders the container's own panel background |
| `panel-color` | Panel background color |
| `panel-rounded` | Panel corner radius |

## Style inheritance

A container doubles as a theme scope. Its style properties are inherited by
child widgets that do not define their own value:

`font-family`, `font-color`, `border-color`, `background-color`,
`hover-color`, `active-color`, `handle-color`

```html
<a-sxr-flex-container
  font-family="Outfit-Regular.ttf"
  font-color="#F1F5F9"
  hover-color="#0EA5E9"
  active-color="#2563EB"
  opacity="1" width="4" height="3">
  <a-sxr-button width="2" height="0.6" value="Inherits hover and active"></a-sxr-button>
</a-sxr-flex-container>
```

### Legacy style objects

Container style attributes map to flat component properties (`fontColor`,
`fontFamily`, …). The programmatic legacy object form remains supported:

```js
el.setAttribute('sxr-flex-container', 'styles', { fontColor: '#fff' })
```

Explicit container properties **override** legacy object values. Inherited
styles keep updating until a child supplies its own style value.

## Live updates

Layout properties can be changed after initialization. Children relayout
immediately, including after programmatic child insertion and removal — see
[Live Attribute Updates](/advanced/live-updates).
