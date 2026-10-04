# Suis {#toggle}

Suis dengan landasan dan pemegang beranimasi. Mendedahkan `role="switch"` dan keadaan `checked`; widget yang dinyahaktifkan mengabaikan pengaktifan.

### Komponen a-sxr-toggle {#a-sxr-toggle-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------         | -------------------------------------------------------   | -------------- |
| on               | Peristiwa yang mencetuskan tindakan onclick | click          |
| key              | Kekunci pintasan teks yang mengaktifkan widget (cth. 'e') |                |
| key-code         | Kekunci pintasan angka lama (cth. 32 untuk Space) | -1             |
| checked          | Sama ada suis dihidupkan | false          |
| active           | Sama ada suis diaktifkan | true           |
| toggle           | Status suis | false          |
| toggle-state     | Tetapkan keadaan hidup/mati butang suis | false          |
| value            | Teks label butang suis | ''             |
| font-family      | Keluarga fon butang suis | Outfit-Regular.ttf |
| font-size        | Saiz fon butang suis | 0.2            |
| font-color       | Warna teks label butang suis | #161618        |
| border-width     |                                                           | 1              |
| border-color     | Warna sempadan butang suis | #1B1B1F        |
| background-color | Warna latar belakang butang suis | #F1F5F9        |
| hover-color      | Warna latar belakang apabila penuding berada di atas butang suis | #0EA5E9        |
| handle-color     | Warna pemegang suis | #F1F5F9        |
| active-color     | Warna latar belakang apabila butang suis ditekan | #2563EB        |
| height           | Tinggi butang suis | 1              |
| width            | Lebar butang suis | 1              |
| margin           | Margin di sekeliling butang suis | 0 0 0 0        |

```html
<a-sxr-toggle
	width="2.5" height="0.75"
	onclick="testToggleAction"
	value="toggle label"
	font-family="Outfit-Regular.woff2"
	font-size="0.2"
	margin="0 0 0.05 0"
>
</a-sxr-toggle>
```

## Keadaan {#states}

| Sifat | Makna |
| --- | --- |
| `checked` | Suis hidup atau mati |
| `active` | Suis diaktifkan; `false` menyahaktifkannya dan mengabaikan pengaktifan |

`aria-checked` mengikut `checked`, supaya teknologi bantuan dan pengguna papan kekunci mengetahui keadaan semasa.

## Interaksi {#interaction}

Klik, atau fokus dan tekan `Enter` / `Space`, untuk menukar keadaan. Widget yang dinyahaktifkan (`active="false"`) mengabaikan pengaktifan.
