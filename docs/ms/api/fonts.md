# Fon {#fonts}

Teks widget dipaparkan pada **tekstur kanvas 2D**, jadi fon mesti boleh digunakan oleh konteks kanvas. SenangStart XR mengendalikannya melalui FontFace API dan melukis semula teks secara automatik setelah fon selesai dimuatkan.

## Fon lalai {#default-font}

Keluarga lalai ialah `Outfit-Regular.ttf`, didedahkan sebagai `SXR.fonts.default`. Ia disertakan dalam tarball npm dan ditentukan **relatif kepada URL skrip berkas** (`SXR.bundleBaseUrl`), bukan halaman — jadi ia berfungsi daripada CDN atau `node_modules` tanpa menyalin apa-apa.

```js
SXR.fonts.default  // 'Outfit-Regular.ttf'
```

## Daftar fon {#the-font-registry}

`SXR.fonts` menjejaki keadaan pemuatan:

| Medan | Tujuan |
| --- | --- |
| `default` | Nama fail fon lalai |
| `registered` | nama fail → nama keluarga fon (dimuatkan), `false` (gagal) atau tiada |
| `pending` | nama fail → Promise pemuatan bersama yang sedang berjalan |
| `redrawQueue` | nama fail → panggil balik untuk dijalankan setelah pemuatan selesai |

## Mendaftarkan fon {#registering-a-font}

### `SXR.registerFontFile(fontFile)` {#sxr-registerfontfile-fontfile}

Mendaftarkan fail `*.ttf` / `*.otf` / `*.woff` / `*.woff2` melalui FontFace API. Mengembalikan Promise yang diselesaikan kepada nama keluarga fon, atau `null` apabila argumen bukan nama fail fon, FontFace tidak tersedia atau pemuatan gagal.

```js
SXR.registerFontFile('Inter-Regular.woff2')
  .then((family) => console.log('ready:', family))
```

- **Panggilan serentak berkongsi satu pemuatan** — promise yang sama dikembalikan kepada setiap pemanggil.
- Nama keluarga fon diperoleh daripada nama fail (`Inter-Regular.woff2` → `Inter-Regular`).
- Argumen bukan fon diselesaikan kepada `null` tanpa mengakses rangkaian.

### `SXR.onFontResolved(fontFile, callback)` {#sxr-onfontresolved-fontfile-callback}

Membariskan panggil balik apabila fon dimuatkan (atau gagal). Mengembalikan `true` jika panggil balik dibariskan, `false` jika fon sudah selesai atau argumen tidak sah — jadi anda boleh mengetahui sama ada panggil balik akan dijalankan.

```js
if (SXR.onFontResolved('Inter-Regular.woff2', redrawMyLabels)) {
  // queued; redrawMyLabels will run when the font resolves
}
```

### `SXR.getCanvasFontFamily(fontFamily)` {#sxr-getcanvasfontfamily-fontfamily}

Menentukan fon yang boleh digunakan kanvas daripada argumen fon:

- **nama fail** → keluarga fon berdaftar, atau susunan fon sistem semasa pemuatan (dan memulakan pendaftaran)
- **nama keluarga fon** (cth. `'Arial'`) → dikembalikan tanpa perubahan
- kosong / `'undefined'` / `'null'` → `'Arial, Helvetica, sans-serif'`

### `SXR.normalizeFontSize(fontSize, fallback)` {#sxr-normalizefontsize-fontsize-fallback}

Menghuraikan saiz fon, mengembalikan `fallback` (lalai `0.2`) apabila nilai bukan nombor positif terhingga.

## Fon tersuai {#custom-fonts}

Dua pendekatan:

1. **Nama fail** — pustaka memuatkan dan mendaftarkannya. Fail fon tersuai ditentukan relatif kepada **URL halaman**.

   ```html
   <a-sxr-label value="Custom" font-family="Inter-Regular.woff2"></a-sxr-label>
   ```

2. **Nama keluarga fon** — jika fon sudah tersedia kepada kanvas (cth. fon sistem atau fon yang ditambah melalui `@font-face` anda sendiri):

   ```html
   <a-sxr-label value="Custom" font-family="Arial"></a-sxr-label>
   ```

## Pemaparan semasa pemuatan {#rendering-while-loading}

Semasa fon dimuatkan — atau apabila FontFace tidak tersedia — teks dipaparkan dengan susunan fon sistem (`Arial, Helvetica, sans-serif`). Setelah fon selesai dimuatkan, setiap entiti yang didaftarkan melalui `SXR.onFontResolved` **dilukis semula pada tempatnya** dengan fon sebenar. Widget menyediakannya untuk anda, jadi halaman boleh bermula dengan teks fon gantian dan ditingkatkan secara automatik.

## Output binaan {#build-outputs}

`Outfit-Regular.ttf` disalin di sebelah setiap berkas dalam `dist/` dan `examples/js/`; fon sumber kekal pada akar repositori. Plugin webpack [BundledFont](https://github.com/bookklik-technologies/senangstart-xr/blob/main/webpack.config.js) menghasilkannya sebagai aset.

## Saiz {#sizing}

`font-size` dan `line-height` menggunakan **unit dunia A-Frame**. Pemapar membalut teks dan mencari saiz lebih kecil melalui carian binari apabila teks akan melimpah daripada kotak widget, supaya label kekal dalam sempadannya. Ukur teks dengan:

```js
SXR.getTextWidth('Hello', '600 20px Outfit-Regular')
```
