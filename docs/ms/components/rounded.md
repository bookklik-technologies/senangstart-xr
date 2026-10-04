# Panel Berbucu Bulat {#rounded-panel}

Komponen `rounded` (primitif `a-rounded`) membina panel segi empat berbucu bulat daripada `THREE.ShapeGeometry`. Ia digunakan secara dalaman oleh sesetengah widget dan berguna secara berasingan sebagai plat latar di belakang susun atur.

::: tip Petua
Primitif komponen ini ialah `a-rounded` — tanpa awalan `sxr-`.
:::

## Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| -------- | ----------- | ------------- |
| enabled | Paparkan atau sembunyikan panel | true |
| width | Lebar panel | 1 |
| height | Tinggi panel | 1 |
| radius | Jejari bucu yang digunakan pada keempat-empat bucu | 0.3 |
| topLeftRadius | Gantikan jejari bucu kiri atas; `-1` menggunakan `radius` | -1 |
| topRightRadius | Gantikan jejari bucu kanan atas; `-1` menggunakan `radius` | -1 |
| bottomLeftRadius | Gantikan jejari bucu kiri bawah; `-1` menggunakan `radius` | -1 |
| bottomRightRadius | Gantikan jejari bucu kanan bawah; `-1` menggunakan `radius` | -1 |
| color | Warna panel | #F0F0F0 |
| opacity | Kelegapan panel, dihadkan kepada 0–1 | 1 |
| depthWrite | Aktifkan penulisan kedalaman | true |
| polygonOffset | Aktifkan ofset poligon | false |
| polygonOffsetFactor | Faktor ofset poligon | 0 |
| renderOrder | Turutan pemaparan mesh | 0 |

```html
<a-rounded
  width="3" height="2"
  radius="0.2"
  color="#202127"
  opacity="0.85"
  position="0 1.6 -2.2">
</a-rounded>
```

## Jejari setiap bucu {#per-corner-radii}

Nilai gantian bucu sebanyak `-1` (lalai) menggunakan nilai `radius` bersama, jadi anda hanya menetapkan bucu yang berbeza:

```html
<a-rounded width="3" height="1" radius="0" top-left-radius="0.2" top-right-radius="0.2"></a-rounded>
```

## Pemaparan {#rendering}

- `opacity` di bawah `1` menukar bahan kepada lutsinar dan menetapkan `alphaTest` kepada `0`; pada `1` atau lebih, ketelusan dinyahaktifkan.
- `renderOrder`, `depthWrite` dan tetapan ofset poligon mengawal pengkomposisian panel dengan geometri adegan lain — berguna apabila panel yang sesatah dengan widget berkelip.
- Menyahaktifkan melalui `enabled="false"` menyembunyikan mesh tanpa melupuskannya, jadi kos pengaktifan semula rendah.

## Pembersihan {#cleanup}

Pada `remove`, komponen menyingkirkan object3D serta melupuskan geometri dan bahan, supaya sumber GPU tidak bocor apabila entiti ditamatkan.
