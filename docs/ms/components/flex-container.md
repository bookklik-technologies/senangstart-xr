# Bekas Flex {#flex-container}

Bekas susun atur menyusun widget anak di dalam panel 3D.

::: warning Nilai lalai `opacity`
Nilai lalai `opacity` ialah `0.0` — bekas tidak kelihatan sehingga anda menetapkannya.
:::

### Komponen a-sxr-flex-container {#a-sxr-flex-container-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------         | ----------------------------------------------------   | ------------- |
| flex-direction   | sifat yang menentukan kedudukan item flex dalam bekas flex, paksi utama dan arah: 'row', 'column' | 'row'         |
| justify-content  | sifat yang menentukan pembahagian ruang antara dan di sekeliling item kandungan sepanjang paksi utama bekas: 'flexStart','center','flexEnd' | 'flexStart'   |
| align-items      | sifat yang menentukan pembahagian ruang antara dan di sekeliling item flex sepanjang paksi silang bekas. Seperti justify-content tetapi dalam arah berserenjang. | 'flexStart'   |
| item-padding     | Jarak antara anak (susun atur anak dikemas kini secara automatik selepas penyisipan, penyingkiran, perubahan saiz atau susun atur) | 0.0           |
| opacity          | Ketelusan bekas flex | 0.0           |
| is-top-container | Tetapkan latar belakang bekas flex | false         |
| panel-color      | Warna latar belakang bekas flex | #202127       |
| panel-rounded    | Jejari pembulatan panel bekas flex | 0.05          |
| font-family      | Keluarga fon lalai yang diwarisi widget anak (styles.fontFamily) | Outfit-Regular.ttf |
| font-color       | Warna teks lalai yang diwarisi widget anak (styles.fontColor) | #F1F5F9       |
| border-color     | Warna sempadan lalai yang diwarisi widget anak (styles.borderColor) | #1B1B1F       |
| background-color | Warna latar belakang lalai yang diwarisi widget anak (styles.backgroundColor) | #202127       |
| hover-color      | Warna hover lalai yang diwarisi widget anak (styles.hoverColor) | #0EA5E9       |
| active-color     | Warna aktif lalai yang diwarisi widget anak (styles.activeColor) | #2563EB       |
| handle-color     | Warna pemegang lalai yang diwarisi widget anak (styles.handleColor) | #F1F5F9       |

```html
<a-sxr-flex-container
    flex-direction="column" justify-content="center" align-items="center" item-padding="0.1" opacity="0.7" width="3.5" height="4.5"
    panel-color="#072B73"
    panel-rounded="0.2"
	position="0 2.5 -6" rotation="0 0 0"
>
... gui items here...

</a-sxr-flex-container>
```

## Pewarisan gaya {#style-inheritance}

Tujuh sifat terakhir membentuk skop tema yang diwarisi oleh widget anak yang tidak menetapkan nilai sendiri. Lihat [Susun Atur](/ms/guide/layout) untuk peraturan penuh pewarisan dan objek lama.

## Penyusunan semula {#relayout}

Susun atur anak dikemas kini secara automatik selepas penyisipan, penyingkiran, perubahan saiz atau perubahan susun atur lain.
