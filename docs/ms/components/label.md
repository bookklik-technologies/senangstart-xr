# Label {#label}

Label teks yang dipaparkan melalui kanvas dengan pembalutan, penjajaran dan strok pilihan.

### Komponen a-sxr-label {#a-sxr-label-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------         | ------------------------------------------------------- | -------------  |
| value            | Teks label | ''             |
| align            | penjajaran teks: 'left','center','right' | 'center'       |
| anchor           | kedudukan sauh teks: 'left','center','right' | 'center'       |
| line-height      | tinggi baris label | 0.2            |
| letter-spacing   | jarak huruf label | 0              |
| font-size        | Saiz fon label | 0.2            |
| font-family      | Keluarga fon label | Outfit-Regular.ttf |
| font-color       | Warna teks label | #F1F5F9        |
| background-color | Warna latar belakang label | #202127        |
| opacity          | Kelegapan latar belakang label | 1.0            |
| text-depth       | jarak teks dari latar belakang label | 0.01           |
| text-occlusion   | Benarkan geometri adegan melindungi teks (ujian kedalaman pilihan) | false          |
| text-stroke-color  | Warna strok teks (gaya strok kanvas) | ''             |
| text-stroke-width   | Lebar strok teks (-1 menyahaktifkan) | -1             |
| height           | Tinggi item | 1              |
| width            | Lebar item | 1              |
| margin           | Margin di sekeliling item | 0 0 0 0        |

```html
<a-sxr-label
	width="2.5" height="0.75"
	value="test label"
	font-family="Outfit-Regular.woff2"
	font-size="0.35"
	line-height="0.8"
	letter-spacing="0"
	margin="0 0 0.05 0"
>
</a-sxr-label>
```

## Teks berbilang baris {#multi-line-text}

Teks dibalut secara automatik dalam `width` label. Teks panjang dikecilkan melalui carian binari pada saiz fon agar sentiasa muat dalam kotak tanpa melimpah.

## Penjajaran {#alignment}

`align` mengawal penjajaran teks dalam kotak (`left`, `center`, `right`) dan `anchor` mengawal tepi yang menjadi sauh blok teks.

## Strok teks {#text-stroke}

Tambahkan garis luar untuk meningkatkan kebolehbacaan pada adegan 3D yang padat:

```html
<a-sxr-label value="Warning"
             text-stroke-color="#000000"
             text-stroke-width="0.02"></a-sxr-label>
```

Nilai `text-stroke-width` sebanyak `-1` (lalai) menyahaktifkan strok.

## Oklusi {#occlusion}

Label dipaparkan di hadapan geometri adegan secara lalai. Tetapkan `text-occlusion="true"` untuk membenarkan geometri adegan melindungi teks — lihat [Oklusi](/ms/advanced/occlusion).
