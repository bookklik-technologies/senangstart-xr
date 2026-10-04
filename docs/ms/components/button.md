# Butang {#button}

Butang standard dengan label teks. Menyokong animasi warna hover/aktif, mod suis pilihan, warna fokus, bucu bulat, serong pilihan dan pengaktifan papan kekunci melalui `Enter` / `Space`.

<DemoWidget title="Butang dalam adegan langsung" src="/demo/controls.html" height="400" />

### Komponen a-sxr-button {#a-sxr-button-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------           | -------------------------------------------------------   | ------------- |
| on                 | Peristiwa yang mencetuskan tindakan onclick | click         |
| value              | Teks label butang |               |
| font-size          | Saiz fon butang | 0.2           |
| font-family        | Keluarga fon butang | Outfit-Regular.ttf |
| font-color         | Warna teks label butang | #F1F5F9       |
| border-color       | Warna sempadan butang | #1B1B1F       |
| focus-color        | Warna fokus butang | #0EA5E9       |
| background-color   | Warna latar belakang butang | #202127       |
| hover-color        | Warna latar belakang apabila penuding berada di atas butang | #0EA5E9       |
| active-color       | Warna latar belakang apabila butang ditekan | #2563EB       |
| toggle             | Jika true, butang bertindak sebagai suis dengan keadaan hidup/mati | false         |
| toggle-state       | Tetapkan keadaan hidup/mati butang suis | false         |
| key                | Kekunci pintasan teks yang mengaktifkan widget (cth. 'e') |               |
| key-code           | Kekunci pintasan angka lama (cth. 32 untuk Space) | -1            |
| width              | Lebar butang | 1             |
| height             | Tinggi butang | 1             |
| depth              | Kedalaman butang | 0.02          |
| base-depth         | Kedalaman tapak butang | 0.01          |
| gap                | Jarak antara butang dengan tapak | 0.025         |
| margin             | Margin di sekeliling butang | 0 0 0 0       |
| radius             | Jejari bucu yang dikongsi oleh keempat-empat bucu butang | 0             |
| bevel              | Jika true, serong butang diaktifkan | false         |
| bevel-segments     | Segmen serong butang | 5             |
| steps              | Langkah serong butang | 2             |
| bevel-size         | Saiz serong butang | 0.1           |
| bevel-offset       | Ofset serong butang | 0             |
| bevel-thickness    | Ketebalan serong butang | 0.1           |

```html
<a-sxr-button
	width="2.5"
	height="0.7"
	base-depth="0.025"
	depth="0.1"
	gap="0.1"

	onclick="buttonActionFunction" key-code="32"
	value="Sample Button"
	font-family="Outfit-Regular.woff2"
	font-size="0.25"
	margin="0 0 0.05 0"

	font-color="black"
	active-color="red"
	hover-color="yellow"
	border-color="white"
	focus-color="black"
	background-color="orange"

	bevel="true"
>
</a-sxr-button>
```

## Bucu bulat {#rounded-corners}

Tetapkan `radius` kepada nilai positif dalam unit adegan untuk membulatkan keempat-empat bucu tapak dan muka butang. Nilai lalai, `0`, mengekalkan rupa segi empat sama. Bucu bulat berfungsi dengan atau tanpa `bevel="true"`.

```html
<a-sxr-button value="Continue" width="2" height="0.6" radius="0.12"></a-sxr-button>
```

Jejari dihadkan kepada separuh dimensi yang lebih kecil; nilai yang lebih besar menghasilkan butang berbentuk pil. Jejari muka dikurangkan sebanyak `gap / 2` untuk mengekalkan sempadan yang seragam. Jejari negatif atau bukan terhingga berkelakuan sebagai `0`.

Anda boleh mengubah `radius`, `width` atau `height` selepas permulaan dan geometri dikemas kini secara automatik:

```js
button.setAttribute('radius', '0.2')
```

## Interaksi {#interaction}

- Klik, atau fokus dan tekan `Enter` / `Space`, untuk mengaktifkan.
- Sifat `on` menamakan peristiwa yang mencetuskan tindakan onclick dan boleh diikat semula selepas permulaan.
- `key` / `key-code` mendaftarkan pintasan global — lihat [Interaksi](/ms/guide/interaction#keyboard-shortcuts).
- Panggil balik ialah nama fungsi global; sebagai alternatif, dengar peristiwa `click` widget itu sendiri.

## Mod suis {#toggle-mode}

Tetapkan `toggle="true"` untuk menjadikan butang kekal hidup atau mati selepas ditekan. Keadaan semasa disimpan dalam `toggle-state`:

```html
<a-sxr-button toggle="true" toggle-state="false" value="Sound"></a-sxr-button>
```

```js
button.setAttribute('toggle-state', 'true')
```
