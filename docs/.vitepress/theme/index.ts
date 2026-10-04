import { h } from 'vue'
import { withBase } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'

/**
 * Embeds a live A-Frame scene from docs/public/demo as an iframe.
 * Usage: <DemoWidget src="/demo/controls.html" height="420" />
 */
const DemoWidget = {
  name: 'DemoWidget',
  props: {
    src: { type: String, required: true },
    height: { type: String, default: '420' },
    title: { type: String, default: 'Live demo' }
  },
  setup(props) {
    return () =>
      h('div', { class: 'demo-widget' }, [
        h('iframe', {
          src: withBase(props.src),
          title: props.title,
          height: props.height,
          loading: 'lazy',
          allow: 'xr-spatial-tracking; fullscreen; accelerometer; gyroscope; magnetometer'
        })
      ])
  }
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoWidget', DemoWidget)
  }
}
