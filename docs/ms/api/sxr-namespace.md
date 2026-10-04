# Ruang Nama SXR {#sxr-namespace}

Memuatkan berkas mencipta ruang nama global `window.SXR` dengan token reka bentuk, daftar fon, pembantu ikon, pemapar teks/ikon kanvas dan utiliti papan kekunci yang menjadi asas widget. Kebanyakan adegan tidak memerlukannya secara langsung, tetapi ia ialah antara muka peluasan yang disokong untuk komponen tersuai.

::: warning Medan dalaman
Entiti yang dicipta oleh `createTextEntity` dan `createIconEntity` mendedahkan medan bergaris bawah (`_sxrTextState`, `_sxrIconState`, `_sxrDisposed`, …). Ini ialah butiran pelaksanaan, bukan API stabil — bacanya hanya apabila fungsi terdokumen di bawah tidak mencukupi.
:::

## Warna {#colors}

### `SXR.colors` {#sxr-colors}

Palet jenama, turut disenaraikan dalam [Warna](/ms/api/colors).

```js
SXR.colors.primary   // '#2563EB'
SXR.colors.surface   // '#202127'
```

### `SXR.getValidColor(color, fallback?)` {#sxr-getvalidcolor-color-fallback}

Menormalkan nilai warna, menggantikan rentetan kosong, `'undefined'` dan `'null'` dengan `SXR.colors.onSurface` (atau `fallback`).

```js
SXR.getValidColor('')          // '#F1F5F9'
SXR.getValidColor(undefined)   // '#F1F5F9'
```

## Fon {#fonts}

Lihat [API Fon](/ms/api/fonts) penuh.

| Fungsi | Tujuan |
| --- | --- |
| `SXR.registerFontFile(fontFile)` | Daftarkan fail fon melalui FontFace API; mengembalikan Promise bagi nama keluarga fon |
| `SXR.onFontResolved(fontFile, callback)` | Bariskan panggil balik setelah fon selesai dimuatkan; mengembalikan `true` jika dibariskan |
| `SXR.getCanvasFontFamily(fontFamily)` | Tentukan keluarga fon yang boleh digunakan oleh kanvas daripada argumen fon |
| `SXR.normalizeFontSize(fontSize, fallback?)` | Huraikan saiz fon, menggunakan nilai gantian apabila tidak sah |
| `SXR.getTextWidth(text, font)` | Ukur lebar teks pada konteks kanvas bersama |
| `SXR.fonts` | Daftar fon (`default`, `registered`, `pending`, `redrawQueue`) |
| `SXR.bundleBaseUrl` | URL asas berkas yang sedang berjalan, digunakan untuk menentukan fon lalai |

## Ikon {#icons}

Lihat [API Ikon](/ms/api/icons) penuh.

| Fungsi | Tujuan |
| --- | --- |
| `SXR.icons` | Peta slug → rentetan SVG sebaris (246 ikon) |
| `SXR.getIconSvg(icon, color?, thickness?)` | Rentetan SVG dengan `currentColor` diganti dan lebar strok pilihan |
| `SXR.getIconDataUrl(icon, color?, thickness?)` | URL `data:image/svg+xml` yang boleh digunakan sebagai sumber imej |
| `SXR.createIconEntity(options)` | Bina entiti A-Frame yang memaparkan ikon |
| `SXR.redrawIconEntity(entity, options)` | Lukis semula entiti ikon pada tempatnya |

## Pemaparan teks {#text-rendering}

| Fungsi | Tujuan |
| --- | --- |
| `SXR.createTextEntity(options)` | Bina entiti A-Frame yang memaparkan teks kanvas berbalut |
| `SXR.redrawTextEntity(entity, options)` | Lukis semula entiti teks pada tempatnya dengan menggunakan semula kanvas, tekstur dan geometri |
| `SXR.createTextState(options)` | Cipta keadaan kanvas + konteks 2D yang kekal |
| `SXR.drawTextToState(state, options)` | Jalankan algoritma penyesuaian/susun atur dan lukis ke dalam keadaan |
| `SXR.computeTextCanvasSize(width, height, pixelRatio)` | Dimensi kanvas kuasa dua, dihadkan |

### `SXR.createTextEntity(options)` {#sxr-createtextentity-options}

Mengembalikan `a-entity` baharu dengan satah bertekstur kanvas. Pilihan yang dikenali:

