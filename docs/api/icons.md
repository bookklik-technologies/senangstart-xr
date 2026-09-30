# Icons

Icons come from the `@bookklik/senangstart-icons` package — **246 inline SVGs**
exposed on `SXR.icons`. Widgets reference them by slug string, for example
`icon="cog-6-tooth"`.

```js
SXR.icons['check']  // '<svg …>…</svg>'
```

Unknown slugs render a `?` fallback glyph instead of failing, so a typo degrades
gracefully rather than breaking the widget.

## Using icons in widgets

```html
<a-sxr-icon-button icon="star"></a-sxr-icon-button>
<a-sxr-icon-label-button icon="sparkles" value="Generate"></a-sxr-icon-label-button>
```

`icon-active` swaps the icon in the pressed state:

```html
<a-sxr-icon-button icon="play" icon-active="pause"></a-sxr-icon-button>
```

## Icon helpers

### `SXR.getIconSvg(icon, color?, thickness?)`

Returns the SVG string with every `currentColor` replaced by `color`, and
optionally `stroke-width` set to `thickness`. Returns `''` for an unknown slug.

```js
SXR.getIconSvg('star', '#2563EB')          // blue star SVG
SXR.getIconSvg('star', '#2563EB', '1.5')   // with a custom stroke width
```

### `SXR.getIconDataUrl(icon, color?, thickness?)`

Same, but returns a `data:image/svg+xml` URL usable directly as an image
`src` or a canvas texture source.

```js
const url = SXR.getIconDataUrl('play', '#F1F5F9')
new Image().src = url
```

### `SXR.createIconEntity(options)` / `SXR.redrawIconEntity(entity, options)`

Build and repaint an A-Frame entity that renders an icon on a canvas plane —
the same pipeline the icon widgets use. See
[SXR Namespace](/api/sxr-namespace#sxrcreateiconentityoptions).

## The full icon set

All 246 slugs, grouped for browsing. Copy one directly into an `icon`
attribute. The authoritative list is `Object.keys(SXR.icons)` at runtime — the
icon package may add slugs in future releases.

### Arrows (29)
`arrow-left` `arrow-right` `arrow-up` `arrow-down` `arrow-long-left`
`arrow-long-right` `arrow-long-up` `arrow-long-down` `arrow-path`
`arrow-rotate-cw` `arrow-rotate-ccw` `rotate-add` `rotate-minus`
`arrow-top-right-on-square` `arrow-right-on-rectangle`
`arrow-left-on-rectangle` `chevron-left` `chevron-right` `chevron-up`
`chevron-down` `chevron-double-left` `chevron-double-right`
`chevron-double-up` `chevron-double-down` `arrow-left-arrow-right`
`arrow-up-arrow-down` `arrow-left-right` `arrow-up-down`
`arrow-up-down-left-right`

### Media (17)
`play` `pause` `stop` `play-circle` `pause-circle` `stop-circle` `speaker-wave`
`speaker-x-mark` `microphone` `microphone-mute` `video-camera` `camera` `photo`
`panorama` `musical-note` `carousel` `reel`

### Communication (16)
`envelope` `envelope-open` `chat-bubble-left` `chat-bubble-right`
`chat-bubble-left-ellipsis` `chat-bubble-right-ellipsis`
`chat-bubble-left-right` `phone` `phone-x-mark` `user` `user-circle`
`user-plus` `user-minus` `user-group` `users` `chatbot`

### Status (14)
`x-mark` `check` `alert` `exclamation-circle` `exclamation-triangle`
`information-circle` `question-mark-circle` `bell` `bell-alert` `eye`
`eye-slash` `light-bulb` `clock` `time-reset`

### Files (18)
`save` `document` `document-text` `document-duplicate` `folder` `folder-open`
`folder-plus` `folder-minus` `clipboard` `clipboard-document-check`
`paper-clip` `archive-box` `inbox` `book-open` `book-close` `book-stacked`
`bookmark` `table`

### Commerce (11)
`shopping-cart` `shopping-bag` `basket` `credit-card` `banknotes`
`currency-dollar` `currency-euro` `currency-pound` `currency-yen`
`currency-ringgit` `qr-code`

### Calendar & presentation (9)
`calendar` `calendar-plus` `calendar-minus` `calendar-approve`
`calendar-reject` `calendar-days` `briefcase` `presentation-chart-line`
`presentation-media`

### Charts (3)
`chart-line` `chart-bar` `chart-pie`

### Devices (16)
`code` `console` `computer-laptop` `computer-code` `computer-desktop`
`device-phone-mobile` `device-tablet` `battery-0` `battery-10` `battery-50`
`battery-100` `controller` `game` `window` `wifi` `vr`

### Security (5)
`lock-closed` `lock-open` `key` `shield-check` `shield-exclamation`

### 3D shapes (20)
`container` `layer-stacks` `cube` `sphere` `cylinder` `tube` `cone` `pyramid`
`polygon` `torus` `plane` `wedge` `cylinder-half` `sphere-half`
`heart-extruded` `torus-knot` `tetrahedron` `octahedron` `icosahedron`
`dodecahedron`

### Nature & objects (20)
`bolt` `moon` `sun` `cloud` `star` `heart` `hand-thumb-up` `hand-thumb-down`
`hand` `hand-grab` `flag` `map` `map-pin` `globe-alt` `truck` `cake` `gift`
`trophy` `medal` `sparkles`

### Design (13)
`contrast` `gradient` `cursor` `marquee` `shapes` `square` `rectangle`
`draw-line` `draw-curve` `pencil` `brush` `eraser` `crop`

### Layout (11)
`horizontal-3-dots` `vertical-3-dots` `group-object` `ungroup-object`
`align-left-object` `align-center-object` `align-right-object`
`align-top-object` `align-middle-object` `align-bottom-object` `layout`

### Text (8)
`plus` `minus` `font` `text` `text-align-center` `text-align-left`
`text-align-right` `text-align-justify`

### Other (36)
`bars-3` `double-tick` `magnifying-glass` `magnifying-glass-focus`
`magnifying-glass-plus` `magnifying-glass-minus` `home` `cog-6-tooth` `trash`
`whiteboard` `tabs` `thunder` `ar` `flip-horizontal` `flip-vertical` `grid`
`tic-tac-toe` `robot` `maximize` `minimize` `compress` `expand` `focus`
`crosshair` `hourglass-0` `hourglass-50` `hourglass-80` `hourglass-100`
`roof` `magic-wand` `circle` `diamond` `hexagon` `scissor`
`sliders-horizontal` `sliders-vertical`
