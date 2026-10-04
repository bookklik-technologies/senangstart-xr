# Kebolehcapaian {#accessibility}

## Ciri yang disediakan oleh pustaka {#what-the-library-provides}

- **Peranan ARIA** ditetapkan pada widget interaktif, dan widget boleh dicapai melalui papan kekunci (`tabindex="0"` pada butang, suis, radio, peluncur dan input).
- **Operasi papan kekunci** — lihat jadual kekunci penuh dalam [Interaksi](/ms/guide/interaction#keyboard-operation-desktop).
- **Nama boleh capai** kekal disegerakkan: perubahan `value` widget mengemas kini `aria-label` bersama teks yang dipaparkan.
- **Keselamatan menaip** — pintasan global tidak pernah diaktifkan semasa pengguna menaip dalam medan teks, semasa komposisi IME atau pada tekanan kekunci berulang automatik.
- **Pencerminan keadaan** — `aria-checked` dan `aria-valuenow` mengikut keadaan visual suis, radio dan peluncur.

## Penyuntingan teks asli (pilihan) {#native-text-editing-opt-in}

Secara lalai [`a-sxr-input`](/ms/components/input) ialah medan yang dipaparkan melalui kanvas dan dikemas kini melalui atur cara. Menambah `native-editing="true"` menyebabkan pengaktifan memfokuskan `<input>` asli berlabel yang tersembunyi secara visual dan disegerakkan dengan widget:

- menaip, pergerakan karet/pilihan melalui kekunci anak panah, tampalan dan komposisi IME semuanya berfungsi dengan papan kekunci sebenar
- peristiwa `input` berlaku apabila teks berubah
- `change` berlaku apabila disahkan (`Enter` atau kehilangan fokus), sekali bagi setiap nilai yang berubah

```html
<a-sxr-input width="2.8" height="0.5"
             native-editing="true"
             value="Type here"></a-sxr-input>
```

## Batasan yang diketahui {#known-limitations}

::: warning Pembaca skrin
Peranan dan label ARIA widget berada pada entiti 3D dalam adegan WebGL; **pembaca skrin tidak membacakannya**. Operasi papan kekunci disediakan untuk pengguna papan kekunci yang boleh melihat. Untuk pengalaman yang boleh dicapai pembaca skrin, sediakan antara muka DOM selari di samping adegan.
:::

- **Input teks imersif (VR) disediakan oleh aplikasi.** Keluaran ini tidak menyertakan papan kekunci maya Quest. Pada desktop, aktifkan penyuntingan asli pilihan untuk menaip dengan papan kekunci sebenar.
- **Penunjuk fokus hanya bersifat visual** (warna sempadan/fokus widget); tiada bekas roving-tabindex bagi susun atur flex, jadi turutan Tab mengikut turutan DOM dan bukannya susun atur visual.
- **Fokus tidak dikekalkan selepas kehilangan fokus DOM** dalam cara yang boleh diperhatikan teknologi bantuan — keadaan fokus dinyatakan secara visual.
