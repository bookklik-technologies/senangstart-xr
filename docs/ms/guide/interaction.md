# Interaksi {#interaction}

<DemoWidget title="Kawalan interaktif: klik, papan kekunci dan fuse" src="/demo/controls.html" height="400" />

## Panggil balik berbanding peristiwa {#callbacks-vs-events}

Panggil balik (`onclick`, `onhover`, `callback`) ialah **nama fungsi global** yang dicari pada `window` apabila peristiwa berlaku. Takrifkannya sebelum adegan dimuatkan — kesilapan ejaan menyebabkan tiada tindakan tanpa amaran.

```html
<a-sxr-button value="Press me" onclick="handleClick"></a-sxr-button>

<script>
  function handleClick(event) {
    console.log('clicked', event)
  }
</script>
```

Integrasi moden boleh mengelakkan fungsi global sepenuhnya dan mendengar peristiwa widget itu sendiri:

```js
document.querySelector('a-sxr-button')
  .addEventListener('click', (event) => console.log('clicked', event))
```

| Peristiwa | Butiran | Dikeluarkan oleh |
| --- | --- | --- |
| `click` | Peristiwa DOM/A-Frame asal | Semua widget interaktif |
| `input` | `{ value }` semasa nilai berubah | `a-sxr-input` (penyuntingan asli) |
| `change` | `{ value }` apabila disahkan | `a-sxr-input` (penyuntingan asli) |
| `hovergui` / `leavegui` | Kursor masuk/keluar | `a-sxr-cursor` |

### Tandatangan panggil balik {#callback-signatures}

| Widget | Tandatangan |
| --- | --- |
| [Peluncur](/ms/components/slider) | `(event, percent)` |
| [Peluncur Menegak](/ms/components/vertical-slider) | `(percent)` — untuk pengaktifan penuding dan papan kekunci |
| [Pemasa Bulatan](/ms/components/circle-timer) | `()` apabila kira detik tamat |

### Nama peristiwa pengaktifan {#activation-event-names}

Sifat `on` menamakan peristiwa yang mencetuskan tindakan onclick. Ia boleh diubah selepas permulaan dan pendengar diikat semula kepada nama baharu.

## Pintasan papan kekunci {#keyboard-shortcuts}

Setiap widget interaktif menerima pintasan:

| Sifat | Tujuan |
| --- | --- |
| `key` | Kekunci pintasan teks yang mengaktifkan widget (cth. `e`) |
| `key-code` | Kekunci pintasan angka lama (cth. `32` untuk Space) |

- Pengaktifan papan kekunci didaftarkan **bagi setiap widget**; mengikat kekunci sama kepada beberapa widget mengaktifkan semuanya.
- Pintasan diabaikan semasa pengguna menaip dalam medan teks, semasa komposisi IME dan bagi tekanan kekunci berulang automatik.
- `key="e"` berfungsi secara bebas daripada `key-code="32"` angka lama. Apabila kekunci pintasan widget sepadan dengan tekanan kekunci yang difokuskan, hanya pintasan diaktifkan (tiada pengaktifan berganda).

## Operasi papan kekunci (desktop) {#keyboard-operation-desktop}

Apabila widget mempunyai fokus DOM (klik padanya, atau gunakan Tab):

| Widget | Kekunci |
| --- | --- |
| Butang | `Enter` / `Space` mengaktifkan |
| Suis | `Enter` / `Space` menukar keadaan (widget yang dinyahaktifkan mengabaikannya) |
| Butang radio | `Space` memilih; kekunci anak panah bergerak melalui kumpulan |
| Peluncur | `←`/`→` (dan `↑`/`↓`) mengubah sebanyak `keyboard-step`; `Home`/`End` melompat ke 0/1 |
| Peluncur menegak | `↑`/`↓` (dan `←`/`→`) mengubah sebanyak `keyboard-step`; `Home`/`End` melompat ke 0/1 |
| Input | `Enter` / `Space` mengaktifkan; penyuntingan asli memerlukan `native-editing="true"` |

## Kursor {#cursor}

`a-sxr-cursor` menyediakan penuding untuk berinteraksi dengan elemen GUI. Ia mempunyai empat reka bentuk — `dot`, `ring`, `cross` dan `reticle`.

```html
<a-entity id="cameraRig" position="0 1.6 0">
  <a-camera look-controls wasd-controls position="0 0 0">
    <a-sxr-cursor id="cursor"
                  fuse="true" fuse-timeout="2000"
                  color="#ECEFF1"
                  hover-color="#CFD8DC"
                  active-color="#607D8B"
                  design="ring">
    </a-sxr-cursor>
  </a-camera>
</a-entity>
```

Primitif menyertakan **raycaster dengan skop yang ditetapkan** secara lalai (`objects: [sxr-interactable]`, `interval: 100`), jadi raycast kursor hanya menyemak widget interaktif dan bukannya seluruh adegan. Gantikannya dengan atribut `raycaster="..."` jika anda memerlukan sasaran lain.

```html
<a-sxr-cursor
  raycaster="objects: [sxr-interactable]"
  fuse="false">
</a-sxr-cursor>
```

## Pengawal VR {#vr-controllers}

Widget terus berfungsi dengan raycaster berasaskan pengawal A-Frame — peristiwa `click` pengawal membawa persilangan sinar, jadi peluncur dan input bertindak balas pada titik tepat:

```html
<a-entity id="leftHand" laser-controls="hand: left"
          raycaster="objects: [sxr-interactable]"></a-entity>
<a-entity id="rightHand" laser-controls="hand: right"
          raycaster="objects: [sxr-interactable]"></a-entity>
```

Gunakan komponen [`raycaster-origin`](https://aframe.io/docs/core/components/raycaster.html) A-Frame pada entiti pengawal untuk mengalihkan asal sinar (cth. ke hujung model pengawal).

::: tip Mengapa `[sxr-interactable]`?
Setiap widget interaktif membawa komponen `sxr-interactable`. Menghadkan raycaster kepada pemilih tersebut mengekalkan prestasi penuding VR tanpa bergantung pada kerumitan adegan.
:::