| Pilihan | Lalai | Tujuan |
| --- | --- | --- |
| `value` | `''` | Teks untuk dipaparkan |
| `width` | `1` | Lebar satah dalam unit dunia |
| `height` | `0.25` | Tinggi satah dalam unit dunia |
| `color` | `SXR.colors.onSurface` | Warna isian |
| `fontSize` | `min(0.2, height * 0.7)` | Saiz fon yang diminta dalam unit dunia |
| `fontFamily` | system stack | Nama keluarga fon atau nama fail fon |
| `fontWeight` | `'600'` | Ketebalan fon CSS |
| `lineHeight` | `fontSize * 1.25` | Tinggi baris dalam unit dunia |
| `align` | `'center'` | `left`, `center` atau `right` |
| `strokeColor` | `'transparent'` | Warna strok kanvas |
| `strokeWidth` | `0` | Lebar strok kanvas |
| `pixelRatio` | `128` | Pengganda resolusi kanvas |
| `depthTest` | `false` | Benarkan geometri adegan melindungi teks |

Jika `fontFamily` menamakan fail fon yang masih dimuatkan, entiti mendaftarkan lukisan semula melalui `SXR.onFontResolved` supaya ia dilukis semula dengan fon sebenar apabila tersedia.

```js
const el = SXR.createTextEntity({
  value: 'Hello XR',
  width: 1.5,
  height: 0.3,
  color: SXR.colors.onSurface
})
sceneEl.appendChild(el)
```

### Algoritma penyesuaian {#fitting-algorithm}

`drawTextToState` membalut teks pada sempadan perkataan, dan apabila hasilnya melimpah daripada kotak, ia **mencari saiz fon lebih kecil melalui carian binari** (minimum 12px) sehingga teks muat pada lebar dan tinggi. Inilah sebab label panjang mengecil dan tidak terpotong.

### `SXR.redrawTextEntity(entity, options)` {#sxr-redrawtextentity-entity-options}

Melukis semula entiti teks sedia ada pada tempatnya, menggunakan semula kanvas, tekstur dan geometrinya. Mengembalikan `true` apabila lukisan semula berlaku, atau `false` apabila saiz kotak berubah — dalam keadaan itu pemanggil patut mencipta semula entiti.

### `SXR.createIconEntity(options)` {#sxr-createiconentity-options}

Mengembalikan `a-entity` baharu dengan satah bertekstur kanvas yang memaparkan ikon. SVG dilukis melalui `Image` tak segerak, jadi berikan `onLoad` untuk dimaklumkan apabila piksel tersedia.

| Pilihan | Lalai | Tujuan |
| --- | --- | --- |
| `icon` | `''` | Slug ikon |
| `width` | `options.size` or `0.25` | Lebar dalam unit dunia |
| `height` | `options.size` or `width` | Tinggi dalam unit dunia (segi empat sama secara lalai) |
| `size` | `0.25` | Singkatan untuk lebar + tinggi |
| `color` | `SXR.colors.onSurface` | Warna ikon |
| `thickness` | `null` | Gantikan `stroke-width` SVG |
| `scale` | `0.78` | Bahagian kanvas yang diduduki ikon |
| `pixelRatio` | `768` | Pengganda resolusi kanvas |
| `depthTest` | `false` | Benarkan geometri adegan melindungi ikon |
| `onLoad` | `null` | Panggil balik dipanggil dengan entiti setelah dilukis |

Slug yang tidak dikenali melukis glif gantian `?` dan tidak menyebabkan kegagalan.

```js
const icon = SXR.createIconEntity({
  icon: 'cog-6-tooth',
  size: 0.4,
  color: SXR.colors.secondary,
  onLoad: (el) => container.appendChild(el)
})
```

`SXR.redrawIconEntity(entity, options)` menjadualkan semula lukisan pada tempatnya, menerima `icon`, `color`, `thickness`, `scale` dan `depthTest`. Ia mengembalikan `false` apabila saiz kotak berubah dan entiti patut dicipta semula.

## Item dan susun atur {#items-and-layout}

### `SXR.getItem(el)` {#sxr-getitem-el}

Membaca data `sxr-item` bagi elemen widget. Apabila widget diletakkan pada entiti biasa — atau primitif yang `sxr-item` belum dihuraikan — ia mengembalikan nilai lalai yang didokumenkan, jadi permulaan widget kekal selamat di mana-mana.

```js
const item = SXR.getItem(el)
item.width   // 1
item.margin  // {x: 0, y: 0, z: 0, w: 0}
```

### `SXR.watchGuiItem(el, callback)` {#sxr-watchguiitem-el-callback}

Melanggan peristiwa `componentchanged` bagi `sxr-item` pada `el` dan memanggil balik dengan data baharu apabila dimensi berubah. Mengembalikan pengendali supaya komponen pemilik boleh menanggalkannya dalam `remove()`.

