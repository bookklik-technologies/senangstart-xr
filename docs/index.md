---
layout: home

hero:
  name: SenangStart XR
  text: 3D Interfaces for WebXR
  tagline: GUI components for A-Frame — from desktop pointers to VR controllers.
  image:
    src: /assets/senangstart-xr-logo.svg
    alt: SenangStart XR
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/bookklik-technologies/senangstart-xr

features:
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18v14H3zM3 9h18M8 9v10"/></svg>
    title: 18 A-Frame Components
    details: One HTML primitive per widget — buttons, sliders, toggles and inputs, registered in a single browser bundle.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4zM4 10h16M10 10v10"/></svg>
    title: Flexible Layouts
    details: Arrange widgets in rows and columns with flexbox-style alignment, spacing, rounded panels and inherited styles.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h1m3 0h1m3 0h1M7 14h10"/></svg>
    title: Keyboard & Accessibility
    details: ARIA roles, keyboard activation, arrow-key sliders and radio groups make desktop interaction easier.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>
    title: Multiple Input Methods
    details: Use desktop pointers, mobile gaze fuse and VR controller lasers with the same widgets.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6m-4 9a9 9 0 0 0 15 2l3-3m0 6v-6h-6"/></svg>
    title: Live Attribute Updates
    details: Update dimensions, colors, labels and states after initialization; geometry and text rebuild in place.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m4 16 12-12 4 4L8 20H4zm9-9 4 4M5 4v4M3 6h4m12 9v6m-3-3h6"/></svg>
    title: Design Tokens & Fonts
    details: Style your scenes with shared colors, the bundled Outfit typeface, custom fonts and icon helpers.
---

<style>
  .image-container .VPImage {
    filter: drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.2));
  }
</style>

## Quick Example

```html
<a-sxr-flex-container
  flex-direction="column" justify-content="center" align-items="center"
  width="4" height="3" opacity="0" position="0 1.6 -2">
  <a-sxr-button width="2" height="0.6" value="Hello XR"></a-sxr-button>
</a-sxr-flex-container>
```

Place this panel inside an `<a-scene>` after loading A-Frame and SenangStart XR. The container centers the button in a column, two units in front of the camera.

See [Installation](/guide/getting-started) for scene setup and [Interaction](/guide/interaction) for cursor and controller wiring.
