---
layout: home

hero:
  name: SenangStart XR
  text: Antara Muka 3D untuk WebXR
  tagline: Komponen GUI untuk A-Frame — daripada penuding desktop hingga pengawal VR.
  image:
    src: /assets/senangstart-xr-logo.svg
    alt: SenangStart XR
  actions:
    - theme: brand
      text: Bermula
      link: /ms/guide/getting-started
    - theme: alt
      text: Lihat di GitHub
      link: https://github.com/bookklik-technologies/senangstart-xr

features:
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>
    title: 18 Komponen A-Frame
    details: Satu primitif HTML bagi setiap widget — butang, peluncur, suis dan input, didaftarkan melalui satu berkas pelayar.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z M3 9h18 M12 9v12"/></svg>
    title: Susun Atur Fleksibel
    details: Susun widget dalam baris dan lajur dengan penjajaran ala flexbox, jarak, panel berbucu bulat dan pewarisan gaya.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M 2.25 15 h 19.5 v 1.5 a 2.25 2.25 0 0 1 -2.25 2.25 h -15 A 2.25 2.25 0 0 1 2.25 16.5 V 15 Z m 2.25 0 V 6.75 A 2.25 2.25 0 0 1 6.75 4.5 h 10.5 a 2.25 2.25 0 0 1 2.25 2.25 V 15"></path></svg>
    title: Papan Kekunci & Kebolehcapaian
    details: Peranan ARIA, pengaktifan papan kekunci, peluncur kekunci anak panah dan kumpulan radio memudahkan interaksi desktop.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path></svg>
    title: Pelbagai Kaedah Input
    details: Gunakan penuding desktop, pengaktifan melalui pandangan pada mudah alih dan laser pengawal VR dengan widget yang sama.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>
    title: Kemas Kini Atribut Secara Langsung
    details: Kemas kini dimensi, warna, label dan keadaan selepas permulaan; geometri dan teks dibina semula pada tempatnya.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-3M12 21v-5M9 21l-6 0L8 21v-8H20V20a1 1 180 01-1 1zM20 13a1 1 180 001-1v-1a2 2 180 00-2-2h-2a1 1 180 01-1-1v-2.9a2 2 180 10-4 0V8a1 1 180 01-1 1h-2a2 2 180 00-2 2v1a1 1 180 001 1"></path></svg>
    title: Token Reka Bentuk & Fon
    details: Gayakan adegan anda dengan warna bersama, fon Outfit yang disertakan, fon tersuai dan pembantu ikon.
---

<style>
  .image-container .VPImage {
    filter: drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.2));
  }
</style>

## Contoh Ringkas

```html
<a-sxr-flex-container
  flex-direction="column" justify-content="center" align-items="center"
  width="4" height="3" opacity="0" position="0 1.6 -2">
  <a-sxr-button width="2" height="0.6" value="Hello XR"></a-sxr-button>
</a-sxr-flex-container>
```

Letakkan panel ini di dalam `<a-scene>` selepas memuatkan A-Frame dan SenangStart XR. Bekas tersebut memusatkan butang dalam lajur, dua unit di hadapan kamera.

Lihat [Pemasangan](/ms/guide/getting-started) untuk persediaan adegan dan [Interaksi](/ms/guide/interaction) untuk sambungan kursor dan pengawal.
