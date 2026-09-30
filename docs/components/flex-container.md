# Flex Container

The layout container arranges child widgets inside a 3D panel.

::: warning `opacity` default
The default `opacity` is `0.0` — a container is invisible until you set it.
:::

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

## Style inheritance

The last seven properties form a theme scope inherited by child widgets that
do not declare their own value. See [Layout](/guide/layout) for the full
inheritance and legacy-object rules.

## Relayout

Children relayout automatically after insertion, removal, resize or any other
layout change.
