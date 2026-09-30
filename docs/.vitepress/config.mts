import { defineConfig } from 'vitepress'

const repoName = 'senangstart-xr'

export default defineConfig({
  base: `/${repoName}/`,
  lang: 'en-US',
  title: 'SenangStart XR',
  titleTemplate: ':title — SenangStart XR',
  description: '3D GUI components for A-Frame / WebXR',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/senangstart-xr/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#2563EB' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'SenangStart XR',
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'Components', link: '/components/button', activeMatch: '/components/' },
      { text: 'API', link: '/api/sxr-namespace', activeMatch: '/api/' },
      { text: 'Advanced', link: '/advanced/live-updates', activeMatch: '/advanced/' },
      {
        text: 'Resources',
        items: [
          { text: 'Showcase Example', link: 'https://github.com/bookklik-technologies/senangstart-xr/blob/main/examples/index.html' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@bookklik/senangstart-xr' },
          { text: 'Changelog', link: 'https://github.com/bookklik-technologies/senangstart-xr/releases' },
          { text: 'Report an Issue', link: 'https://github.com/bookklik-technologies/senangstart-xr/issues' }
        ]
      }
    ],
    sidebar: {
      '/guide/': sidebarGuide(),
      '/components/': sidebarComponents(),
      '/api/': sidebarApi(),
      '/advanced/': sidebarAdvanced()
    },
    outline: { level: [2, 3], label: 'On this page' },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Search docs', buttonAriaLabel: 'Search docs' },
          modal: {
            noResultsText: 'No results found',
            resetButtonTitle: 'Clear search',
            displayDetails: 'Display list',
            footer: { selectText: 'to select', navigateText: 'to navigate', closeText: 'to close' }
          }
        }
      }
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bookklik-technologies/senangstart-xr' }
    ],
    editLink: {
      pattern: 'https://github.com/bookklik-technologies/senangstart-xr/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Bookklik Technologies'
    },
    docFooter: { prev: 'Previous', next: 'Next' },
    lastUpdated: true
  },
  markdown: {
    lineNumbers: false,
    anchor: { permalink: true }
  },
  srcDir: '.'
})

function sidebarGuide() {
  return [
    {
      text: 'Getting Started',
      collapsed: false,
      items: [
        { text: 'Introduction', link: '/' },
        { text: 'Installation', link: '/guide/getting-started' },
        { text: 'A-Frame Versions', link: '/guide/aframe-versions' }
      ]
    },
    {
      text: 'Essentials',
      collapsed: false,
      items: [
        { text: 'Layout with Flex Container', link: '/guide/layout' },
        { text: 'Interaction', link: '/guide/interaction' },
        { text: 'Styling & Fonts', link: '/guide/styling' },
        { text: 'Accessibility', link: '/guide/accessibility' }
      ]
    }
  ]
}

function sidebarApi() {
  return [
    {
      text: 'API Reference',
      collapsed: false,
      items: [
        { text: 'SXR Namespace', link: '/api/sxr-namespace' },
        { text: 'Colors', link: '/api/colors' },
        { text: 'Fonts', link: '/api/fonts' },
        { text: 'Icons', link: '/api/icons' }
      ]
    }
  ]
}

function sidebarComponents() {
  return [
    {
      text: 'Overview',
      collapsed: false,
      items: [
        { text: 'All Components', link: '/components/' }
      ]
    },
    {
      text: 'Basics',
      collapsed: false,
      items: [
        { text: 'Flex Container', link: '/components/flex-container' },
        { text: 'Label', link: '/components/label' },
        { text: 'Cursor', link: '/components/cursor' }
      ]
    },
    {
      text: 'Buttons & Toggles',
      collapsed: false,
      items: [
        { text: 'Button', link: '/components/button' },
        { text: 'Icon Button', link: '/components/icon-button' },
        { text: 'Icon Label Button', link: '/components/icon-label-button' },
        { text: 'Toggle', link: '/components/toggle' },
        { text: 'Radio', link: '/components/radio' }
      ]
    },
    {
      text: 'Values & Progress',
      collapsed: false,
      items: [
        { text: 'Slider', link: '/components/slider' },
        { text: 'Vertical Slider', link: '/components/vertical-slider' },
        { text: 'Input', link: '/components/input' },
        { text: 'Progress Bar', link: '/components/progress-bar' },
        { text: 'Circle Loader', link: '/components/circle-loader' },
        { text: 'Circle Timer', link: '/components/circle-timer' }
      ]
    },
    {
      text: 'Building Blocks',
      collapsed: false,
      items: [
        { text: 'Item & Interactable', link: '/components/item' },
        { text: 'Rounded Panel', link: '/components/rounded' }
      ]
    }
  ]
}

function sidebarAdvanced() {
  return [
    {
      text: 'Advanced',
      collapsed: false,
      items: [
        { text: 'Live Attribute Updates', link: '/advanced/live-updates' },
        { text: 'Occlusion', link: '/advanced/occlusion' },
        { text: 'Build & CI', link: '/advanced/build-and-ci' }
      ]
    }
  ]
}
