# Pemasa Bulatan {#circle-timer}

Gelang kira detik dengan tanda 25/50/75/100 dan paparan baki saat.

<DemoWidget title="Pemasa bulatan dengan penunjuk kemajuan" src="/demo/values.html" height="420" />

### Komponen a-sxr-circle-timer {#a-sxr-circle-timer-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------           | -------------------------------------------------------   | ------------- |
| font-size          | Saiz fon teks kira detik | 0.2           |
| font-family        | Keluarga fon teks kira detik kemajuan | Outfit-Regular.ttf |
| font-color         | Warna teks kira detik kemajuan | #F1F5F9       |
| border-color       | Warna penunjuk yang menunjukkan kemajuan 25/50/75/100 | #1B1B1F       |
| background-color   | Warna latar belakang item | #202127       |
| active-color       | Warna gelang yang menunjukkan kemajuan kira detik | #2563EB       |
| count-down         | Nilai kira detik awal dalam saat | 10            |
| callback           | Nama fungsi global yang dipanggil apabila kira detik tamat | ''          |
| width              | Lebar item | 1             |
| height             | Tinggi item | 1             |
| margin             | Margin di sekeliling item | 0 0 0 0       |

```html
<a-sxr-circle-timer
	height="0.75"
	count-down="60"
	callback="timedout"
	font-family="Outfit-Regular.woff2"
	margin="0 0 0.1 0"
>
</a-sxr-circle-timer>
```

## Kira detik {#countdown}

Tetapkan tempoh awal dalam saat melalui `count-down`. Gelang berkurangan setelah adegan dimuatkan.

```js
const timer = document.querySelector('a-sxr-circle-timer')
timer.setAttribute('count-down', '30')
```

## Panggil balik tamat tempoh {#expiry-callback}

`callback` menamakan **fungsi global** yang dipanggil apabila kira detik mencapai sifar. Panggil balik tidak menerima argumen:

```js
function timedout() {
  console.log('time is up')
}
```

::: tip Utamakan peristiwa
Panggil balik global mesti wujud pada `window` sebelum adegan dimuatkan — kesilapan ejaan menyebabkan tiada tindakan tanpa amaran. Sebagai alternatif, dengar peristiwa widget itu sendiri. Lihat [Interaksi](/ms/guide/interaction#callbacks-vs-events).
:::

## Tanda senggatan {#tick-marks}

`border-color` mewarnakan tanda penunjuk 25/50/75/100% di sekeliling gelang. Gunakan warna yang berkontras apabila bacaan setiap suku perlu dikenal pasti dengan pantas.
