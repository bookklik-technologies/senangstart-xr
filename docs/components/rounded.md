# Rounded Panel

The `rounded` component (primitive `a-rounded`) builds a rounded-rectangle
panel from a `THREE.ShapeGeometry`. It is used internally by some widgets and
is useful on its own for backing plates behind a layout.

::: tip
This component's primitive is `a-rounded` — it is not prefixed with `sxr-`.
:::

## Properties

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
| enabled | Show or hide the panel | true |
| width | Panel width | 1 |
| height | Panel height | 1 |
| radius | Corner radius applied to all four corners | 0.3 |
| topLeftRadius | Override radius for the top-left corner; `-1` uses `radius` | -1 |
| topRightRadius | Override radius for the top-right corner; `-1` uses `radius` | -1 |
| bottomLeftRadius | Override radius for the bottom-left corner; `-1` uses `radius` | -1 |
| bottomRightRadius | Override radius for the bottom-right corner; `-1` uses `radius` | -1 |
| color | Panel color | #F0F0F0 |
| opacity | Panel opacity, clamped to 0–1 | 1 |
| depthWrite | Enable depth writing | true |
| polygonOffset | Enable polygon offset | false |
| polygonOffsetFactor | Polygon offset factor | 0 |
| renderOrder | Render order of the mesh | 0 |

```html
<a-rounded
  width="3" height="2"
  radius="0.2"
  color="#202127"
  opacity="0.85"
  position="0 1.6 -2.2">
</a-rounded>
```

## Per-corner radii

A corner override of `-1` (the default) falls back to the shared `radius`
value, so you only set the corners that differ:

```html
<a-rounded width="3" height="1" radius="0" top-left-radius="0.2" top-right-radius="0.2"></a-rounded>
```

## Rendering

- `opacity` below `1` switches the material to transparent and sets `alphaTest` to `0`; at `1` or above, transparency is disabled.
- `renderOrder`, `depthWrite` and the polygon offset settings control how the panel composites against other scene geometry — useful when a panel coplanar with a widget flickers.
- Disabling via `enabled="false"` hides the mesh rather than disposing it, so re-enabling is cheap.

## Cleanup

On `remove`, the component removes its object3D and disposes both the geometry
and the material, so no GPU resources leak when the entity is torn down.
