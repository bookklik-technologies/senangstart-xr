# Occlusion

By default widget text and icons **always draw on top of scene geometry**. This
is the legacy rendering behavior and it is what keeps labels legible when they
overlap walls, models or other UI.

Applications that want scene geometry to occlude labels can opt in per widget.

## Opting in

| Property | Widget |
| --- | --- |
| `text-occlusion="true"` | [`a-sxr-label`](/components/label) |
| `icon-occlusion="true"` | [`a-sxr-icon-button`](/components/icon-button), [`a-sxr-icon-label-button`](/components/icon-label-button) |

```html
<a-sxr-label value="Behind the wall" text-occlusion="true"></a-sxr-label>
```

## Why it is opt-in

Enabling the depth test changes the render contract for the whole scene:

| | Default (always on top) | Opt-in (depth tested) |
| --- | --- | --- |
| `depthTest` | `false` | `true` |
| `renderOrder` (text) | `1000` | `10` |
| `renderOrder` (icon) | `1001` | `10` |
| Result | Labels never hidden by geometry | Labels hidden behind geometry |

The default keeps text legible and predictable. Turning occlusion on is useful
when widgets are placed *inside* 3D content — behind a doorway, on the far side
of a model — and hiding them would be more correct than floating them on top.

## Programmatic equivalent

The same behavior is available through the renderer API, where the option is
called `depthTest`:

```js
const label = SXR.createTextEntity({
  value: 'Occluded',
  depthTest: true   // renderOrder becomes 10
})
```

`SXR.redrawTextEntity` and `SXR.redrawIconEntity` accept `depthTest` too and
update the material and render order in place.

## Trade-offs

- **Legibility vs. realism.** Always-on-top text can appear to float over walls.
  Depth-tested text can be hidden in ways the user does not expect — a label
  inside a model may vanish entirely.
- **Z-fighting.** A depth-tested label coplanar with a surface can flicker;
  offset it slightly with `text-depth` or `position`.
- **Render order.** Depth-tested entities use a low `renderOrder` and join the
  normal depth-sorted pass, so they compete with scene geometry as expected.
