# Components

The `dist/senangstart-xr.js` bundle defines the following components and their
matching HTML primitives.

| Component             | Primitive                | Description |
| --------------------  | ------------------------ | -------------------------------------------------------  |
| sxr-flex-container    | a-sxr-flex-container     | Layout container with flexbox-inspired layout                           |
| sxr-item              | `<none>`                 | Used by other components for common properties like height and width    |
| sxr-interactable      | `<none>`                 | Used by other components to define onclick behavior      |
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

Two further components back the widgets but are useful on their own:
[`sxr-item`](/components/item) (shared dimensions) and
[`rounded`](/components/rounded) (rounded panel geometry).

## Component reference

### Basics
- [Flex Container](/components/flex-container)
- [Label](/components/label)
- [Cursor](/components/cursor)

### Buttons & toggles
- [Button](/components/button)
- [Icon Button](/components/icon-button)
- [Icon Label Button](/components/icon-label-button)
- [Toggle](/components/toggle)
- [Radio](/components/radio)

### Values & progress
- [Slider](/components/slider)
- [Vertical Slider](/components/vertical-slider)
- [Input](/components/input)
- [Progress Bar](/components/progress-bar)
- [Circle Loader](/components/circle-loader)
- [Circle Timer](/components/circle-timer)

### Building blocks
- [Item & Interactable](/components/item)
- [Rounded Panel](/components/rounded)

## Common properties

Most widgets share a set of properties contributed by `sxr-item` (size, depth,
margin, bevel) and `sxr-interactable` (callbacks, keyboard shortcuts). Pages
that support them list them individually; see [Item & Interactable](/components/item)
for the full schema.

## Primitive naming

Every primitive maps kebab-case HTML attributes onto component properties:

```html
<a-sxr-icon-label-button icon-active="play" font-size="0.16"></a-sxr-icon-label-button>
<!-- maps to sxr-icon-label-button.iconActive and .fontSize -->
```

Because they are ordinary A-Frame primitives, attributes can also be set
programmatically with `setAttribute` — see
[Live Attribute Updates](/advanced/live-updates).
