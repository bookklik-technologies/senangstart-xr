import { defineConfig } from 'vitepress'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { version } = require('../../package.json')
const github = 'https://github.com/bookklik-technologies/senangstart-xr'
const sections: Record<string, [string, [string, string][]][]> = {
  "/guide/": [
    ["Getting Started",[["Introduction","/"],["Installation","/guide/getting-started"],["A-Frame Versions","/guide/aframe-versions"]]],
    ["Essentials",[["Layout with Flex Container","/guide/layout"],["Interaction","/guide/interaction"],["Styling & Fonts","/guide/styling"],["Accessibility","/guide/accessibility"]]]
  ],
  "/components/": [
    ["Overview",[["All Components","/components/"]]],
    ["Basics",[["Flex Container","/components/flex-container"],["Label","/components/label"],["Cursor","/components/cursor"]]],
    ["Buttons & Toggles",[["Button","/components/button"],["Icon Button","/components/icon-button"],["Icon Label Button","/components/icon-label-button"],["Toggle","/components/toggle"],["Radio","/components/radio"]]],
    ["Values & Progress",[["Slider","/components/slider"],["Vertical Slider","/components/vertical-slider"],["Input","/components/input"],["Progress Bar","/components/progress-bar"],["Circle Loader","/components/circle-loader"],["Circle Timer","/components/circle-timer"]]],
    ["Building Blocks",[["Item & Interactable","/components/item"],["Rounded Panel","/components/rounded"]]]
  ],
  "/api/": [
    ["API Reference",[["SXR Namespace","/api/sxr-namespace"],["Colors","/api/colors"],["Fonts","/api/fonts"],["Icons","/api/icons"]]]
  ],
  "/advanced/": [
    ["Advanced",[["Live Attribute Updates","/advanced/live-updates"],["Occlusion","/advanced/occlusion"],["Build & CI","/advanced/build-and-ci"]]]
  ]
}
const msLabels: Record<string, string> = {
  "Home": "Utama",
  "Guide": "Panduan",
  "Components": "Komponen",
  "Advanced": "Lanjutan",
  "Resources": "Sumber",
  "Showcase Example": "Contoh Pameran",
  "Changelog": "Log Perubahan",
  "Report an Issue": "Laporkan Isu",
  "Getting Started": "Bermula",
  "Introduction": "Pengenalan",
  "Installation": "Pemasangan",
  "A-Frame Versions": "Versi A-Frame",
  "Essentials": "Asas",
  "Layout with Flex Container": "Susun Atur dengan Bekas Flex",
  "Interaction": "Interaksi",
  "Styling & Fonts": "Gaya & Fon",
  "Accessibility": "Kebolehcapaian",
  "API Reference": "Rujukan API",
  "SXR Namespace": "Ruang Nama SXR",
  "Colors": "Warna",
  "Fonts": "Fon",
  "Icons": "Ikon",
  "Overview": "Gambaran Keseluruhan",
  "All Components": "Semua Komponen",
  "Basics": "Asas",
  "Flex Container": "Bekas Flex",
  "Label": "Label",
  "Cursor": "Kursor",
  "Buttons & Toggles": "Butang & Suis",
  "Button": "Butang",
  "Icon Button": "Butang Ikon",
  "Icon Label Button": "Butang Ikon dan Label",
  "Toggle": "Suis",
  "Radio": "Butang Radio",
  "Values & Progress": "Nilai & Kemajuan",
  "Slider": "Peluncur",
  "Vertical Slider": "Peluncur Menegak",
  "Input": "Input",
  "Progress Bar": "Bar Kemajuan",
  "Circle Loader": "Penunjuk Kemajuan Bulatan",
  "Circle Timer": "Pemasa Bulatan",
  "Building Blocks": "Blok Binaan",
  "Item & Interactable": "Item & Interaksi",
  "Rounded Panel": "Panel Berbucu Bulat",
  "Live Attribute Updates": "Kemas Kini Atribut Secara Langsung",
  "Occlusion": "Oklusi",
  "Build & CI": "Binaan & CI"
}

