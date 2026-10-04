# Bar Kemajuan {#progress-bar}

Bar kemajuan linear. Tetapkan `percent` dari `0.0` hingga `1.0`.

### Komponen a-sxr-progress-bar {#a-sxr-progress-bar-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------         | -------------------------------------------------------   | ------------- |
| background-color | Warna latar belakang bar kemajuan | #202127       |
| active-color     | Warna yang menunjukkan tahap kemajuan | #2563EB       |
| percent          | Jumlah kemajuan, dari 0.0 hingga 1.0 | 0.5           |
| height           | Tinggi item | 1             |
| width            | Lebar item | 1             |
| margin           | Margin di sekeliling item | 0 0 0 0       |

```html
<a-sxr-progressbar
	width="2.5" height="0.25"
	percent="0.4"
	margin="0 0 0.05 0"
>
</a-sxr-progressbar>
```

::: tip Nama primitif
Komponen ialah `sxr-progress-bar` tetapi primitif ialah `a-sxr-progressbar` (tiada tanda sempang antara progress dengan bar).
:::

## Mengemas kini kemajuan {#updating-progress}

`percent` boleh dikemas kini secara langsung:

```js
progressbar.setAttribute('percent', '0.8')
```

Isian dianimasikan kepada nilai baharu tanpa mencipta semula widget.

## Alternatif bulatan {#circular-alternatives}

Untuk penunjuk berbentuk gelang, gunakan [Penunjuk Kemajuan Bulatan](/ms/components/circle-loader), atau [Pemasa Bulatan](/ms/components/circle-timer) untuk gelang kira detik.
