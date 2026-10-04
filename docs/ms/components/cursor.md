# Kursor {#cursor}

Penuding untuk berinteraksi dengan elemen GUI. Empat reka bentuk tersedia, dan kursor menyokong interaksi pandangan (fuse) untuk mudah alih dan set kepala.

### Komponen a-sxr-cursor {#a-sxr-cursor-component}
#### Sifat {#properties}

| Sifat | Penerangan | Nilai Lalai |
| --------    | -------------------------------------------------------   | ------------- |
| color       | Warna awal kursor | #F1F5F9       |
| hover-color | Warna kursor apabila penuding berada di atas widget | #0EA5E9       |
| active-color| Warna pilihan/aktif kursor | #2563EB       |
| distance    | jarak penuding dari kamera | -1            |
| design      | pilih reka bentuk: 'dot', 'ring', 'cross' atau 'reticle' | 'dot'         |

Primitif `a-sxr-cursor` menyertakan raycaster dengan skop yang ditetapkan secara lalai (`objects: [sxr-interactable]`, `interval: 100`), jadi raycast kursor hanya menyemak widget interaktif dan bukannya seluruh adegan. Gantikannya dengan atribut `raycaster="..."` jika anda memerlukan sasaran lain.

```html
		<!-- Camera + cursor. -->
		<a-entity id="cameraRig" position="0 1.6 0">
			<a-camera look-controls wasd-controls position="0 0 0">
				<a-sxr-cursor id="cursor"
						  fuse="true" fuse-timeout="2000"
						  color="#ECEFF1"
						  hover-color="#CFD8DC"
						  active-color="#607D8B"
						  design="ring" > <!-- dot, ring, reticle, cross  -->
				</a-sxr-cursor> <!-- /cursor -->
			</a-camera> <!-- /camera -->
		</a-entity>
```

## Reka bentuk {#designs}

| `design` | Rupa | Kegunaan biasa |
| --- | --- | --- |
| `dot` | Titik kecil berisi | Penuding ala tetikus desktop |
| `ring` | Gelang kosong | Pandangan dan kegunaan umum |
| `cross` | Palang sasaran | Penuding tepat |
| `reticle` | Retikel dengan lengan | Penyasaran ala VR |

## Pandangan (fuse) {#gaze-fuse}

Tetapkan `fuse="true"` untuk mengaktifkan widget dengan mengekalkan pandangan padanya. `fuse-timeout` mengawal tempoh tersebut dalam milisaat; kursor memaparkan gelang kemajuan sepanjang tempoh pandangan.

```html
<a-sxr-cursor fuse="true" fuse-timeout="1500" design="ring"></a-sxr-cursor>
```

## Menggantikan raycaster {#raycaster-override}

Raycaster lalai sudah dihadkan kepada widget interaktif. Gantikannya apabila anda memerlukan sasaran lain:

```html
		<!-- Camera + cursor. -->
		<a-entity id="cameraRig" position="0 1.6 0">
			<a-camera look-controls wasd-controls position="0 0 0">
				<a-sxr-cursor id="cursor"
						  raycaster="objects: [sxr-interactable]"
						  fuse="false"
				>
				</a-sxr-cursor> <!-- /cursor -->
			</a-camera> <!-- /camera -->
		</a-entity>
```

## Jarak {#distance}

`distance` meletakkan penuding relatif kepada kamera. Nilai lalai `-1` membolehkan kursor berada pada titik persilangan sinar; tetapkan nilai positif untuk menetapkannya pada jarak tetap di hadapan kamera.
