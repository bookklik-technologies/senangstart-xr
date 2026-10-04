# Ikon {#icons}

Ikon berasal daripada pakej `@bookklik/senangstart-icons` — **246 SVG sebaris** didedahkan pada `SXR.icons`. Widget merujuknya melalui rentetan slug, contohnya `icon="cog-6-tooth"`.

```js
SXR.icons['check']  // '<svg …>…</svg>'
```

Slug yang tidak dikenali memaparkan glif gantian `?` dan tidak menyebabkan kegagalan, jadi kesilapan ejaan tidak merosakkan widget.

## Menggunakan ikon dalam widget {#using-icons-in-widgets}

```html
<a-sxr-icon-button icon="star"></a-sxr-icon-button>
<a-sxr-icon-label-button icon="sparkles" value="Generate"></a-sxr-icon-label-button>
```

`icon-active` menukar ikon dalam keadaan ditekan:

```html
<a-sxr-icon-button icon="play" icon-active="pause"></a-sxr-icon-button>
```

## Pembantu ikon {#icon-helpers}

### `SXR.getIconSvg(icon, color?, thickness?)` {#sxr-geticonsvg-icon-color-thickness}

Mengembalikan rentetan SVG dengan setiap `currentColor` diganti oleh `color`, dan pilihan `stroke-width` ditetapkan kepada `thickness`. Mengembalikan `''` bagi slug yang tidak dikenali.

```js
SXR.getIconSvg('star', '#2563EB')          // blue star SVG
SXR.getIconSvg('star', '#2563EB', '1.5')   // with a custom stroke width
```

### `SXR.getIconDataUrl(icon, color?, thickness?)` {#sxr-geticondataurl-icon-color-thickness}

Sama, tetapi mengembalikan URL `data:image/svg+xml` yang boleh terus digunakan sebagai `src` imej atau sumber tekstur kanvas.

```js
const url = SXR.getIconDataUrl('play', '#F1F5F9')
new Image().src = url
```

### `SXR.createIconEntity(options)` / `SXR.redrawIconEntity(entity, options)` {#sxr-createiconentity-options-sxr-redrawiconentity-entity-options}

Bina dan lukis semula entiti A-Frame yang memaparkan ikon pada satah kanvas — saluran sama yang digunakan oleh widget ikon. Lihat [Ruang Nama SXR](/ms/api/sxr-namespace#sxr-createiconentity-options).

## Set ikon penuh {#the-full-icon-set}

Kesemua 246 slug, dikumpulkan untuk dilayari. Salin terus ke dalam atribut `icon`. Senarai rujukan utama ialah `Object.keys(SXR.icons)` ketika masa jalan — pakej ikon mungkin menambah slug dalam keluaran akan datang.

### Anak panah (29) {#arrows-29}
`arrow-left` `arrow-right` `arrow-up` `arrow-down` `arrow-long-left`
`arrow-long-right` `arrow-long-up` `arrow-long-down` `arrow-path`
`arrow-rotate-cw` `arrow-rotate-ccw` `rotate-add` `rotate-minus`
`arrow-top-right-on-square` `arrow-right-on-rectangle`
`arrow-left-on-rectangle` `chevron-left` `chevron-right` `chevron-up`
`chevron-down` `chevron-double-left` `chevron-double-right`
`chevron-double-up` `chevron-double-down` `arrow-left-arrow-right`
`arrow-up-arrow-down` `arrow-left-right` `arrow-up-down`
`arrow-up-down-left-right`

### Media (17) {#media-17}
`play` `pause` `stop` `play-circle` `pause-circle` `stop-circle` `speaker-wave`
`speaker-x-mark` `microphone` `microphone-mute` `video-camera` `camera` `photo`
`panorama` `musical-note` `carousel` `reel`

### Komunikasi (16) {#communication-16}
`envelope` `envelope-open` `chat-bubble-left` `chat-bubble-right`
`chat-bubble-left-ellipsis` `chat-bubble-right-ellipsis`
`chat-bubble-left-right` `phone` `phone-x-mark` `user` `user-circle`
`user-plus` `user-minus` `user-group` `users` `chatbot`

### Status (14) {#status-14}
`x-mark` `check` `alert` `exclamation-circle` `exclamation-triangle`
`information-circle` `question-mark-circle` `bell` `bell-alert` `eye`
`eye-slash` `light-bulb` `clock` `time-reset`

### Fail (18) {#files-18}
`save` `document` `document-text` `document-duplicate` `folder` `folder-open`
`folder-plus` `folder-minus` `clipboard` `clipboard-document-check`
`paper-clip` `archive-box` `inbox` `book-open` `book-close` `book-stacked`
`bookmark` `table`

### Perdagangan (11) {#commerce-11}
`shopping-cart` `shopping-bag` `basket` `credit-card` `banknotes`
`currency-dollar` `currency-euro` `currency-pound` `currency-yen`
`currency-ringgit` `qr-code`

### Kalendar & pembentangan (9) {#calendar-presentation-9}
`calendar` `calendar-plus` `calendar-minus` `calendar-approve`
`calendar-reject` `calendar-days` `briefcase` `presentation-chart-line`
`presentation-media`

### Carta (3) {#charts-3}
`chart-line` `chart-bar` `chart-pie`

### Peranti (16) {#devices-16}
`code` `console` `computer-laptop` `computer-code` `computer-desktop`
`device-phone-mobile` `device-tablet` `battery-0` `battery-10` `battery-50`
`battery-100` `controller` `game` `window` `wifi` `vr`

### Keselamatan (5) {#security-5}
`lock-closed` `lock-open` `key` `shield-check` `shield-exclamation`

### Bentuk 3D (20) {#_3d-shapes-20}
`container` `layer-stacks` `cube` `sphere` `cylinder` `tube` `cone` `pyramid`
`polygon` `torus` `plane` `wedge` `cylinder-half` `sphere-half`
`heart-extruded` `torus-knot` `tetrahedron` `octahedron` `icosahedron`
`dodecahedron`

### Alam & objek (20) {#nature-objects-20}
`bolt` `moon` `sun` `cloud` `star` `heart` `hand-thumb-up` `hand-thumb-down`
`hand` `hand-grab` `flag` `map` `map-pin` `globe-alt` `truck` `cake` `gift`
`trophy` `medal` `sparkles`

### Reka bentuk (13) {#design-13}
`contrast` `gradient` `cursor` `marquee` `shapes` `square` `rectangle`
`draw-line` `draw-curve` `pencil` `brush` `eraser` `crop`

### Susun atur (11) {#layout-11}
`horizontal-3-dots` `vertical-3-dots` `group-object` `ungroup-object`
`align-left-object` `align-center-object` `align-right-object`
`align-top-object` `align-middle-object` `align-bottom-object` `layout`

### Teks (8) {#text-8}
`plus` `minus` `font` `text` `text-align-center` `text-align-left`
`text-align-right` `text-align-justify`

### Lain-lain (36) {#other-36}
`bars-3` `double-tick` `magnifying-glass` `magnifying-glass-focus`
`magnifying-glass-plus` `magnifying-glass-minus` `home` `cog-6-tooth` `trash`
`whiteboard` `tabs` `thunder` `ar` `flip-horizontal` `flip-vertical` `grid`
`tic-tac-toe` `robot` `maximize` `minimize` `compress` `expand` `focus`
`crosshair` `hourglass-0` `hourglass-50` `hourglass-80` `hourglass-100`
`roof` `magic-wand` `circle` `diamond` `hexagon` `scissor`
`sliders-horizontal` `sliders-vertical`
