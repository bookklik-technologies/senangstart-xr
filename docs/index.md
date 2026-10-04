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
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>
    title: 18 A-Frame Components
    details: One HTML primitive per widget — buttons, sliders, toggles and inputs, registered in a single browser bundle.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z M3 9h18 M12 9v12"/></svg>
    title: Flexible Layouts
    details: Arrange widgets in rows and columns with flexbox-style alignment, spacing, rounded panels and inherited styles.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M 2.25 15 h 19.5 v 1.5 a 2.25 2.25 0 0 1 -2.25 2.25 h -15 A 2.25 2.25 0 0 1 2.25 16.5 V 15 Z m 2.25 0 V 6.75 A 2.25 2.25 0 0 1 6.75 4.5 h 10.5 a 2.25 2.25 0 0 1 2.25 2.25 V 15"></path></svg>
    title: Keyboard & Accessibility
    details: ARIA roles, keyboard activation, arrow-key sliders and radio groups make desktop interaction easier.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path></svg>
    title: Multiple Input Methods
    details: Use desktop pointers, mobile gaze fuse and VR controller lasers with the same widgets.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>
    title: Live Attribute Updates
    details: Update dimensions, colors, labels and states after initialization; geometry and text rebuild in place.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-3M12 21v-5M9 21l-6 0L8 21v-8H20V20a1 1 180 01-1 1zM20 13a1 1 180 001-1v-1a2 2 180 00-2-2h-2a1 1 180 01-1-1v-2.9a2 2 180 10-4 0V8a1 1 180 01-1 1h-2a2 2 180 00-2 2v1a1 1 180 001 1"></path></svg>
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
