# Butang Ikon {#icon-button}

Butang bulatan yang memaparkan ikon menggantikan teks. Ikon berasal daripada [set ikon SenangStart](/ms/api/icons) dan dirujuk melalui slug.

### Komponen a-sxr-icon-button {#a-sxr-icon-button-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------           | -------------------------------------------------------   | ------------- |
| on                 | Peristiwa yang mencetuskan tindakan onclick | click         |
| font-color         | Warna teks label butang | #F1F5F9       |
| border-color       | Warna sempadan butang | #1B1B1F       |
| background-color   | Warna latar belakang item | #202127       |
| hover-color        | Warna latar belakang apabila penuding berada di atas butang | #0EA5E9       |
| active-color       | Warna latar belakang apabila butang ditekan | #2563EB       |
| icon               | Slug ikon SenangStart, cth. `check`, `play`, `cog-6-tooth` | check         |
| icon-active        | Slug ikon untuk keadaan aktif | ''            |
| icon-font          | Pilihan lama dikekalkan untuk keserasian | ''            |
| icon-font-size     | Saiz ikon butang | 0.4           |
| icon-occlusion     | Benarkan geometri adegan melindungi ikon (ujian kedalaman pilihan) | false         |
| key                | Kekunci pintasan teks yang mengaktifkan widget (cth. 'e') |               |
| key-code           | Kekunci pintasan angka lama (cth. 32 untuk Space) | -1            |
| toggle             | Status suis | false         |
| toggle-state       | Tetapkan keadaan hidup/mati butang suis | false         |
| height             | Tinggi item | 1             |
| width              | Lebar item | 1             |
| margin             | Margin di sekeliling item | 0 0 0 0       |

```html
<a-sxr-icon-button
	height="0.75"
	onclick="buttonActionFunction" key-code="32"
	icon="star"
	margin="0 0 0.05 0"
>
</a-sxr-icon-button>
```

## Ikon {#icons}

`icon` menerima slug daripada [set ikon](/ms/api/icons) — 246 ikon tersedia (`check`, `play`, `cog-6-tooth`, `sparkles`, …). Slug yang tidak dikenali menggunakan glif `?` sebagai gantian dan tidak menyebabkan kegagalan.

`icon-active` menukar ikon yang dipaparkan semasa butang ditekan, cara lazim untuk menunjukkan keadaan ditekan/disahkan:

```html
<a-sxr-icon-button icon="play" icon-active="pause"></a-sxr-icon-button>
```

`icon-font` ialah pilihan lama yang dikekalkan untuk keserasian; adegan baharu patut menggunakan `icon`.

## Mod suis {#toggle-mode}

`toggle="true"` menjadikan butang kekal hidup atau mati selepas ditekan, dengan keadaan disimpan dalam `toggle-state`.

## Oklusi {#occlusion}

Ikon dipaparkan di hadapan geometri adegan secara lalai. Tetapkan `icon-occlusion="true"` untuk membenarkan geometri adegan melindungi ikon — lihat [Oklusi](/ms/advanced/occlusion).