```js
init() {
  this._watch = SXR.watchGuiItem(this.el, (item) => this.rebuild(item))
},
remove() {
  this.el.removeEventListener('componentchanged', this._watch)
}
```

## Tindakan dan panggil balik {#actions-and-callbacks}

### `SXR.getActionFunction(name)` {#sxr-getactionfunction-name}

Mencari panggil balik yang diisytiharkan sebagai nama fungsi global (contohnya `onclick="myFunction"`) pada `window` **apabila peristiwa berlaku**. Mengembalikan fungsi, atau `null` apabila nama kosong, tidak dikenali atau tidak boleh dipanggil.

```js
SXR.getActionFunction('myFunction')  // the function, or null
```

Oleh sebab pencarian berlaku pada setiap peristiwa, anda boleh mentakrifkan semula pengendali global ketika masa jalan dan widget menggunakannya serta-merta.

## Pembantu papan kekunci {#keyboard-helpers}

`SXR.keyboard` menyimpan predikat yang dikongsi widget. Predikat ini menjadikan pintasan selamat ketika pengguna menaip.

| Fungsi | Tujuan |
| --- | --- |
| `SXR.keyboard.isEditableTarget(target)` | Benar untuk `input`, `textarea`, `select` dan contenteditable |
| `SXR.keyboard.isActivationPress(event)` | Benar untuk `Enter` / `Space` yang bukan ulangan dan bukan semasa komposisi |
| `SXR.keyboard.isActivationKey(key)` | Benar untuk `'Enter'`, `' '`, `'Spacebar'` |
| `SXR.keyboard.isArrowKey(key)` | Benar untuk keempat-empat kekunci anak panah |

```js
SXR.keyboard.isEditableTarget(document.activeElement)  // gate your own shortcuts
```

## Identiti dan pelupusan {#identity-and-disposal}

### `SXR.getUniqueId(prefix)` {#sxr-getuniqueid-prefix}

Mengembalikan ID yang tahan pertembungan dalam bentuk `prefix_<counter>_<random>`.

### `SXR.removeEntity(entity)` {#sxr-removeentity-entity}

Menyingkirkan entiti **dan melupuskan sumber GPU-nya** — tekstur teks/ikon, bahan dan geometri — secara rekursif ke dalam anak. Ia menetapkan tanda `_sxrDisposed` terlebih dahulu supaya panggil balik tak segerak tertunda (pemuatan imej ikon, lukisan semula fon) mengabaikan entiti tanpa menyentuh sumber yang sudah dilupuskan.

Gunakannya menggantikan `el.parentNode.removeChild(el)` untuk widget, jika tidak tekstur kanvas akan bocor.

## Ringkasan rujukan penuh {#full-reference-summary}

| Ahli | Jenis | Ringkasan |
| --- | --- | --- |
| `colors` | object | Palet jenama |
| `fonts` | object | Daftar fon dan baris gilir lukis semula |
| `icons` | object | Peta slug → SVG |
| `bundleBaseUrl` | string | URL asas berkas yang sedang berjalan |
| `getValidColor` | function | Normalkan warna dengan nilai gantian |
| `registerFontFile` | function | Muatkan dan daftarkan fail fon |
| `onFontResolved` | function | Bariskan panggil balik setelah fon selesai dimuatkan |
| `getCanvasFontFamily` | function | Tentukan fon untuk kanvas daripada argumen fon |
| `normalizeFontSize` | function | Huraikan saiz fon dengan nilai gantian |
| `getTextWidth` | function | Ukur teks pada kanvas bersama |
| `getIconSvg` | function | Rentetan SVG berwarna |
| `getIconDataUrl` | function | URL data SVG berwarna |
| `getUniqueId` | function | ID yang tahan pertembungan |
| `getItem` | function | Baca data `sxr-item` dengan nilai lalai |
| `watchGuiItem` | function | Perhatikan perubahan `sxr-item` |
| `getActionFunction` | function | Tentukan fungsi daripada nama panggil balik global |
| `removeEntity` | function | Singkirkan entiti dan lupuskan sumber GPU |
| `keyboard` | object | Predikat keselamatan menaip |
| `computeTextCanvasSize` | function | Dimensi kanvas kuasa dua |
| `createTextState` | function | Bina keadaan kanvas + konteks |
| `drawTextToState` | function | Sesuaikan dan lukis teks ke dalam keadaan |
| `createTextEntity` | function | Bina entiti teks |
| `redrawTextEntity` | function | Lukis semula entiti teks pada tempatnya |
| `createIconEntity` | function | Bina entiti ikon |
| `redrawIconEntity` | function | Lukis semula entiti ikon pada tempatnya |
