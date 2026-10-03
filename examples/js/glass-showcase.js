'use strict';

// A soft environment gives translucent WebGL surfaces something to reveal.
AFRAME.registerShader('showcase-atmosphere', {
    vertexShader: `
        varying vec2 vUV;
        void main() {
            vUV = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUV;
        void main() {
            vec2 p = vUV;
            vec3 color = vec3(0.026, 0.039, 0.078);
            float blue = exp(-dot((p - vec2(0.29, 0.56)) * vec2(4.3, 3.8),
                                 (p - vec2(0.29, 0.56)) * vec2(4.3, 3.8)));
            float violet = exp(-dot((p - vec2(0.73, 0.63)) * vec2(4.6, 4.1),
                                   (p - vec2(0.73, 0.63)) * vec2(4.6, 4.1)));
            float cyan = exp(-dot((p - vec2(0.51, 0.25)) * vec2(5.5, 5.0),
                                 (p - vec2(0.51, 0.25)) * vec2(5.5, 5.0)));
            float ribbon = exp(-pow((p.y - 0.38 - sin(p.x * 5.2) * 0.11) * 17.0, 2.0));
            color += blue * vec3(0.025, 0.14, 0.32);
            color += violet * vec3(0.17, 0.055, 0.25);
            color += cyan * vec3(0.012, 0.08, 0.10);
            color += ribbon * vec3(0.014, 0.024, 0.047);
            gl_FragColor = vec4(color, 1.0);
        }
    `
});

AFRAME.registerComponent('showcase-shadow', {
    dependencies: ['rounded'],
    init: function () {
        const THREE = AFRAME.THREE;
        this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {size: {value: new THREE.Vector2()}, radius: {value: 0.26}},
            vertexShader: `
                varying vec2 vUV;
                void main() {
                    vUV = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec2 size;
                uniform float radius;
                varying vec2 vUV;
                void main() {
                    vec2 p = (vUV - 0.5) * (size + 0.8);
                    vec2 q = abs(p) - size * 0.5 + radius;
                    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
                    float alpha = (1.0 - smoothstep(-0.04, 0.38, d)) * 0.28;
                    gl_FragColor = vec4(0.005, 0.009, 0.025, alpha);
                }
            `
        }));
        this.shadow.position.set(0, -0.08, -0.025);
        this.shadow.renderOrder = -110;
        // Object3D decoration does not become a flex item or an interaction target.
        this.shadow.raycast = function () {};
        this.el.setObject3D('showcase-shadow', this.shadow);
        this._resize = () => {
            const data = this.el.components.rounded.data;
            this.shadow.scale.set(data.width + 0.8, data.height + 0.8, 1);
            this.shadow.material.uniforms.size.value.set(data.width, data.height);
            this.shadow.material.uniforms.radius.value = data.radius;
        };
        this._onChanged = event => {
            if (event.detail.name === 'rounded') this._resize();
        };
        this.el.addEventListener('componentchanged', this._onChanged);
        this._resize();
    },
    remove: function () {
        this.el.removeEventListener('componentchanged', this._onChanged);
        this.el.removeObject3D('showcase-shadow');
        this.shadow.geometry.dispose();
        this.shadow.material.dispose();
    }
});

