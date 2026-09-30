# Colors

The brand palette is available as `window.SXR.colors` at runtime, and is used as
the default value of every widget's color properties.

## Palette

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

::: tip Legacy aliases
The `key_*` aliases are kept for backwards compatibility with older scenes.
New work should use the semantic token names.
:::

## Runtime access

```js
SXR.colors.primary   // '#2563EB'
SXR.colors.secondary // '#0EA5E9'
SXR.colors.surface   // '#202127'
```

The `SXR.colors` object is the source of truth for `primary`, `secondary`,
`darkBase`, `darkDeeper`, `darkCard`, `background`, `surface`, `onSurface`,
`border` and `neutral`. The remaining design tokens (`success`, `warning`,
`error`, `accent`, `slate100`, `primaryGradient`) are documented brand values
used by scenes and the docs site — the widgets default to the semantic subset.

## Color properties by widget

Each widget exposes its own color properties. The defaults come from the
palette:

| Property | Typical default | Used by |
| --- | --- | --- |
| `font-color` | `#F1F5F9` | label, button, icon button, container |
| `background-color` | `#202127` | most widgets |
| `border-color` | `#1B1B1F` | most widgets |
| `hover-color` | `#0EA5E9` | most interactive widgets |
| `active-color` | `#2563EB` | most interactive widgets |
| `handle-color` | `#F1F5F9` | slider, toggle, radio |
| `panel-color` | `#202127` | flex container panel |
| `focus-color` | `#0EA5E9` | button |

## Normalizing user input

`SXR.getValidColor` guards against unset color attributes — empty strings,
`undefined` and the literal strings `'undefined'` / `'null'` all fall back to a
safe value:

```js
SXR.getValidColor('')                 // '#F1F5F9'  (colors.onSurface)
SXR.getValidColor('null')             // '#F1F5F9'
SXR.getValidColor('', '#10B981')      // '#10B981'  (your fallback)
```

## Live updates

Color attributes are live-updatable — changing them refreshes resting and
label colors in place, and in-flight animations continue with the new values.
See [Live Attribute Updates](/advanced/live-updates).
