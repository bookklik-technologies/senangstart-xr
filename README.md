# SenangStart XR

A graphical User Interface framework for [A-Frame](https://aframe.io).

The `senangstart-xr` components provide layout and gui widgets that can be used
to create a user interface in an A-Frame scene. 

The `dist/senangstart-xr.js` file defines the following components:

| Component             | Primitive                | Description |
| --------------------  | ------------------------ | -------------------------------------------------------  |
| sxr-flex-container    | a-sxr-flex-container     | Layout container with flexbox-inspired layout                           |
| sxr-item              | <none>                   | Used by other components for common properties like height and width    |
| sxr-interactable      | <none>                   | Used by other components to define onclick behavior      |
| sxr-cursor            | a-sxr-cursor             | Cursor used to interact with GUI elements.               |
| sxr-button            | a-sxr-button             | Standard button component with text label                |
| sxr-icon-button       | a-sxr-icon-button        | Button with icon label instead of text                   |
| sxr-icon-label-button | a-sxr-icon-label-button  | Button with both icon and text labels                    |
| sxr-radio             | a-sxr-radio              | Radio button                                             |
| sxr-toggle            | a-sxr-toggle             | Toggle button                                            |
| sxr-slider            | a-sxr-slider             | Slider component                                         |
| sxr-vertical-slider   | a-sxr-vertical-slider    | Vertical slider component                                |
| sxr-input             | a-sxr-input              | Text input field                                         |
| sxr-label             | a-sxr-label              | Text label                                               |
| sxr-progress-bar      | a-sxr-progressbar        | Progress bar                                             |
| sxr-circle-loader     | a-sxr-circle-loader      | Circular progress meter                                  |
| sxr-circle-timer      | a-sxr-circle-timer       | Circular progress meter with timer                       |

## A-Frame version support

Supported A-Frame versions are **1.7.x and 1.8.x** (peer dependency
`>=1.7.0 <1.9.0`). The library is validated against the pinned releases
[1.7.0](https://aframe.io/releases/1.7.0/aframe.min.js),
1.7.1 and
[1.8.0](https://aframe.io/blog/aframe-v1.8.0/). Earlier A-Frame versions
(including 1.4.x, shown in some legacy snippets) are no longer tested
against this library.


## Brand colors

| Token | Value | Legacy alias |
| ----- | ----- | ------------ |
| primary | `#2563EB` | key_orange |
| primaryGradient | `linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)` | |
| secondary | `#0EA5E9` | key_orange_light |
| darkBase | `#1B1B1F` | |
| darkDeeper | `#161618` | |
| darkCard | `#202127` | |
| accent | `#2563EB` | |
| slate100 | `#F1F5F9` | |
| success | `#10B981` | |
| warning | `#F59E0B` | |
| background | `#161618` | key_grey_dark |
| surface | `#202127` | key_grey |
| onSurface | `#F1F5F9` | key_offwhite, key_white |
| border | `#1B1B1F` | |
| error | `#EF4444` | |
| neutral | `#1B1B1F` | key_grey_light |

### Text font

The default font family is `Outfit-Regular.ttf` (`SXR.fonts.default`), which is
**packaged with the npm tarball** and resolved relative to the bundle script
URL. When a font **filename** (`*.ttf` / `*.otf` / `*.woff` / `*.woff2`) is
passed, the canvas renderer registers it through the FontFace API; concurrent
loads of the same file are shared, and any text already rendered while the
font was loading is redrawn automatically once the font resolves. While the
font loads — or when FontFace is unavailable — text renders with the system
font stack (`Arial, Helvetica, sans-serif`). To use a custom font directly,
pass a font-family name that is already available to the canvas 2D context
(e.g. `font-family="Arial"`); custom font files resolve relative to the page
URL. Builds copy `Outfit-Regular.ttf` beside each bundle in `dist/` and
`examples/js/`; the source font remains at the repository root.

### Occlusion (opt-in)

By default widget text and icons always draw on top of scene geometry (legacy
rendering). Applications that want scene geometry to occlude labels can opt
in per widget:

- `text-occlusion="true"` on `a-sxr-label`
- `icon-occlusion="true"` on `a-sxr-icon-button` and `a-sxr-icon-label-button`

## Examples

A ready-to-run demo scene is included at [`examples/index.html`](examples/index.html).
Open it in a browser (serve the folder over HTTP, e.g. `npx serve .`) to see
the widgets in action.

## Use in your A-Frame project

Include A-Frame, then the SenangStart XR bundle, in the `<head>` of your page:

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<!-- local build -->
<script src="dist/senangstart-xr.js"></script>
```

Then use the `a-sxr-*` primitives inside your `<a-scene>` (see the Components
section below and `examples/index.html`).

### Install via npm

```bash
npm install senangstart-xr
```

A-Frame is a peer dependency (supported range: `>=1.7.0 <1.9.0`) and must be
loaded on the page first. The package ships the built bundles and the bundled
font in `dist/` / package root; reference `dist/senangstart-xr.min.js` via a
`<script>` tag (the bundle registers its components against the global
`AFRAME` object and is not `require()`-able):

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="node_modules/senangstart-xr/dist/senangstart-xr.min.js"></script>
```

CDN usage (after publishing):

```html
<script src="https://unpkg.com/senangstart-xr@2.1.0/dist/senangstart-xr.min.js"></script>
```

Pin the version in CDN URLs — unpkg/jsdelivr redirects of unversioned URLs can
serve a different release than the one you tested against.

### Interaction notes

- Callbacks (`onclick`, `onhover`, `callback`) are the **names of global
  functions** resolved on `window` at event time; define them before the scene
  loads. A typo silently no-ops. Modern integrations can skip globals entirely
  and listen to the widget's own events
  (`el.addEventListener('click', handler)`).
- Keyboard activation is registered per widget; binding the same key to
  multiple widgets fires all of them.
- Shortcuts (`key` / `key-code`) are ignored while the user is typing into a
  text field, during IME composition, and for auto-repeated keydowns.
- Widgets declare ARIA roles and are keyboard-reachable (`tabindex="0"` on
  button, toggle, radio, sliders, input).

### Keyboard operation (desktop)

When a widget holds DOM focus (click it, or Tab to it):

| Widget            | Keys                                                       |
| ----------------- | ---------------------------------------------------------- |
| Button            | `Enter` / `Space` activate                                  |
| Toggle            | `Enter` / `Space` flip the state (disabled widgets ignore)  |
| Radio             | `Space` selects; arrow keys move through the group          |
| Slider            | `←`/`→` (and `↑`/`↓`) step by `keyboard-step`; `Home`/`End` jump to 0/1 |
| Vertical slider   | `↑`/`↓` (and `←`/`→`) step by `keyboard-step`; `Home`/`End` jump to 0/1 |
| Input             | `Enter` / `Space` activate; native editing requires `native-editing="true"` |

`key="e"` (textual) works independently of the legacy numeric `key-code="32"`;
when a widget's own shortcut key matches the focused key press, only the
shortcut fires (no duplicate activation).

### Live attribute updates

Widget attributes can be changed after initialization (via
`setAttribute` or the mapped primitive attributes); the following update
live without recreating the widget:

- **Dimensions** (`width`, `height`, `depth`, ... on `a-sxr-*` primitives):
  geometry, bars, borders and label boxes rebuild to fit.
- **Colors** (font, border, background, hover, active, handle): resting and
  label colors refresh; animations continue to use the new values.
- **Labels** (`value` on buttons, toggles, radios, labels, inputs): the text
  redraws in place and the accessible name (`aria-label`) stays in sync.
- **Activation event names** (`on="tap"`): the activation listener rebinds to
  the new event name.
- **States** (`checked`, `percent`, `loaded`, `count-down`, `hover-percent`):
  visuals and `aria-checked` / `aria-valuenow` follow.
- **Layout properties** on `a-sxr-flex-container`: children relayout, including
  after programmatic child insertion and removal.

Horizontal-slider callbacks receive `(event, percent)`. Vertical-slider
callbacks receive `(percent)` for both pointer and keyboard activation.

Container style attributes map to flat component properties (`fontColor`,
`fontFamily`, etc.). Programmatic legacy objects remain supported through
`setAttribute('sxr-flex-container', 'styles', {fontColor: '#fff'})`.
Explicit container properties override legacy object values. Inherited
styles update until a child supplies its own style value.

### Accessibility limitations

- Widget ARIA roles/labels live on 3D entities; screen readers do not
  announce them. Keyboard operation is provided for sighted keyboard users.
- Immersive (VR) text entry is application-provided; the release does not
  bundle a Quest virtual keyboard. On desktop, enable opt-in native editing
  (see `a-sxr-input`) to type with a real keyboard.
- Focus indicators are visual only (widget border/focus colors); there is no
  roving-tabindex container for flex layouts.

## License

[MIT](LICENSE) © Bookklik Technologies


## Building

Build development and production bundles, source map, and font to `dist/`:

`npm run dist`

Build an unminified development bundle to `dist/` (`senangstart-xr.js`):

`npm run dist-dev`

Build to the examples/js folder:

`npm run dist-example`

`npm run dist-example-min`

`npm run dist:all` builds both distributions. `npm run check:build` compares
bundle, source-map, and font copies. `npm run check:package` packs and installs
the tarball with A-Frame in a temporary consumer; failed installs fail the check.

CI runs Chromium integration checks against A-Frame 1.7.0, 1.7.1, and 1.8.0,
with each bundle. Screenshots and resource counts are uploaded as artifacts.
The runner requires Playwright and its Chromium installation. Its existence
does not establish a passing result; see [AUDIT.md](AUDIT.md) for current gates.


## Run locally

Run the following start the webpack-dev-server:

`npm start`

The webpack-dev-server should now be running at http://localhost:8080


## Components

### a-sxr-flex-container Component
#### Properties

| Property         | Description                                            | Default Value |
| --------         | ----------------------------------------------------   | ------------- |
| flex-direction   | property specifies how flex items are placed in the flex container defining the main axis and the direction: 'row', 'column'                                       | 'row'         |
| justify-content  | property defines distributed space between and around content items along the main axis of their container: 'flexStart','center','flexEnd'                         | 'flexStart'   |
| align-items      | property defines distributed space between and around flex items along the cross-axis of their container. Like justify-content but in the perpendicular direction. | 'flexStart'   |
| item-padding     | Spacing between children (children relayout automatically after insert, removal, resize or layout changes)                                                                                                                          | 0.0           |
| opacity          | Transparency of the flex-conntainer                                                                                                                                | 0.0           |
| is-top-container | Setting background of the flex-container                                                                                                                           | false         |
| panel-color      | Background color of the flex-container                                                                                                                             | #202127       |
| panel-rounded    | flex-container panel rounding radius                                                                                                                               | 0.05          |
| font-family      | Default font family inherited by child widgets (styles.fontFamily)                                                                                                 | Outfit-Regular.ttf |
| font-color       | Default text color inherited by child widgets (styles.fontColor)                                                                                                   | #F1F5F9       |
| border-color     | Default border color inherited by child widgets (styles.borderColor)                                                                                               | #1B1B1F       |
| background-color | Default background color inherited by child widgets (styles.backgroundColor)                                                                                       | #202127       |
| hover-color      | Default hover color inherited by child widgets (styles.hoverColor)                                                                                                 | #0EA5E9       |
| active-color     | Default active color inherited by child widgets (styles.activeColor)                                                                                               | #2563EB       |
| handle-color     | Default handle color inherited by child widgets (styles.handleColor)                                                                                               | #F1F5F9       |

```html
<a-sxr-flex-container 
    flex-direction="column" justify-content="center" align-items="center" item-padding="0.1" opacity="0.7" width="3.5" height="4.5" 
    panel-color="#072B73" 
    panel-rounded="0.2"
	position="0 2.5 -6" rotation="0 0 0"
>
... gui items here...

</a-sxr-flex-container>
```

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

#### Example with an explicit raycaster override (click trigger):

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

### VR controllers

Widgets work with A-Frame's controller-based raycasters out of the box —
controller `click` events carry the ray intersection, so sliders and inputs
respond to the exact hit point:

```html
		<a-entity id="leftHand" laser-controls="hand: left"
				  raycaster="objects: [sxr-interactable]"></a-entity>
		<a-entity id="rightHand" laser-controls="hand: right"
				  raycaster="objects: [sxr-interactable]"></a-entity>
```

Use A-Frame's [`raycaster-origin`](https://aframe.io/docs/core/components/raycaster.html)
component on the controller entity to move the ray origin (e.g. to the tip of
a controller model).
```


### a-sxr-button Component
#### Properties

| Property           | Description                                               | Default Value |
| --------           | -------------------------------------------------------   | ------------- |
| on                 | Event that triggers onclick action                        | click         |
| value              | Text of button label                                      |               |
| font-size          | Font size for button                                      | 0.2           |
| font-family        | Font family for button                                    | Outfit-Regular.ttf |
| font-color         | Text color for button label                               | #F1F5F9       |
| border-color       | Border color of button                                    | #1B1B1F       |
| focus-color        | Focus color of button                                     | #0EA5E9       |
| background-color   | Background color of button                                | #202127       |
| hover-color        | Background color when button is in hover state            | #0EA5E9       |
| active-color       | Background color when button is pressed down              | #2563EB       |
| toggle             | If true, button acts as toggle button with on/off state   | false         |
| toggle-state       | Setting the toggle button on/off state                    | false         |
| key                | Textual shortcut key that activates the widget (e.g. 'e') |               |
| key-code           | Legacy numeric shortcut key (e.g. 32 for Space)           | -1            |

| width              | Width of button                                           | 1             |
| height             | Height of button                                          | 1             |
| depth              | Depth of button                                           | 0.02          |
| base-depth         | Depth of the base of the button                           | 0.01          |
| gap                | Gap between button and base                               | 0.025         |
| margin             | Margin around button                                      | 0 0 0 0       |
| radius             | Corner radius of the button base                          | 0             |

| bevel              | If true, button bevel is enabled                          | false         |
| bevel-segments     | Segments of the button bevel                              | 5             |
| steps              | Steps of the button bevel                                 | 2             |
| bevel-size         | Size of the button bevel                                  | 0.1           |
| bevel-offset       | Offset of the button bevel                                | 0             |
| bevel-thickness    | Thickness of the button bevel                             | 0.1           |

```html
	<a-sxr-button
		width="2.5" 
		height="0.7" 
		base-depth="0.025" 
		depth="0.1"
		gap="0.1"

		onclick="buttonActionFunction" key-code="32"
		value="Sample Button"
		font-family="Outfit-Regular.woff2"
		font-size="0.25"
		margin="0 0 0.05 0"

		font-color="black"
		active-color="red"
		hover-color="yellow"
		border-color="white"
		focus-color="black"
		background-color="orange"

		bevel="true"
	>
	</a-sxr-button>
```

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

### a-sxr-icon-button Component
#### Properties

| Property           | Description                                               | Default Value |
| --------           | -------------------------------------------------------   | ------------- |
| on                 | Event that triggers onclick action                        | click         |

| font-color         | Text color for button label                               | #F1F5F9       |
| border-color       | Border color of button                                    | #1B1B1F       |
| background-color   | Background color of item                                  | #202127       |
| hover-color        | Background color when button is in hover state            | #0EA5E9       |
| active-color       | Background color when button is pressed down              | #2563EB       |
| icon               | SenangStart icon slug, e.g. `check`, `play`, `cog-6-tooth` | check         |
| icon-active        | Icon slug for the active state                            | ''            |
| icon-font          | Legacy option retained for compatibility                  | ''            |
| icon-font-size     | Icon size for button                                      | 0.4           |
| icon-occlusion     | Let scene geometry occlude the icon (opt-in depth test)   | false         |
| key                | Textual shortcut key that activates the widget (e.g. 'e') |               |
| key-code           | Legacy numeric shortcut key (e.g. 32 for Space)           | -1            |
| toggle             | Toggle status                                             | false         |
| toggle-state       | Setting the toggle button on/off state                    | false         |

| height             | Height of item                                            | 1             |
| width              | Width of item                                             | 1             |
| margin             | Margin around item                                        | 0 0 0 0       |

```html
<a-sxr-icon-button
	height="0.75"
	onclick="buttonActionFunction" key-code="32"
	icon="star"
	margin="0 0 0.05 0"
>
</a-sxr-icon-button>
```

### a-sxr-icon-label-button Component
#### Properties

| Property         | Description                                            | Default Value |
| --------         | ----------------------------------------------------   | ------------- |
| on               | Event that triggers onclick action                     | click         |

| icon              | SenangStart icon slug, e.g. `check`, `sparkles`        | check         |
| icon-active      | Icon slug for the active state                         | ''            |
| icon-font        | Legacy option retained for compatibility               | ''            |
| icon-font-size   | Icon size for button                                   | 0.35          |
| icon-occlusion   | Let scene geometry occlude the icon (opt-in depth test) | false        |
| key              | Textual shortcut key that activates the widget (e.g. 'e') |            |
| key-code         | Legacy numeric shortcut key (e.g. 32 for Space)        | -1            |

| font-color       | Text color for button label                            | #F1F5F9       |
| value            | Text of button label                                   | ''            |
| font-family      | Font family for button                                 | Outfit-Regular.ttf |
| font-size        | Font size for button                                   | 0.2           |
| border-color     | Border color of button                                 | #1B1B1F       |
| background-color | Background color of button                             | #202127       |
| hover-color      | Background color when button is in hover state         | #0EA5E9       |
| active-color     | Background color when button is pressed down           | #2563EB       |
| toggle           | Toggle status                                          | false         |
| toggle-state     | Setting the toggle button on/off state                 | false         |

| height           | Height of button                                       | 1             |
| width            | Width of button                                        | 1             |
| margin           | Margin around button                                   | 0 0 0 0       |

```html
<a-sxr-icon-label-button
	width="2.5" height="0.75"
	onclick="buttonActionFunction"
	icon="sparkles"
	value="icon label"
	font-family="Outfit-Regular.woff2"
	font-size="0.16"
	margin="0 0 0.05 0"
>
</a-sxr-icon-label-button>
```

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

#### Native text editing (opt-in)

By default the input is a canvas-rendered field updated programmatically
(`appendText()`, `delete()`, or the `value` attribute). Adding
`native-editing="true"` makes activation (click / keyboard activation) focus a
visually hidden, labelled native `<input>` kept in sync with the widget: typing, arrow-key
caret/selection movement, paste and IME composition all work with the real
keyboard, `input` events fire as the text changes, and `change` fires on
commit (`Enter` or losing focus), once per changed value. Setting
`native-editing="false"` commits any pending edit and removes the native field.

```html
<a-sxr-input width="2.8" height="0.5"
	native-editing="true"
	value="Type here"
	margin="0 0 0.05 0">
</a-sxr-input>
```

Immersive (VR) text entry remains application-provided; this opt-in targets
desktop keyboard use.


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


### a-sxr-radio Component
#### Properties

| Property         | Description                                               | Default Value  |
| --------         | -------------------------------------------------------   | -------------- |
| on               | Event that triggers onclick action                        | click          |
| checked          | Whether the radio is initially selected                   | false          |
| active           | Whether the radio is enabled                              | true           |
| group            | Group name; selecting one radio unchecks same-group radios | ''            |

| value            | Text of the radio button label                            | ''             |
| font-family      | Font family for radio button                              | Outfit-Regular.ttf |
| font-size        | Font size for radio button                                | 0.2            |
| font-color       | Text color for radio button label                         | #161618        |
| border-color     | Border color of radio button                              | #1B1B1F        |
| background-color | Background color of radio button                          | #F1F5F9        |
| hover-color      | Background color when radio button is in hover state      | #0EA5E9        |
| handle-color     | Color of the radio center handle                          | #202127        |
| active-color     | Background color when radio button is pressed down        | #2563EB        |
| radiosizecoef    | Scale factor for the radio circle size                    | 1              |

| key              | Textual shortcut key that activates the widget (e.g. 'e') |            |
| key-code         | Legacy numeric shortcut key (e.g. 32 for Space)        | -1            |
| width            | Width of radio button                                     | 1              |
| height           | Height of radio button                                    | 1              |
| margin           | Margin around radio button                                | 0 0 0 0        |

```html
<a-sxr-radio
	width="2.5" height="0.75"
	onclick="toggleActionFunction"
	value="radio label"
	font-size="0.3"
	margin="0 0 0.05 0"
>
</a-sxr-radio>
```


### a-sxr-slider Component
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
| height              | Height of item                                            | 1              |
| hover-color         | Handle color while hovering                               | #0EA5E9        |
| keyboard-step       | Percent added/removed per arrow-key press when focused    | 0.05           |
| key                 | Textual shortcut key that activates the widget (e.g. 'e') |                |
| key-code            | Legacy numeric shortcut key (e.g. 13 for Enter)           | -1             |
| left-right-padding  | Padding applied to the track width                        | 0.25           |
| margin              | Margin around item                                        | 0 0 0 0        |
| onclick             | Javascript function to execute on click                   |               |
| onhover             | Javascript function to execute on hover                   |               |
| percent             | Current slider value, from 0.0 to 1.0                     | 0.5            |
| slider-bar-depth    | Depth of the slider track                                 | 0.03           |
| slider-bar-height   | Height of the slider track                                | 0.05           |
| top-bottom-padding  | Padding applied to the track height                       | 0.125          |
| width               | Width of item                                             | 1              |

```html
<a-sxr-slider 	
	width="2.5" height="0.75"
	onclick="slideActionFunction"
	percent="0.29"
	margin="0 0 0.05 0"
>
</a-sxr-slider>
```


### a-sxr-toggle Component
#### Properties

| Property         | Description                                               | Default Value  |
| --------         | -------------------------------------------------------   | -------------- |
| on               | Event that triggers onclick action                        | click          |
| key              | Textual shortcut key that activates the widget (e.g. 'e') |                |
| key-code         | Legacy numeric shortcut key (e.g. 32 for Space)           | -1             |
| checked          | Whether the toggle is on                                  | false          |
| active           | Whether the toggle is enabled                             | true           |
| toggle           | Toggle status                                             | false          |
| toggle-state     | Setting the toggle toggle button on/off state             | false          |

| value            | Text of the toggle button label                           | ''             |
| font-family      | Font family for toggle button                             | Outfit-Regular.ttf |
| font-size        | Font size for toggle button                               | 0.2            |
| font-color       | Text color for toggle button label                        | #161618        |
| border-width     |                                                           | 1              |
| border-color     | Border color of toggle button                             | #1B1B1F        |
| background-color | Background color of toggle button                         | #F1F5F9        |
| hover-color      | Background color when toggle button is in hover state     | #0EA5E9        |
| handle-color     | Color of the toggle handle                                | #F1F5F9        |
| active-color     | Background color when toggle button is pressed down       | #2563EB        |

| height           | Height of toggle button                                   | 1              |
| width            | Width of toggle button                                    | 1              |
| margin           | Margin around toggle button                               | 0 0 0 0        |

```html
<a-sxr-toggle
	width="2.5" height="0.75"
	onclick="testToggleAction"
	value="toggle label"
	font-family="Outfit-Regular.woff2"
	font-size="0.2"
	margin="0 0 0.05 0"
>
</a-sxr-toggle>
```

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
