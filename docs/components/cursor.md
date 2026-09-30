# Cursor

The pointer used to interact with GUI elements. Four designs are available, and
it supports gaze (fuse) interaction for mobile and headset use.

### a-sxr-cursor Component
#### Properties

| Property    | Description                                               | Default Value |
| --------    | -------------------------------------------------------   | ------------- |
| color       | Cursor initial color                                      | #F1F5F9       |
| hover-color | Cursor hover color                                        | #0EA5E9       |
| active-color| Cursor selection/active color                             | #2563EB       |
| distance    | distance of the pointer from the camera                   | -1            |
| design      | choose a design: 'dot', 'ring', 'cross' or 'reticle'      | 'dot'         |

The `a-sxr-cursor` primitive includes a pre-scoped raycaster by default
(`objects: [sxr-interactable]`, `interval: 100`), so cursor raycasts only test
interactive widgets instead of the whole scene. Override it with a
`raycaster="..."` attribute if you need different targets.

```html
		<!-- Camera + cursor. -->
		<a-entity id="cameraRig" position="0 1.6 0">
			<a-camera look-controls wasd-controls position="0 0 0">
				<a-sxr-cursor id="cursor"
						  fuse="true" fuse-timeout="2000"
						  color="#ECEFF1"
						  hover-color="#CFD8DC"
						  active-color="#607D8B"
						  design="ring" > <!-- dot, ring, reticle, cross  -->
				</a-sxr-cursor> <!-- /cursor -->
			</a-camera> <!-- /camera -->
		</a-entity>
```

## Designs

| `design` | Appearance | Typical use |
| --- | --- | --- |
| `dot` | Small filled dot | Desktop mouse-like pointer |
| `ring` | Hollow ring | Gaze and general use |
| `cross` | Crosshair | Precision pointing |
| `reticle` | Reticle with arms | VR-style targeting |

## Gaze (fuse)

Set `fuse="true"` to activate by dwelling on a widget. `fuse-timeout` controls
the dwell duration in milliseconds; the cursor renders a progress ring while
dwell is in progress.

```html
<a-sxr-cursor fuse="true" fuse-timeout="1500" design="ring"></a-sxr-cursor>
```

## Raycaster override

The default raycaster is already scoped to interactive widgets. Override it when
you need different targets:

```html
		<!-- Camera + cursor. -->
		<a-entity id="cameraRig" position="0 1.6 0">
			<a-camera look-controls wasd-controls position="0 0 0">
				<a-sxr-cursor id="cursor"
						  raycaster="objects: [sxr-interactable]"
						  fuse="false"
				>
				</a-sxr-cursor> <!-- /cursor -->
			</a-camera> <!-- /camera -->
		</a-entity>
```

## Distance

`distance` positions the pointer relative to the camera. The default of `-1`
lets the cursor sit at the ray intersection; set a positive value to pin it at a
fixed distance in front of the camera.