function localeTheme(malay: boolean) {
  const prefix = malay ? '/ms' : ''
  const label = (text: string) => malay ? (msLabels[text] ?? text) : text
  const link = (text: string, target: string) => ({ text: label(text), link: target.startsWith('/') ? prefix + target : target })
  const route = (text: string, target: string, match: string) => ({ ...link(text, target), activeMatch: prefix + match })
  return {
    nav: [
      link('Home', '/'),
      route('Guide', '/guide/getting-started', '/guide/'),
      route('Components', '/components/', '/components/'),
      route('API', '/api/sxr-namespace', '/api/'),
      route('Advanced', '/advanced/live-updates', '/advanced/'),
      { text: label('Resources'), items: [
        link('Showcase Example', github + '/blob/main/examples/index.html'),
        link('npm', 'https://www.npmjs.com/package/@bookklik/senangstart-xr'),
        link('Report an Issue', github + '/issues')
      ] },
      { text: 'v' + version, items: [link('Changelog', github + '/releases'), link('GitHub', github)] }
    ],
    sidebar: Object.fromEntries(Object.entries(sections).map(([path, groups]) => [prefix + path,
      groups.map(([text, items]) => ({ text: label(text), collapsed: false, items: items.map(([text, target]) => link(text, target)) }))
    ])),
    outline: { level: [2, 3] as [number, number], label: malay ? 'Pada halaman ini' : 'On this page' },
    editLink: { pattern: github + '/edit/main/docs/:path', text: malay ? 'Sunting halaman ini di GitHub' : 'Edit this page on GitHub' },
    footer: {
      message: malay
        ? 'SenangStart XR v' + version + ' ialah sebahagian daripada ekosistem <a href="https://senangstart.com/">SenangStart</a>.'
        : 'SenangStart XR v' + version + ' is part of the <a href="https://senangstart.com/">SenangStart</a> ecosystem.',
      copyright: 'Copyright © ' + new Date().getFullYear() + ' <a href="https://bookklik.com/" class="bookklik-link">Bookklik Technologies</a>. ' + (malay ? 'Dikeluarkan di bawah Lesen MIT.' : 'Released under the MIT License.')
    },
    docFooter: { prev: malay ? 'Sebelumnya' : 'Previous', next: malay ? 'Seterusnya' : 'Next' },
    lastUpdated: { text: malay ? 'Dikemas kini pada' : 'Last updated' },
    langMenuLabel: malay ? 'Tukar bahasa' : 'Change language',
    returnToTopLabel: malay ? 'Kembali ke atas' : 'Return to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: malay ? 'Tema' : 'Appearance',
    lightModeSwitchTitle: malay ? 'Tukar kepada tema cerah' : 'Switch to light theme',
    darkModeSwitchTitle: malay ? 'Tukar kepada tema gelap' : 'Switch to dark theme',
    skipToContentLabel: malay ? 'Langkau ke kandungan' : 'Skip to content',
    notFound: {
      title: malay ? 'HALAMAN TIDAK DITEMUKAN' : 'PAGE NOT FOUND',
      quote: malay ? 'Halaman yang anda cari tidak tersedia.' : 'The page you are looking for is unavailable.',
      linkLabel: malay ? 'Pergi ke halaman utama' : 'Go to home',
      linkText: malay ? 'Kembali ke halaman utama' : 'Take me home'
    }
  }
}

const msSearchTranslations = {
  button: { buttonText: 'Cari dokumentasi', buttonAriaLabel: 'Cari dokumentasi' },
  modal: {
    noResultsText: 'Tiada hasil ditemukan', resetButtonTitle: 'Kosongkan carian',
    backButtonTitle: 'Kembali', displayDetails: 'Paparkan butiran',
    footer: {
      selectText: 'untuk memilih', selectKeyAriaLabel: 'Kekunci Enter',
      navigateText: 'untuk menavigasi', navigateUpKeyAriaLabel: 'Kekunci anak panah atas',
      navigateDownKeyAriaLabel: 'Kekunci anak panah bawah',
      closeText: 'untuk menutup', closeKeyAriaLabel: 'Kekunci Escape'
    }
  }
}

export default defineConfig({
  base: '/senangstart-xr/',
  appearance: true,
  lastUpdated: true,
  title: 'SenangStart XR',
  titleTemplate: ':title — SenangStart XR',
  description: '3D GUI components for A-Frame / WebXR',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/senangstart-xr/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#2563EB' }]
  ],
  locales: {
    root: { label: 'English', lang: 'en', themeConfig: localeTheme(false) },
    ms: { label: 'Bahasa Melayu', lang: 'ms', description: 'Komponen GUI 3D untuk A-Frame / WebXR', themeConfig: localeTheme(true) }
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'SenangStart XR',
    socialLinks: [{ icon: 'github', link: github }],
    search: { provider: 'local', options: {
      translations: {
        button: { buttonText: 'Search docs', buttonAriaLabel: 'Search docs' },
        modal: { noResultsText: 'No results found', resetButtonTitle: 'Clear search', displayDetails: 'Display list',
          footer: { selectText: 'to select', navigateText: 'to navigate', closeText: 'to close' } }
      },
      locales: { ms: { translations: msSearchTranslations } }
    } }
  },
  markdown: {
    lineNumbers: false,
    config(md) {
      const fence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, index, options, env, self) => {
        const html = fence(tokens, index, options, env, self)
        return env.relativePath?.startsWith('ms/')
          ? html.replace('title="Copy Code"', 'title="Salin kod"') : html
      }
      const linkOpen = md.renderer.rules.link_open
      md.renderer.rules.link_open = (tokens, index, options, env, self) => {
        const token = tokens[index]
        if (env.relativePath?.startsWith('ms/') && token.attrGet('class') === 'header-anchor') {
          token.attrSet('aria-label', token.attrGet('aria-label')!.replace('Permalink to', 'Pautan kekal ke'))
        }
        return linkOpen ? linkOpen(tokens, index, options, env, self) : self.renderToken(tokens, index, options)
      }
    }
  },
  srcDir: '.'
})
