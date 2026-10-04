# Komponen {#components}

Berkas `dist/senangstart-xr.js` mentakrifkan komponen berikut dan primitif HTML yang sepadan.

| Komponen | Primitif | Penerangan |
| --------------------  | ------------------------ | -------------------------------------------------------  |
| sxr-flex-container    | a-sxr-flex-container     | Bekas susun atur yang diilhamkan oleh flexbox |
| sxr-item              | `<none>`                 | Digunakan oleh komponen lain untuk sifat umum seperti tinggi dan lebar |
| sxr-interactable      | `<none>`                 | Digunakan oleh komponen lain untuk menentukan tingkah laku onclick |
| sxr-cursor            | a-sxr-cursor             | Kursor untuk berinteraksi dengan elemen GUI. |
| sxr-button            | a-sxr-button             | Komponen butang standard dengan label teks |
| sxr-icon-button       | a-sxr-icon-button        | Butang dengan label ikon menggantikan teks |
| sxr-icon-label-button | a-sxr-icon-label-button  | Butang dengan label ikon dan teks |
| sxr-radio             | a-sxr-radio              | Butang radio |
| sxr-toggle            | a-sxr-toggle             | Butang suis |
| sxr-slider            | a-sxr-slider             | Komponen peluncur |
| sxr-vertical-slider   | a-sxr-vertical-slider    | Komponen peluncur menegak |
| sxr-input             | a-sxr-input              | Medan input teks |
| sxr-label             | a-sxr-label              | Label teks |
| sxr-progress-bar      | a-sxr-progressbar        | Bar kemajuan |
| sxr-circle-loader     | a-sxr-circle-loader      | Penunjuk kemajuan bulatan |
| sxr-circle-timer      | a-sxr-circle-timer       | Penunjuk kemajuan bulatan dengan pemasa |

Dua komponen tambahan menyokong widget tetapi juga berguna secara berasingan: [`sxr-item`](/ms/components/item) (dimensi bersama) dan [`rounded`](/ms/components/rounded) (geometri panel berbucu bulat).

## Rujukan komponen {#component-reference}

### Asas {#basics}
- [Bekas Flex](/ms/components/flex-container)
- [Label](/ms/components/label)
- [Kursor](/ms/components/cursor)

### Butang & suis {#buttons-toggles}
- [Butang](/ms/components/button)
- [Butang Ikon](/ms/components/icon-button)
- [Butang Ikon dan Label](/ms/components/icon-label-button)
- [Suis](/ms/components/toggle)
- [Butang Radio](/ms/components/radio)

### Nilai & kemajuan {#values-progress}
- [Peluncur](/ms/components/slider)
- [Peluncur Menegak](/ms/components/vertical-slider)
- [Input](/ms/components/input)
- [Bar Kemajuan](/ms/components/progress-bar)
- [Penunjuk Kemajuan Bulatan](/ms/components/circle-loader)
- [Pemasa Bulatan](/ms/components/circle-timer)

### Blok binaan {#building-blocks}
- [Item & Interaksi](/ms/components/item)
- [Panel Berbucu Bulat](/ms/components/rounded)

## Sifat umum {#common-properties}

Kebanyakan widget berkongsi sifat daripada `sxr-item` (saiz, kedalaman, margin, serong) dan `sxr-interactable` (panggil balik, pintasan papan kekunci). Halaman yang menyokongnya menyenaraikannya secara berasingan; lihat [Item & Interaksi](/ms/components/item) untuk skema penuh.

## Penamaan primitif {#primitive-naming}

Setiap primitif memetakan atribut HTML kebab-case kepada sifat komponen:

```html
<a-sxr-icon-label-button icon-active="play" font-size="0.16"></a-sxr-icon-label-button>
<!-- maps to sxr-icon-label-button.iconActive and .fontSize -->
```

Oleh sebab primitif ini ialah primitif A-Frame biasa, atribut juga boleh ditetapkan melalui atur cara dengan `setAttribute` — lihat [Kemas Kini Atribut Secara Langsung](/ms/advanced/live-updates).
