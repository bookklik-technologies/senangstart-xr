# SenangStart XR

**3D GUI components for [A-Frame](https://aframe.io) / WebXR.**

SenangStart XR provides layout and GUI widgets for building a user interface
inside an A-Frame scene — buttons, icon buttons, toggles, radios, sliders,
inputs, labels, progress meters and a flexbox-inspired layout container, each
available as an `a-sxr-*` HTML primitive.

## 📖 Documentation

**Full documentation: <https://bookklik-technologies.github.io/senangstart-xr/>**

The docs site is the canonical reference for every component, property and
default value. It covers:

- **Guide** — installation, layout, interaction, styling, accessibility
- **Components** — one page per widget, with property tables, live demos and examples
- **API** — the `window.SXR` namespace, colors, fonts and the icon set
- **Advanced** — live attribute updates, occlusion, build & CI

## Quick start

```bash
npm install @bookklik/senangstart-xr
```

```html
<script src="https://aframe.io/releases/1.8.0/aframe.min.js"></script>
<script src="node_modules/@bookklik/senangstart-xr/dist/senangstart-xr.min.js"></script>
```

```html
<a-scene>
  <a-sxr-flex-container flex-direction="column" justify-content="center"
                        align-items="center" item-padding="0.1" opacity="1"
                        width="3" height="2" position="0 1.6 -2">
    <a-sxr-button width="2" height="0.6" value="Hello XR"
                  onclick="handleClick"></a-sxr-button>
  </a-sxr-flex-container>
</a-scene>
```

Run the bundled showcase to see the widgets in action:

```bash
npm start   # http://localhost:8080
```

## Components

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

Property tables for each component live in the
[Components reference](https://bookklik-technologies.github.io/senangstart-xr/components/),
and are kept honest against the code by a docs-drift test in CI.

## A-Frame version support

Supported A-Frame versions are **1.7.x and 1.8.x** (peer dependency
`>=1.7.0 <1.9.0`), validated against 1.7.0, 1.7.1 and 1.8.0.

## Development

```bash
npm install
npm start           # webpack-dev-server on :8080 serving examples/
npm test            # 14 suites / 108 tests
npm run lint        # zero warnings tolerated
npm run dist        # build bundles + font to dist/
npm run docs:dev    # VitePress documentation site
npm run docs:build  # build the docs site
```

See the [Build & CI guide](https://bookklik-technologies.github.io/senangstart-xr/advanced/build-and-ci)
for the full script reference and CI pipeline.

## License

[MIT](LICENSE) © Bookklik Technologies
