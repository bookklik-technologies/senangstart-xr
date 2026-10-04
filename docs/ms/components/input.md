# Input {#input}

Medan input teks. Secara lalai medan dipaparkan melalui kanvas dan dikemas kini melalui atur cara; penyuntingan asli pilihan membolehkan penggunaan papan kekunci sebenar dengan sokongan tampalan dan IME.

### Komponen a-sxr-input {#a-sxr-input-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------           | ----------------------------------------------------  | -------------  |
| onclick            | Fungsi yang dipanggil pada peristiwa klik |                |
| onhover            | Fungsi yang dipanggil pada peristiwa hover |                |
| value              | Nilai teks input |                |
| native-editing     | Pilihan: pengaktifan memfokuskan medan teks asli yang disegerakkan; mengeluarkan `input` pada perubahan dan `change` apabila disahkan | false |
| key                | Kekunci pintasan teks yang mengaktifkan widget (cth. 'e') |            |
| key-code           | Kekunci pintasan angka lama (cth. 32 untuk Space) | -1            |
| font-size          | Saiz fon input | 0.2            |
| font-family        | Keluarga fon input | Outfit-Regular.ttf |
| font-color         | Warna teks input | #161618        |
| border-color       | Warna sempadan input | #1B1B1F        |
| background-color   | Warna latar belakang input | #F1F5F9        |
| border-hover-color | Warna sempadan apabila penuding berada di atas input | #0EA5E9        |
| hover-color        | Warna latar belakang apabila penuding berada di atas input | #F1F5F9        |
| margin             | Margin di sekeliling item | 0 0 0 0        |
| height             | Tinggi item | 1              |
| width              | Lebar item | 1              |

```html
<a-sxr-input
	width="2.5" height="0.75"
	onclick="inputActionFunction"
	font-family="Outfit-Regular.woff2"
	font-size="0.2"
	value="Hello Wor_"
	margin="0 0 0.05 0"
>
</a-sxr-input>
```

## Penyuntingan melalui atur cara {#programmatic-editing}

Tanpa penyuntingan asli, medan dikawal melalui JavaScript:

```js
const input = document.querySelector('a-sxr-input')

input.appendText('ld')     // append characters
input.delete()             // delete backwards (backspace)
input.setAttribute('value', 'Hello World')
```

## Penyuntingan teks asli (pilihan) {#native-text-editing-opt-in}

Secara lalai input ialah medan yang dipaparkan melalui kanvas dan dikemas kini melalui atur cara (`appendText()`, `delete()` atau atribut `value`). Menambah `native-editing="true"` menyebabkan pengaktifan (klik / papan kekunci) memfokuskan `<input>` asli berlabel yang tersembunyi secara visual dan disegerakkan dengan widget: menaip, pergerakan karet/pilihan melalui kekunci anak panah, tampalan dan komposisi IME semuanya berfungsi dengan papan kekunci sebenar. Peristiwa `input` berlaku apabila teks berubah, dan `change` berlaku apabila disahkan (`Enter` atau kehilangan fokus), sekali bagi setiap nilai yang berubah. Menetapkan `native-editing="false"` mengesahkan suntingan tertunda dan menyingkirkan medan asli.

```html
<a-sxr-input width="2.8" height="0.5"
	native-editing="true"
	value="Type here"
	margin="0 0 0.05 0">
</a-sxr-input>
```

```js
input.addEventListener('input', (e) => console.log('typing', e.detail.value))
input.addEventListener('change', (e) => console.log('committed', e.detail.value))
```

::: tip Fokus desktop
Input teks imersif (VR) masih disediakan oleh aplikasi; pilihan ini menyasarkan penggunaan papan kekunci desktop. Keluaran ini tidak menyertakan papan kekunci maya Quest.
:::
