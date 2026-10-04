# Peluncur {#slider}

Peluncur mendatar. Nilainya ialah peratus dari `0.0` hingga `1.0`; ia bertindak balas terhadap klik pada titik tepat, kekunci anak panah dan Home/End.

<DemoWidget title="Peluncur, input dan penunjuk kemajuan" src="/demo/values.html" height="420" />

### Komponen a-sxr-slider {#a-sxr-slider-component}
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
| height              | Tinggi item | 1              |
| hover-color         | Warna pemegang semasa hover | #0EA5E9        |
| keyboard-step       | Peratus ditambah/dikurangkan bagi setiap tekanan kekunci anak panah apabila difokuskan | 0.05           |
| key                 | Kekunci pintasan teks yang mengaktifkan widget (cth. 'e') |                |
| key-code            | Kekunci pintasan angka lama (cth. 13 untuk Enter) | -1             |
| left-right-padding  | Padding yang digunakan pada lebar landasan | 0.25           |
| margin              | Margin di sekeliling item | 0 0 0 0        |
| onclick             | Fungsi Javascript untuk dilaksanakan semasa klik |               |
| onhover             | Fungsi Javascript untuk dilaksanakan semasa hover |               |
| percent             | Nilai peluncur semasa, dari 0.0 hingga 1.0 | 0.5            |
| slider-bar-depth    | Kedalaman landasan peluncur | 0.03           |
| slider-bar-height   | Tinggi landasan peluncur | 0.05           |
| top-bottom-padding  | Padding yang digunakan pada tinggi landasan | 0.125          |
| width               | Lebar item | 1              |

```html
<a-sxr-slider
	width="2.5" height="0.75"
	onclick="slideActionFunction"
	percent="0.29"
	margin="0 0 0.05 0"
>
</a-sxr-slider>
```

## Tandatangan panggil balik {#callback-signature}

Panggil balik `onclick` menerima **`(event, percent)`**:

```js
function slideActionFunction(event, percent) {
  console.log('slider moved to', percent)
}
```

## Papan kekunci {#keyboard}

| Kekunci | Tindakan |
| --- | --- |
| `←` `→` | Ubah sebanyak `keyboard-step` (0.05 secara lalai) |
| `↑` `↓` | Ubah sebanyak `keyboard-step` |
| `Home` | Lompat ke `0` |
| `End` | Lompat ke `1` |

`aria-valuenow` mengikut `percent`.

## Pengawal VR {#vr-controllers}

Peristiwa `click` pengawal membawa persilangan sinar, jadi laser VR menetapkan peluncur pada titik tepat yang terkena sinar. Lihat [Pengawal VR](/ms/guide/interaction#vr-controllers).
