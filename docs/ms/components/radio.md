# Butang Radio {#radio}

Butang radio. Radio yang berkongsi nama `group` membentuk set yang saling eksklusif, dan kumpulan menyokong navigasi kekunci anak panah WAI-ARIA.

### Komponen a-sxr-radio {#a-sxr-radio-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------         | -------------------------------------------------------   | -------------- |
| on               | Peristiwa yang mencetuskan tindakan onclick | click          |
| checked          | Sama ada radio dipilih pada awalnya | false          |
| active           | Sama ada radio diaktifkan | true           |
| group            | Nama kumpulan; memilih satu radio menyahpilih radio dalam kumpulan yang sama | ''            |
| value            | Teks label butang radio | ''             |
| font-family      | Keluarga fon butang radio | Outfit-Regular.ttf |
| font-size        | Saiz fon butang radio | 0.2            |
| font-color       | Warna teks label butang radio | #161618        |
| border-color     | Warna sempadan butang radio | #1B1B1F        |
| background-color | Warna latar belakang butang radio | #F1F5F9        |
| hover-color      | Warna latar belakang apabila penuding berada di atas butang radio | #0EA5E9        |
| handle-color     | Warna pemegang tengah radio | #202127        |
| active-color     | Warna latar belakang apabila butang radio ditekan | #2563EB        |
| radiosizecoef    | Faktor skala saiz bulatan radio | 1              |
| key              | Kekunci pintasan teks yang mengaktifkan widget (cth. 'e') |            |
| key-code         | Kekunci pintasan angka lama (cth. 32 untuk Space) | -1            |
| width            | Lebar butang radio | 1              |
| height           | Tinggi butang radio | 1              |
| margin           | Margin di sekeliling butang radio | 0 0 0 0        |

```html
<a-sxr-radio
	width="2.5" height="0.75"
	onclick="toggleActionFunction"
	value="radio label"
	font-size="0.3"
	margin="0 0 0.05 0"
>
</a-sxr-radio>
```

## Kumpulan {#groups}

Berikan nilai `group` yang sama kepada radio untuk menjadikannya saling eksklusif — memilih satu menyahpilih radio lain dalam kumpulan secara automatik.

```html
<a-sxr-flex-container flex-direction="column" item-padding="0.1" opacity="1"
                      width="3" height="2" position="0 1.6 -2">
  <a-sxr-radio group="quality" checked="true" value="Low"></a-sxr-radio>
  <a-sxr-radio group="quality" value="Medium"></a-sxr-radio>
  <a-sxr-radio group="quality" value="High"></a-sxr-radio>
</a-sxr-flex-container>
```

## Papan kekunci {#keyboard}

| Kekunci | Tindakan |
| --- | --- |
| `Space` | Pilih radio yang difokuskan |
| `↑` `↓` | Alihkan pilihan melalui kumpulan |
| `←` `→` | Alihkan pilihan melalui kumpulan |

`aria-checked` mencerminkan keadaan yang dipilih, dan pilihan dianimasikan. `active="false"` menyahaktifkan radio.
