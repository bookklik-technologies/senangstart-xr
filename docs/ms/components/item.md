# Item & Interaksi {#item-interactable}

Dua komponen sokongan membawa sifat yang dikongsi oleh kebanyakan widget. Kedua-duanya tidak mendaftarkan primitif — ia dilampirkan kepada entiti yang menggunakannya, dan primitif widget memetakan atribut `width`, `height`, `margin`, `key` dan sebagainya kepadanya.

| Komponen | Primitif | Penerangan |
| --- | --- | --- |
| sxr-item | `<none>` | Digunakan oleh komponen lain untuk sifat umum seperti tinggi dan lebar |
| sxr-interactable | `<none>` | Digunakan oleh komponen lain untuk menentukan tingkah laku onclick |

## Komponen sxr-item {#sxr-item-component}

Dimensi, kedalaman, margin dan serong bersama.

| Sifat | Penerangan | Nilai Lalai |
| -------- | ----------- | ------------- |
| type | Pengecam jenis widget | '' |
| width | Lebar item | 1 |
| height | Tinggi item | 1 |
| baseDepth | Kedalaman tapak item | 0.01 |
| depth | Kedalaman item | 0.02 |
| gap | Jarak antara item dengan tapak | 0.025 |
| radius | Jejari bucu tapak item | 0 |
| margin | Margin di sekeliling item | 0 0 0 0 |
| bevel | Jika true, serong item diaktifkan | false |
| bevelSegments | Segmen serong item | 5 |
| steps | Langkah serong item | 2 |
| bevelSize | Saiz serong item | 0.1 |
| bevelOffset | Ofset serong item | 0 |
| bevelThickness | Ketebalan serong item | 0.1 |

`margin` ialah `vec4` dan mengikut turutan singkatan CSS (atas, kanan, bawah, kiri).

Baca nilai semasa ketika masa jalan dengan pembantu [`SXR.getItem`](/ms/api/sxr-namespace#sxr-getitem-el), yang menggunakan nilai lalai terdokumen ini apabila widget diletakkan pada entiti biasa.

## Komponen sxr-interactable {#sxr-interactable-component}

Panggil balik klik/hover dan pendaftaran pintasan papan kekunci.

| Sifat | Penerangan | Nilai Lalai |
| -------- | ----------- | ------------- |
| clickAction | Nama fungsi global yang dipanggil semasa klik | |
| hoverAction | Nama fungsi global yang dipanggil semasa hover | |
| key | Kekunci pintasan teks yang mengaktifkan widget (cth. `e`) | |
| keyCode | Kekunci pintasan angka lama (cth. 32 untuk Space) | -1 |

### Daftar papan kekunci {#keyboard-registry}

**Satu** pendengar `keydown` pada peringkat window mengagihkan peristiwa kepada semua tika `sxr-interactable` yang berdaftar, menggantikan pendengar tangkapan global bagi setiap widget. Pendengar dilampirkan pada pendaftaran pertama dan disingkirkan apabila tika terakhir dinyahdaftarkan.

- Semua widget yang diikat kepada kekunci sama akan diaktifkan — ikat kekunci berbeza bagi setiap widget.
- Pintasan diabaikan apabila pengguna menaip pada permukaan boleh sunting, semasa komposisi IME dan bagi tekanan kekunci berulang automatik.
- `key` berfungsi secara bebas daripada `keyCode` angka lama.
- Apabila kekunci pintasan widget sepadan dengan tekanan kekunci yang difokuskan, widget melangkau pengendalian `Enter`/`Space` fokusnya sendiri untuk mengelakkan pengaktifan berganda.

Pengaktifan pintasan mengeluarkan peristiwa `click` dengan butiran `source: 'keyboard'`, bersama `key` dan `keyCode`:

```js
document.querySelector('a-sxr-button').addEventListener('click', (e) => {
  console.log(e.detail.source) // 'keyboard'
  console.log(e.detail.key)     // 'e'
})
```

### Kaedah tika {#instance-methods}

| Kaedah | Tujuan |
| --- | --- |
| `matchesEvent(event)` | Benar apabila `key` / `keyCode` bagi tika ini sepadan dengan peristiwa |
| `setClickAction(action)` | Ikat semula nama panggil balik klik |
