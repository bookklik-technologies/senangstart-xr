# Binaan & CI {#build-ci}

Cara pustaka dibina, disahkan dan diedarkan.

## Rantaian alat {#toolchain}

| Alat | Versi | Tujuan |
| --- | --- | --- |
| Webpack | ^5.107 | Pembungkusan berkas, pelayan pembangunan |
| Babel | ^7.24 | Transpilasi untuk chrome/edge 89, firefox 90, safari 13.1 |
| Jest | ^29 | Ujian unit (jsdom + `jest-canvas-mock`) |
| ESLint | 9 | Lint, tiada amaran dibenarkan |
| Prettier | 3 | Pemformatan |
| Playwright | 1.56.1 | Semakan integrasi Chromium (CI) |
| VitePress | ^1.6 | Laman dokumentasi ini |

Sumber menggunakan JavaScript biasa (ES2022, modul CommonJS) — tiada TypeScript dalam projek.

## Output berkas {#bundle-outputs}

Binaan webpack dikawal oleh persekitaran. Ia menghasilkan `senangstart-xr.js` (pembangunan) atau `senangstart-xr.min.js` (pengeluaran) bersama peta sumber, dan menyalin `Outfit-Regular.ttf` di sebelah berkas melalui plugin tersuai `BundledFont`.

| Skrip | Output |
| --- | --- |
| `npm run dist` | `dist/` — berkas pengeluaran **dan** pembangunan |
| `npm run dist-min` | `dist/senangstart-xr.min.js` sahaja |
| `npm run dist-dev` | `dist/senangstart-xr.js` sahaja |
| `npm run dist-example` | Berkas pembangunan `examples/js/` |
| `npm run dist-example-min` | Berkas pengeluaran `examples/js/` |
| `npm run dist:all` | `dist/` dan `examples/js/`, kedua-dua varian |

Binaan pengeluaran menggunakan peta sumber tersembunyi; binaan pembangunan menggunakan `eval-source-map`.

## Pembangunan setempat {#local-development}

```bash
npm start
```

webpack-dev-server menyediakan folder `examples/` di `http://localhost:8080`, dengan adegan pameran pada akar.

## Skrip pengesahan {#verification-scripts}

| Skrip | Perkara yang disemak |
| --- | --- |
| `npm run check:build` | Salinan berkas, peta sumber dan fon dalam `dist/` dan `examples/js/` disegerakkan (perbandingan hash) |
| `npm run check:package` | `npm pack` diikuti pemasangan pengguna yang ketat dengan `aframe@1.8.0`; kegagalan pemasangan menggagalkan semakan |
| `npm run check:browser` | Pelaksana integrasi Playwright untuk `scripts/fixtures/aframe.html` |
| `npm run audit:prod` | `npm audit` untuk kebergantungan pengeluaran sahaja |
| `npm run lint` | ESLint untuk `src/`, `tests/`, `scripts/` dengan `--max-warnings=0` |

## Ujian {#tests}

```bash
npm test          # single run
npm run test:watch
```

Suite terdiri daripada 14 suite Jest / 108 ujian yang merangkumi widget, tingkah laku papan kekunci, peluncur, susun atur flex, kemas kini langsung, penyuntingan asli, keadaan dinyahaktifkan, kursor, bevelbox, widget bulatan, teks dan fon, panel berbucu bulat serta pembantu `SXR`.

### Ujian keselarasan dokumentasi {#docs-drift-test}

`tests/docs-drift.test.js` memastikan dokumentasi tidak menyimpang daripada kod. Ia memuatkan komponen sebenar, kemudian menghuraikan halaman dokumentasi dan memastikan bahawa:

1. setiap komponen dalam jadual gambaran keseluruhan mendaftarkan primitif yang didokumenkan
2. setiap sifat yang didokumenkan mempunyai pemetaan primitif sepadan
3. setiap nilai lalai yang didokumenkan sepadan dengan skema komponen

Ujian membaca jadual komponen daripada halaman di bawah [`docs/components/`](/ms/components/) dan gambaran keseluruhan daripada [`docs/components/index.md`](/ms/components/). Jika anda mengubah nilai lalai skema, kemas kini halaman dokumentasi dalam komit yang sama atau CI akan gagal.

## CI {#ci}

Saluran GitHub Actions (Node 20) menjalankan:

1. lint → jest → binaan → semakan binaan → tarball/pemasangan pengguna → `npm audit`
2. matriks pelayar Chromium enam tugas — A-Frame **1.7.0, 1.7.1, 1.8.0** × berkas pembangunan/pengeluaran

Tangkapan skrin dan bilangan sumber dimuat naik sebagai artifak. Pelaksana pelayar memerlukan Playwright dan pemasangan Chromium; kewujudannya tidak membuktikan keputusan lulus — lihat [AUDIT.md](https://github.com/bookklik-technologies/senangstart-xr/blob/main/AUDIT.md) untuk syarat keluaran semasa.

## Laman dokumentasi {#documentation-site}

Laman ini dibina dengan VitePress:

```bash
npm run docs:dev      # local dev server with hot reload
npm run docs:build    # static build to docs/.vitepress/dist
npm run docs:preview  # preview the built site
```

Output binaan diterbitkan ke GitHub Pages oleh `.github/workflows/docs.yml`.

## Status keluaran {#release-status}

Lihat [AUDIT.md](https://github.com/bookklik-technologies/senangstart-xr/blob/main/AUDIT.md) untuk syarat keluaran semasa dan batasan yang diketahui. Penerbitan dan penggunaan dilakukan secara manual.

## Lesen {#license}

[MIT](https://github.com/bookklik-technologies/senangstart-xr/blob/main/LICENSE)
© Bookklik Technologies
