# Sokongan Versi A-Frame {#a-frame-version-support}

Versi A-Frame yang disokong ialah **1.7.x dan 1.8.x** (kebergantungan rakan `>=1.7.0 <1.9.0`).

Pustaka disahkan dengan keluaran yang ditetapkan [1.7.0](https://aframe.io/releases/1.7.0/aframe.min.js), [1.7.1](https://aframe.io/releases/1.7.1/aframe.min.js) dan [1.8.0](https://aframe.io/blog/aframe-v1.8.0/).

Versi A-Frame terdahulu (termasuk 1.4.x dalam sesetengah petikan kod lama) **tidak lagi diuji** dengan pustaka ini.

## Matriks keserasian {#compatibility-matrix}

| A-Frame | Status | Nota |
| --- | --- | --- |
| 1.8.0 | Disokong | Keluaran terkini yang disahkan |
| 1.7.1 | Disokong | Keluaran tampalan yang disahkan |
| 1.7.0 | Disokong | Versi minimum yang disokong |
| 1.6.x dan ke bawah | Tidak disokong | Di luar julat kebergantungan rakan |
| 1.9.0+ | Tidak disokong | Di luar julat kebergantungan rakan |

## Mengapa versi penting {#why-the-version-matters}

SenangStart XR menggunakan `AFRAME.THREE` daripada tika three.js terbenam yang disertakan A-Frame. Widget membina geometrinya melalui pemapar bersama tersebut, jadi pustaka hanya disahkan dengan keluaran A-Frame yang disenaraikan di atas.

## Semakan integrasi berterusan {#continuous-integration-checks}

CI menjalankan semakan integrasi Chromium dengan A-Frame **1.7.0, 1.7.1 dan 1.8.0**, bagi setiap varian berkas (pembangunan dan pengeluaran). Tangkapan skrin dan bilangan sumber dimuat naik sebagai artifak.

Pelaksana pelayar memerlukan Playwright dan pemasangan Chromium. Kewujudannya tidak membuktikan keputusan lulus — lihat [AUDIT.md](https://github.com/bookklik-technologies/senangstart-xr/blob/main/AUDIT.md) untuk syarat keluaran semasa.

## Turutan pemuatan {#loading-order}

A-Frame mesti dimuatkan **sebelum** SenangStart XR. Berkas mendaftarkan komponennya pada objek global `AFRAME` semasa penghuraian dan mengeluarkan ralat jika `AFRAME` tidak ditakrifkan.

```html
<!-- A-Frame first -->
<script src="https://aframe.io/releases/1.8.0/aframe.min.js"></script>
<!-- SenangStart XR second -->
<script src="node_modules/@bookklik/senangstart-xr/dist/senangstart-xr.min.js"></script>
```
