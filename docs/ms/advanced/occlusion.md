# Oklusi {#occlusion}

Secara lalai teks dan ikon widget **sentiasa dipaparkan di hadapan geometri adegan**. Ini ialah tingkah laku pemaparan lama yang mengekalkan kebolehbacaan label apabila bertindih dengan dinding, model atau UI lain.

Aplikasi yang mahu geometri adegan melindungi label boleh mengaktifkannya bagi setiap widget.

## Mengaktifkan pilihan {#opting-in}

| Sifat | Widget |
| --- | --- |
| `text-occlusion="true"` | [`a-sxr-label`](/ms/components/label) |
| `icon-occlusion="true"` | [`a-sxr-icon-button`](/ms/components/icon-button), [`a-sxr-icon-label-button`](/ms/components/icon-label-button) |

```html
<a-sxr-label value="Behind the wall" text-occlusion="true"></a-sxr-label>
```

## Mengapa ia pilihan {#why-it-is-opt-in}

Mengaktifkan ujian kedalaman mengubah aturan pemaparan seluruh adegan:

| | Lalai (sentiasa di hadapan) | Pilihan (ujian kedalaman) |
| --- | --- | --- |
| `depthTest` | `false` | `true` |
| `renderOrder` (teks) | `1000` | `10` |
| `renderOrder` (ikon) | `1001` | `10` |
| Hasil | Label tidak pernah terlindung oleh geometri | Label terlindung di belakang geometri |

Nilai lalai mengekalkan teks yang boleh dibaca dan dapat dijangka. Mengaktifkan oklusi berguna apabila widget diletakkan *di dalam* kandungan 3D — di belakang pintu atau pada bahagian jauh model — dan menyembunyikannya lebih tepat daripada memaparkannya di hadapan.

## Padanan melalui atur cara {#programmatic-equivalent}

Tingkah laku sama tersedia melalui API pemapar, dengan pilihan bernama `depthTest`:

```js
const label = SXR.createTextEntity({
  value: 'Occluded',
  depthTest: true   // renderOrder becomes 10
})
```

`SXR.redrawTextEntity` dan `SXR.redrawIconEntity` juga menerima `depthTest` dan mengemas kini bahan serta turutan pemaparan pada tempatnya.

## Pertimbangan {#trade-offs}

- **Kebolehbacaan berbanding realisme.** Teks yang sentiasa di hadapan boleh kelihatan terapung di atas dinding. Teks dengan ujian kedalaman boleh tersembunyi dengan cara yang tidak dijangka — label di dalam model mungkin hilang sepenuhnya.
- **Z-fighting.** Label dengan ujian kedalaman yang sesatah dengan permukaan boleh berkelip; alihkannya sedikit melalui `text-depth` atau `position`.
- **Turutan pemaparan.** Entiti dengan ujian kedalaman menggunakan `renderOrder` rendah dan menyertai laluan biasa yang disusun mengikut kedalaman, jadi ia bersaing dengan geometri adegan seperti yang dijangka.
