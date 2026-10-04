# Peluncur Menegak {#vertical-slider}

Peluncur menegak dengan gelembung penunjuk hover yang menunjukkan nilai di bawah penuding, dan label output yang boleh memformatkan nilai melalui fungsi.

### Komponen a-sxr-vertical-slider {#a-sxr-vertical-slider-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------            | -------------------------------------------------------   | -------------  |
| active-color        | Warna bahagian aktif (berisi) landasan | #2563EB        |
| background-color    | Warna latar belakang landasan | #F1F5F9        |
| border-color        | Warna bahagian tidak aktif landasan | #1B1B1F        |
| handle-color        | Warna pemegang | #F1F5F9        |
| handle-outer-radius | Jejari luar pemegang | 0.17           |
| handle-inner-radius | Jejari dalam pemegang | 0.13           |
| handle-outer-depth  | Kedalaman pemegang luar | 0.04           |
| handle-inner-depth  | Kedalaman pemegang dalam | 0.02           |
| hover-color         | Warna pemegang semasa hover | #0EA5E9        |
| hover-font-size     | Saiz fon label yang menunjukkan kedudukan hover pengguna | 0.2            |
| hover-height        | Tinggi label yang menunjukkan kedudukan hover pengguna | 0.35           |
| hover-percent       | Peratus semasa pada kedudukan hover pengguna |                |
| hover-width         | Lebar label yang menunjukkan kedudukan hover pengguna | 0.7            |
| keyboard-step       | Peratus ditambah/dikurangkan bagi setiap tekanan kekunci anak panah apabila difokuskan | 0.05           |
| key                 | Kekunci pintasan teks yang mengaktifkan widget (cth. 'e') |                |
| key-code            | Kekunci pintasan angka lama (cth. 13 untuk Enter) | -1             |
| margin              | Margin di sekeliling item | '0 0 0 0'      |
| onclick             | Fungsi Javascript untuk dilaksanakan semasa klik |                |
| onhover             | Fungsi Javascript untuk dilaksanakan semasa hover |                |
| opacity             | Ketelusan latar belakang peluncur menegak | 1.0            |
| output-font-size    | Saiz fon label yang menunjukkan nilai output | 0.2            |
| output-function     | Nama fungsi untuk mengira nilai output daripada peratus |                |
| output-text-depth   | Jarak teks output dari latar belakang label | 0.25           |
| output-width        | Lebar label yang menunjukkan nilai output | 1.0            |
| percent             | Nilai peluncur yang dipilih semasa, dari 0.0 hingga 1.0 | 0.5            |
| slider-bar-depth    |                                                           | 0.03           |
| slider-bar-width    | Lebar landasan peluncur | 0.08           |
| top-bottom-padding  | Padding yang digunakan pada tinggi landasan | 0.25           |
| height              | Tinggi item | 1              |
| width               | Lebar item | 1              |

```html
<a-sxr-vertical-slider
	width="2.5" height="0.75"
	onclick="slideActionFunction"
	percent="0.29"
	margin="0 0 0.05 0"
>
</a-sxr-vertical-slider>
```

## Tandatangan panggil balik {#callback-signature}

Panggil balik `onclick` menerima **`(percent)`** — untuk pengaktifan penuding dan papan kekunci:

```js
function slideActionFunction(percent) {
  console.log('vertical slider moved to', percent)
}
```

## Label output {#output-label}

`output-function` menamakan **fungsi global** yang menukar peratus mentah kepada teks yang dipaparkan:

```js
function toDegrees(percent) {
  return Math.round(percent * 360) + '°'
}
```

```html
<a-sxr-vertical-slider output-function="toDegrees" percent="0.5"></a-sxr-vertical-slider>
```

Lebar, saiz fon dan kedalaman label dikawal oleh `output-width`, `output-font-size` dan `output-text-depth`.

## Penunjuk hover {#hover-indicator}

Apabila penuding berada di atas landasan, gelembung menunjukkan peratus pada kedudukan tersebut. Rupanya dikawal oleh `hover-width`, `hover-height`, `hover-font-size` dan `hover-percent`; pemegang menggunakan `hover-color`.

## Papan kekunci {#keyboard}

`↑` `↓` (dan `←` `→`) mengubah sebanyak `keyboard-step`; `Home`/`End` melompat ke 0/1.
