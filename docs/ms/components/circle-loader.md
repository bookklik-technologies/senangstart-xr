# Penunjuk Kemajuan Bulatan {#circle-loader}

Penunjuk berbentuk gelang yang memaparkan peratus di tengahnya.

### Komponen a-sxr-circle-loader {#a-sxr-circle-loader-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------           | -------------------------------------------------------   | ------------- |
| active-color       | Warna gelang yang menunjukkan kemajuan pemuatan | #2563EB       |
| background-color   | Warna latar belakang item | #202127       |
| loaded             | Nilai peratus kemajuan awal | 0.5           |
| font-color         | Warna teks peratus kemajuan | #F1F5F9       |
| font-family        | Keluarga fon teks peratus kemajuan | Outfit-Regular.ttf |
| font-size          | Saiz fon teks peratus kemajuan | 0.2           |
| height             | Tinggi item | 1             |
| width              | Lebar item | 1             |
| margin             | Margin di sekeliling item | 0 0 0 0       |

```html
<a-sxr-circle-loader
	height="0.75"
	font-family="Outfit-Regular.woff2"
	font-size="0.2"
	loaded="0.3456"
	margin="0 0 0.1 0"
	background-color="#999"
>
</a-sxr-circle-loader>
```

## Memuatkan aset {#loading-an-asset}

Kemas kini `loaded` semasa aset dimuat turun:

```js
const loader = document.querySelector('a-sxr-circle-loader')

fetch('/model.glb')
  .then(response => response.body.getReader())
  .then(({ readableStream }) => {
    const total = +response.headers.get('content-length')
    const reader = readableStream.getReader()
    let received = 0

    const pump = () => readableStream && read()
    function read() {
      reader.read().then(({ done, value }) => {
        if (done) { loader.setAttribute('loaded', '1'); return }
        received += value.length
        loader.setAttribute('loaded', String(received / total))
        pump()
      })
    }
    pump()
  })
```

::: tip Nama sifat
Nilai kemajuan widget ini ialah `loaded`, bukannya `percent` — `percent` digunakan oleh [Bar Kemajuan](/ms/components/progress-bar) dan peluncur.
:::
