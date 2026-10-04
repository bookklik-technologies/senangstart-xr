---
layout: home

hero:
  name: SenangStart XR
  text: Antara Muka 3D untuk WebXR
  tagline: Komponen GUI untuk A-Frame — daripada penuding desktop hingga pengawal VR.
  image:
    src: /logo.svg
    alt: SenangStart XR
  actions:
    - theme: brand
      text: Bermula
      link: /ms/guide/getting-started
    - theme: alt
      text: Lihat di GitHub
      link: https://github.com/bookklik-technologies/senangstart-xr

features:
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18v14H3zM3 9h18M8 9v10"/></svg>
    title: 18 Komponen A-Frame
    details: Satu primitif HTML bagi setiap widget — butang, peluncur, suis dan input, didaftarkan melalui satu berkas pelayar.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4zM4 10h16M10 10v10"/></svg>
    title: Susun Atur Fleksibel
    details: Susun widget dalam baris dan lajur dengan penjajaran ala flexbox, jarak, panel berbucu bulat dan pewarisan gaya.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h1m3 0h1m3 0h1M7 14h10"/></svg>
    title: Papan Kekunci & Kebolehcapaian
    details: Peranan ARIA, pengaktifan papan kekunci, peluncur kekunci anak panah dan kumpulan radio memudahkan interaksi desktop.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>
    title: Pelbagai Kaedah Input
    details: Gunakan penuding desktop, pengaktifan melalui pandangan pada mudah alih dan laser pengawal VR dengan widget yang sama.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6m-4 9a9 9 0 0 0 15 2l3-3m0 6v-6h-6"/></svg>
    title: Kemas Kini Atribut Secara Langsung
    details: Kemas kini dimensi, warna, label dan keadaan selepas permulaan; geometri dan teks dibina semula pada tempatnya.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m4 16 12-12 4 4L8 20H4zm9-9 4 4M5 4v4M3 6h4m12 9v6m-3-3h6"/></svg>
    title: Token Reka Bentuk & Fon
    details: Gayakan adegan anda dengan warna bersama, fon Outfit yang disertakan, fon tersuai dan pembantu ikon.
---

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
