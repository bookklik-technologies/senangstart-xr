# Kemas Kini Atribut Secara Langsung {#live-attribute-updates}

Atribut widget boleh diubah **selepas permulaan** — melalui `setAttribute` atau atribut primitif yang dipetakan. Perkara berikut dikemas kini secara langsung tanpa mencipta semula widget.

## Perkara yang dikemas kini secara langsung {#what-updates-live}

| Kategori | Sifat | Tingkah laku |
| --- | --- | --- |
| Dimensi | `width`, `height`, `depth`, `base-depth`, `gap`, `radius`, `margin` | Geometri, bar, sempadan dan kotak label dibina semula agar muat |
| Warna | `font-color`, `border-color`, `background-color`, `hover-color`, `active-color`, `handle-color`, `focus-color` | Warna asal dan label dikemas kini; animasi yang sedang berjalan diteruskan dengan nilai baharu |
| Label | `value` pada butang, suis, radio, label dan input | Teks dilukis semula pada tempatnya; `aria-label` kekal disegerakkan |
| Peristiwa pengaktifan | `on` | Pendengar pengaktifan diikat semula kepada nama peristiwa baharu |
| Keadaan | `checked`, `percent`, `loaded`, `count-down`, `hover-percent` | Paparan serta `aria-checked` / `aria-valuenow` mengikut nilai |
| Susun atur | Sifat bekas flex pada `a-sxr-flex-container` | Susun atur anak dikemas kini, termasuk selepas penyisipan dan penyingkiran anak melalui atur cara |
| Ikon | `icon`, `icon-active` | Ikon dilukis semula pada tempatnya |

## Penggunaan asas {#basic-usage}

```js
const button = document.querySelector('a-sxr-button')

button.setAttribute('value', 'Now playing')   // label redraws
button.setAttribute('font-color', '#10B981')  // color refreshes
button.setAttribute('width', '3')             // geometry rebuilds
```

## Cara ia berfungsi {#how-it-works}

Komponen melanggan peristiwa `componentchanged` A-Frame. Pembantu [`SXR.watchGuiItem`](/ms/api/sxr-namespace#sxr-watchguiitem-el-callback) menapis aliran tersebut untuk perubahan `sxr-item` dan menyerahkan data baharu kepada komponen pemilik, yang hanya membina semula bahagian terjejas:

```js
init() {
  this._watch = SXR.watchGuiItem(this.el, (item) => this.rebuild(item))
},
remove() {
  this.el.removeEventListener('componentchanged', this._watch)
}
```

Kemas kini teks dan ikon menggunakan lebih sedikit sumber: `SXR.redrawTextEntity` dan `SXR.redrawIconEntity` menggunakan semula kanvas, tekstur dan geometri sedia ada, jadi lukisan semula label tidak memperuntukkan sumber GPU baharu.

## Perubahan anak melalui atur cara {#programmatic-child-changes}

Bekas flex memerhatikan anaknya dengan `MutationObserver` dan debounce, jadi penambahan atau penyingkiran widget menyusun semula panel:

```js
const panel = document.querySelector('a-sxr-flex-container')
const row = document.createElement('a-sxr-button')
row.setAttribute('value', 'New')
panel.appendChild(row)     // panel relayouts
row.remove()               // panel relayouts
```

## Tandatangan panggil balik semasa kemas kini {#callback-signatures-on-update}

Panggil balik peluncur mendatar menerima `(event, percent)`. Panggil balik peluncur menegak menerima `(percent)` untuk **kedua-dua** pengaktifan penuding dan papan kekunci.

## Pelupusan {#disposal}

Apabila menyingkirkan widget, gunakan [`SXR.removeEntity`](/ms/api/sxr-namespace#sxr-removeentity-entity) menggantikan `parentNode.removeChild(el)` supaya tekstur kanvas, bahan dan geometri dilupuskan tanpa kebocoran:

```js
SXR.removeEntity(widget)
```
