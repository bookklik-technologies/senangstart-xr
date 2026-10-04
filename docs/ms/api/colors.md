# Warna {#colors}

Palet jenama tersedia sebagai `window.SXR.colors` ketika masa jalan dan digunakan sebagai nilai lalai sifat warna setiap widget.

## Palet {#palette}

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

## Akses masa jalan {#runtime-access}

```js
SXR.colors.primary   // '#2563EB'
SXR.colors.secondary // '#0EA5E9'
SXR.colors.surface   // '#202127'
```

Objek `SXR.colors` ialah sumber rujukan utama bagi `primary`, `secondary`, `darkBase`, `darkDeeper`, `darkCard`, `background`, `surface`, `onSurface`, `border` dan `neutral`. Token reka bentuk selebihnya (`success`, `warning`, `error`, `accent`, `slate100`, `primaryGradient`) ialah nilai jenama yang didokumenkan dan digunakan oleh adegan serta laman dokumentasi — widget menggunakan subset semantik secara lalai.

## Sifat warna mengikut widget {#color-properties-by-widget}

Setiap widget mendedahkan sifat warnanya sendiri. Nilai lalai berasal daripada palet:

| Sifat | Nilai lalai biasa | Digunakan oleh |
| --- | --- | --- |
| `font-color` | `#F1F5F9` | label, butang, butang ikon, bekas |
| `background-color` | `#202127` | kebanyakan widget |
| `border-color` | `#1B1B1F` | kebanyakan widget |
| `hover-color` | `#0EA5E9` | kebanyakan widget interaktif |
| `active-color` | `#2563EB` | kebanyakan widget interaktif |
| `handle-color` | `#F1F5F9` | peluncur, suis, radio |
| `panel-color` | `#202127` | panel bekas flex |
| `focus-color` | `#0EA5E9` | butang |

## Menormalkan input pengguna {#normalizing-user-input}

`SXR.getValidColor` melindungi daripada atribut warna yang belum ditetapkan — rentetan kosong, `undefined` serta rentetan literal `'undefined'` / `'null'` semuanya menggunakan nilai gantian yang selamat:

```js
SXR.getValidColor('')                 // '#F1F5F9'  (colors.onSurface)
SXR.getValidColor('null')             // '#F1F5F9'
SXR.getValidColor('', '#10B981')      // '#10B981'  (your fallback)
```

## Kemas kini secara langsung {#live-updates}

Atribut warna boleh dikemas kini secara langsung — perubahannya menyegarkan warna asal dan label pada tempatnya, dan animasi yang sedang berjalan diteruskan dengan nilai baharu. Lihat [Kemas Kini Atribut Secara Langsung](/ms/advanced/live-updates).
