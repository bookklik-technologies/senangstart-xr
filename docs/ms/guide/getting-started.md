# Pemasangan {#installation}

SenangStart XR ialah rangka kerja GUI yang dibina di atas [A-Frame](https://aframe.io). Ia disediakan sebagai satu berkas pelayar yang mendaftarkan 18 komponen `sxr-*` dan primitif HTML `a-sxr-*` yang sepadan pada objek global `AFRAME`.

<DemoWidget title="Kawalan dalam adegan langsung" src="/demo/controls.html" height="420" />

Versi A-Frame yang disokong ialah **1.7.x dan 1.8.x** (kebergantungan rakan `>=1.7.0 <1.9.0`). Lihat [Versi A-Frame](/ms/guide/aframe-versions).

## Binaan setempat {#local-build}

Sertakan A-Frame, kemudian berkas SenangStart XR, dalam `<head>` halaman anda:

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<!-- local build -->
<script src="dist/senangstart-xr.js"></script>
```

Kemudian gunakan primitif `a-sxr-*` dalam `<a-scene>` anda (lihat bahagian [Komponen](/ms/components/)):

```html
<a-scene>
  <a-sxr-flex-container
    flex-direction="column" justify-content="center" align-items="center"
    width="4" height="3" opacity="0"
    position="0 1.6 -2">
    <a-sxr-button width="2" height="0.6" value="Hello XR"
      onclick="handleClick"></a-sxr-button>
  </a-sxr-flex-container>
</a-scene>
```

## Pasang melalui npm {#install-via-npm}

```bash
npm install @bookklik/senangstart-xr
```

A-Frame ialah kebergantungan rakan (julat disokong: `>=1.7.0 <1.9.0`) dan mesti dimuatkan pada halaman terlebih dahulu. Pakej menyertakan berkas binaan dan fon dalam `dist/` / akar pakej; rujuk `dist/senangstart-xr.min.js` melalui tag `<script>` (berkas mendaftarkan komponennya pada objek global `AFRAME` dan tidak boleh dimuatkan melalui `require()`):

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="node_modules/@bookklik/senangstart-xr/dist/senangstart-xr.min.js"></script>
```

## Penggunaan CDN {#cdn-usage}

```html
<script src="https://unpkg.com/@bookklik/senangstart-xr@2.1.0/dist/senangstart-xr.min.js"></script>
```

::: warning Tetapkan versi CDN
Pengalihan unpkg/jsdelivr bagi URL tanpa versi boleh menyediakan keluaran yang berbeza daripada keluaran yang anda uji.
:::

## Jalankan contoh pameran {#run-the-showcase-example}

Adegan demo sedia guna disertakan di [`examples/index.html`](https://github.com/bookklik-technologies/senangstart-xr/blob/main/examples/index.html). Mulakan pelayan pembangunan yang disertakan:

```bash
npm start
```

Kemudian buka `http://localhost:8080` dalam pelayar untuk melihat widget berfungsi.

## Langkah seterusnya {#next-steps}

- [Susun Atur dengan Bekas Flex](/ms/guide/layout) — susun widget dalam panel 3D
- [Interaksi](/ms/guide/interaction) — panggil balik, peristiwa, papan kekunci dan laser VR
- [Gaya & Fon](/ms/guide/styling) — token jenama dan fon tersuai
- [API Ruang Nama SXR](/ms/api/sxr-namespace) — pembantu melalui atur cara