AFRAME.registerComponent('glass-showcase', {
    init: function () {
        this._nextScan = 0;
        this._decorated = new Set();
        this._hidden = new Map();
        this._onLoaded = () => this._applyTheme();
        this.el.addEventListener('loaded', this._onLoaded);
    },
    tick: function (time) {
        if (time < this._nextScan) return;
        this._nextScan = time + 300;
        // Widgets may rebuild owned entities when their dimensions change.
        this._applyTheme();
    },
    _glass: function (el, options) {
        if (!el || el.hasAttribute('sxr-glass')) return;
        el.setAttribute('sxr-glass', options);
        this._decorated.add(el);
    },
    _hide: function (el) {
        if (!el || this._hidden.has(el)) return;
        this._hidden.set(el, el.object3D.visible);
        el.object3D.visible = false;
    },
    _applyTheme: function () {
        const surface = {opacity: 0.46, frost: 0.12, radius: 0.13, edge: 0.008};
        const accent = {opacity: 0.94, frost: 0.02, radius: 0.15, edge: 0.007};
        const pearl = {opacity: 0.98, frost: 0.09, radius: 1, edge: 0.004, axis: 'xz'};
        this.el.querySelectorAll('[is-top-container="true"]').forEach(el => {
            const panel = el.components['sxr-flex-container'];
            if (!panel || !panel.panelBackground) return;
            this._glass(panel.panelBackground, {opacity: 0.26, frost: 0.13, radius: 0.26, edge: 0.009});
            if (!panel.panelBackground.hasAttribute('showcase-shadow')) {
                panel.panelBackground.setAttribute('showcase-shadow', '');
            }
        });
        this.el.querySelectorAll('a-sxr-button, a-sxr-icon-button, a-sxr-icon-label-button').forEach(el => {
            const name = el.tagName.toLowerCase().replace('a-', '');
            const widget = el.components[name];
            if (!widget) return;
            const isPrimary = el.hasAttribute('bevel');
            const circular = name === 'sxr-icon-button';
            this._glass(widget.buttonEntity, {
                ...(isPrimary ? accent : surface),
                ...(circular ? {axis: 'xz', radius: 1, opacity: 0.58} : {})
            });
            this._glass(widget.buttonContainer, {
                ...surface, opacity: isPrimary ? 0.28 : 0.12,
                ...(circular ? {axis: 'xz', radius: 1} : {})
            });
            this._glass(widget.buttonBacking, {...surface, opacity: 0.16});
            // The icon-label widget's root plane would square off its glass face.
            if (name === 'sxr-icon-label-button') this._glass(el, {...surface, opacity: 0.08});
        });
        this.el.querySelectorAll('a-sxr-input').forEach(el => {
            const widget = el.components['sxr-input'];
            if (!widget) return;
            this._glass(el, {...surface, opacity: 0.45, radius: 0.11});
            ['borderTopEntity', 'borderBottomEntity', 'borderLeftEntity', 'borderRightEntity']
                .forEach(key => this._hide(widget[key]));
        });
        this.el.querySelectorAll('a-sxr-toggle').forEach(el => {
            const widget = el.components['sxr-toggle'];
            if (!widget) return;
            this._glass(widget.toggleTrack, {...surface, opacity: 0.72, radius: 1});
            this._glass(widget.toggleHandle, {...pearl, axis: 'xy'});
        });
        this.el.querySelectorAll('a-sxr-radio').forEach(el => {
            const widget = el.components['sxr-radio'];
            if (!widget) return;
            this._glass(widget.radioBox, {...pearl, opacity: 0.34});
            this._glass(widget.radioBorder, {...pearl, opacity: 0.65, axis: 'xy'});
            this._glass(widget.radioCenter, pearl);
        });
        this.el.querySelectorAll('a-sxr-slider, a-sxr-vertical-slider').forEach(el => {
            const widget = el.components[el.tagName.toLowerCase().replace('a-', '')];
            if (!widget) return;
            this._glass(el, {...surface, opacity: 0.17, radius: 0.14});
            this._glass(widget.sliderBar, {...surface, opacity: 0.5, radius: 1, edge: 0.003});
            this._glass(widget.sliderActiveBar, {...accent, radius: 1, edge: 0.003});
            this._glass(widget.handleContainer, {...pearl, opacity: 0.26});
            this._glass(widget.handle, pearl);
            this._glass(widget.valueLabel, {...surface, opacity: 0.32, radius: 0.12});
        });
        this.el.querySelectorAll('a-sxr-circle-loader, a-sxr-circle-timer').forEach(el => {
            const widget = el.components[el.tagName.toLowerCase().replace('a-', '')];
            if (!widget) return;
            this._glass(widget.loaderContainer || widget.timerContainer,
                {...surface, opacity: 0.36, radius: 1, axis: 'xz'});
            this._glass(widget.loaderRing || widget.timerRing, {...accent, radius: 0, edge: 0.001});
        });
        this.el.querySelectorAll('a-sxr-progressbar').forEach(el => {
            const widget = el.components['sxr-progressbar'];
            if (!widget) return;
            this._glass(el, {...surface, opacity: 0.45, radius: 1, edge: 0.002});
            this._glass(widget.progressMeter, {...accent, radius: 1, edge: 0.002});
        });
        this._glass(this.el.querySelector('#statusText'), {...surface, opacity: 0.28, radius: 0.12});
        // Release detached entities from the theme's bookkeeping.
        this._decorated.forEach(el => { if (!el.isConnected) this._decorated.delete(el); });
        this._hidden.forEach((_visible, el) => { if (!el.isConnected) this._hidden.delete(el); });
    },
    remove: function () {
        this.el.removeEventListener('loaded', this._onLoaded);
        this._decorated.forEach(el => {
            el.removeAttribute('sxr-glass');
            el.removeAttribute('showcase-shadow');
        });
        this._hidden.forEach((visible, el) => { el.object3D.visible = visible; });
        this._decorated.clear();
        this._hidden.clear();
    }
});
