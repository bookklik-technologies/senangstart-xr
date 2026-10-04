# Susun Atur dengan Bekas Flex {#layout-with-flex-container}

`a-sxr-flex-container` menyusun widget anak dalam panel 3D menggunakan enjin susun atur yang diilhamkan oleh flexbox.

<DemoWidget title="Susun atur bekas flex dan pewarisan gaya" src="/demo/layout.html" height="420" />

::: warning Nilai lalai `opacity`
Nilai lalai `opacity` bekas ialah `0.0`, jadi bekas yang baru ditambah tidak kelihatan. Tetapkan `opacity` kepada nilai antara `0` dengan `1` untuk melihat panel.
:::

## Penggunaan asas {#basic-usage}

```html
<a-sxr-flex-container
    flex-direction="column" justify-content="center" align-items="center"
    item-padding="0.1" opacity="0.7" width="3.5" height="4.5"
    panel-color="#072B73"
    panel-rounded="0.2"
    position="0 2.5 -6" rotation="0 0 0"
>
  ... gui items here...
</a-sxr-flex-container>
```

## Arah dan pembahagian {#direction-and-distribution}

| Sifat | Tujuan |
| --- | --- |
| `flex-direction` | Paksi utama: `row` atau `column` |
| `justify-content` | Pembahagian sepanjang paksi utama: `flexStart`, `center`, `flexEnd` |
| `align-items` | Pembahagian sepanjang paksi silang (berserenjang dengan `justify-content`) |
| `item-padding` | Jarak antara anak |

Anak **disusun semula secara automatik** selepas penyisipan, penyingkiran, perubahan saiz atau perubahan susun atur lain — `MutationObserver` bersama debounce mengendalikannya, jadi penambahan atau penyingkiran widget melalui atur cara mengekalkan panel yang betul.

## Latar belakang panel {#panel-background}

| Sifat | Tujuan |
| --- | --- |
| `is-top-container` | Memaparkan latar belakang panel bekas itu sendiri |
| `panel-color` | Warna latar belakang panel |
| `panel-rounded` | Jejari bucu panel |

## Pewarisan gaya {#style-inheritance}

Bekas juga bertindak sebagai skop tema. Sifat gayanya diwarisi oleh widget anak yang tidak mentakrifkan nilai sendiri:

`font-family`, `font-color`, `border-color`, `background-color`, `hover-color`, `active-color`, `handle-color`

```html
<a-sxr-flex-container
  font-family="Outfit-Regular.ttf"
  font-color="#F1F5F9"
  hover-color="#0EA5E9"
  active-color="#2563EB"
  opacity="1" width="4" height="3">
  <a-sxr-button width="2" height="0.6" value="Inherits hover and active"></a-sxr-button>
</a-sxr-flex-container>
```

### Objek gaya lama {#legacy-style-objects}

Atribut gaya bekas dipetakan kepada sifat komponen rata (`fontColor`, `fontFamily`, …). Bentuk objek lama melalui atur cara masih disokong:

```js
el.setAttribute('sxr-flex-container', 'styles', { fontColor: '#fff' })
```

Sifat bekas yang ditetapkan secara jelas **mengatasi** nilai objek lama. Gaya warisan terus dikemas kini sehingga anak menetapkan nilai gayanya sendiri.

## Kemas kini secara langsung {#live-updates}

Sifat susun atur boleh diubah selepas permulaan. Anak disusun semula serta-merta, termasuk selepas penyisipan dan penyingkiran anak melalui atur cara — lihat [Kemas Kini Atribut Secara Langsung](/ms/advanced/live-updates).
