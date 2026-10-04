# Gaya & Fon {#styling-fonts}

## Warna jenama {#brand-colors}

SenangStart XR menyertakan sistem reka bentuk slate/biru. Token ini ialah nilai lalai yang digunakan oleh setiap widget dan juga tersedia melalui atur cara menerusi [`SXR.colors`](/ms/api/colors).

| Token | Nilai | Alias lama |
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

::: tip Alias lama
Alias `key_*` dikekalkan untuk keserasian dengan adegan terdahulu. Kerja baharu patut menggunakan nama token semantik.
:::

## Tema dengan bekas flex {#theming-with-the-flex-container}

Cara terpantas untuk mengubah gaya panel ialah menetapkan sifat gaya pada [`a-sxr-flex-container`](/ms/guide/layout) — anak mewarisinya:

```html
<a-sxr-flex-container
  font-family="Outfit-Regular.ttf"
  font-color="#F1F5F9"
  border-color="#1B1B1F"
  background-color="#202127"
  hover-color="#0EA5E9"
  active-color="#2563EB"
  handle-color="#F1F5F9"
  opacity="1" width="4" height="3">
  <!-- inherits the palette above -->
</a-sxr-flex-container>
```

Widget individu menggantikan nilai warisan dengan menetapkan nilainya sendiri.

## Permukaan kaca {#glass-surfaces}

Pameran komponen menggunakan tema kaca lut sinar dengan siluet berbucu bulat, sorotan lembut, tepi terang dan persekitaran biru-ungu. Komponen `sxr-glass` yang boleh digunakan semula ialah pilihan; nilai lalai widget sedia ada kekal.

```html
<a-rounded width="3.5" height="4.75" radius="0.26" color="#7C91B8"
  sxr-glass="opacity: 0.26; frost: 0.13; radius: 0.26; edge: 0.009">
</a-rounded>
```

| Sifat | Lalai | Tujuan |
| -------- | ------- | ------- |
| `opacity` | `0.38` | Kelegapan permukaan, dihadkan kepada 0–1. |
| `frost` | `0.16` | Rona pucat yang dicampurkan ke dalam permukaan, dihadkan kepada 0–1. |
| `radius` | `0.12` | Jejari siluet berbucu bulat dalam unit dunia. |
| `edge` | `0.012` | Lebar sorotan tepi dalam unit dunia. |
| `axis` | `xy` | Satah permukaan setempat; gunakan `xz` untuk permukaan silinder. |

Gunakan `sxr-glass` pada entiti yang memiliki mesh permukaan. Permukaan bekas flex teratas ialah `components['sxr-flex-container'].panelBackground`; muka butang ialah `components['sxr-button'].buttonEntity`. Contohnya, selepas pemuatan:

```js
const button = document.querySelector('a-sxr-button');
button.components['sxr-button'].buttonEntity.setAttribute('sxr-glass', {
  opacity: 0.55, frost: 0.12, radius: 0.12
});
```

Gaya ini mengekalkan warna dan animasi bahan sedia ada, bertindak balas terhadap perubahan geometri dan memulihkan tetapan bahan asal apabila disingkirkan. Ia menggayakan satu bahan flat atau standard tanpa tekstur pada satu masa; ia tidak menggayakan keturunan atau teks dan ikon bertekstur. Gunakannya semula pada entiti gantian jika widget membina semula permukaan miliknya (tema pameran melakukannya secara automatik).

Ini ialah penghampiran ringan kaca kabur dalam WebGL, menggunakan ketelusan dan pantulan prosedural menggantikan kabur ruang skrin atau pembiasan fizikal. Latar berbayang lembut menjadikan kesan lut sinar kelihatan pada desktop dan XR.

## Fon teks {#text-font}

Keluarga fon lalai ialah `Outfit-Regular.ttf` (`SXR.fonts.default`), yang **disertakan dalam tarball npm** dan ditentukan relatif kepada URL skrip berkas.

Apabila **nama fail** fon (`*.ttf` / `*.otf` / `*.woff` / `*.woff2`) diberikan, pemapar kanvas mendaftarkannya melalui FontFace API. Pemuatan serentak fail sama dikongsi, dan teks yang telah dipaparkan semasa fon dimuatkan dilukis semula secara automatik setelah fon selesai dimuatkan.

Semasa fon dimuatkan — atau apabila FontFace tidak tersedia — teks dipaparkan dengan susunan fon sistem (`Arial, Helvetica, sans-serif`).

### Menggunakan fon tersuai {#using-a-custom-font}

Dua pilihan:

1. **Berikan nama fail fon** — pustaka mendaftarkannya untuk anda. Fail fon tersuai ditentukan relatif kepada URL halaman.
2. **Berikan nama keluarga fon** yang sudah tersedia kepada konteks kanvas 2D (cth. `font-family="Arial"`).

```html
<a-sxr-label value="Custom type" font-family="Arial"></a-sxr-label>
```

Binaan menyalin `Outfit-Regular.ttf` di sebelah setiap berkas dalam `dist/` dan `examples/js/`; fon sumber kekal pada akar repositori. Lihat [API Fon](/ms/api/fonts) untuk API melalui atur cara.

## Saiz fon {#font-sizing}

`font-size` dinyatakan dalam **unit dunia A-Frame**, bukan piksel. Pemapar teks menyesuaikannya secara automatik dengan kotak widget: ia membalut teks, kemudian mencari saiz fon lebih kecil melalui carian binari jika teks masih melimpah, supaya label kekal boleh dibaca dan dalam sempadannya.

## Oklusi {#occlusion}

Secara lalai teks dan ikon widget sentiasa dipaparkan di hadapan geometri adegan (pemaparan lama). Aplikasi yang mahu geometri adegan melindungi label boleh mengaktifkannya bagi setiap widget — lihat [Oklusi](/ms/advanced/occlusion).
