# Butang Ikon dan Label {#icon-label-button}

Butang yang menggabungkan ikon dengan label teks.

### Komponen a-sxr-icon-label-button {#a-sxr-icon-label-button-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------         | ----------------------------------------------------   | ------------- |
| on               | Peristiwa yang mencetuskan tindakan onclick | click         |
| icon              | Slug ikon SenangStart, cth. `check`, `sparkles` | check         |
| icon-active      | Slug ikon untuk keadaan aktif | ''            |
| icon-font        | Pilihan lama dikekalkan untuk keserasian | ''            |
| icon-font-size   | Saiz ikon butang | 0.35          |
| icon-occlusion   | Benarkan geometri adegan melindungi ikon (ujian kedalaman pilihan) | false        |
| key              | Kekunci pintasan teks yang mengaktifkan widget (cth. 'e') |            |
| key-code         | Kekunci pintasan angka lama (cth. 32 untuk Space) | -1            |
| font-color       | Warna teks label butang | #F1F5F9       |
| value            | Teks label butang | ''            |
| font-family      | Keluarga fon butang | Outfit-Regular.ttf |
| font-size        | Saiz fon butang | 0.2           |
| border-color     | Warna sempadan butang | #1B1B1F       |
| background-color | Warna latar belakang butang | #202127       |
| hover-color      | Warna latar belakang apabila penuding berada di atas butang | #0EA5E9       |
| active-color     | Warna latar belakang apabila butang ditekan | #2563EB       |
| toggle           | Status suis | false         |
| toggle-state     | Tetapkan keadaan hidup/mati butang suis | false         |
| height           | Tinggi butang | 1             |
| width            | Lebar butang | 1             |
| margin           | Margin di sekeliling butang | 0 0 0 0       |

```html
<a-sxr-icon-label-button
	width="2.5" height="0.75"
	onclick="buttonActionFunction"
	icon="sparkles"
	value="icon label"
	font-family="Outfit-Regular.woff2"
	font-size="0.16"
	margin="0 0 0.05 0"
>
</a-sxr-icon-label-button>
```

## Nota {#notes}

- `value` menyimpan label teks; `icon` menyimpan slug ikon. Kedua-duanya boleh [dikemas kini secara langsung](/ms/advanced/live-updates).
- `icon-active` menukar ikon dalam keadaan ditekan.
- `icon-font` ialah pilihan lama yang dikekalkan untuk keserasian.
- Tetapkan `icon-occlusion="true"` untuk membenarkan geometri adegan melindungi ikon — lihat [Oklusi](/ms/advanced/occlusion).
