'use strict';

// An opt-in, single-surface treatment. Keep the existing material so widget
// color animations and focus states continue to work, and never touch text.
AFRAME.registerComponent('sxr-glass', {
    schema: {
        opacity: {type: 'number', default: 0.38},
        frost: {type: 'number', default: 0.16},
        radius: {type: 'number', default: 0.12},
        edge: {type: 'number', default: 0.012},
        axis: {default: 'xy', oneOf: ['xy', 'xz']}
    },
    init: function () {
        this._state = null;
        this._onSurfaceChanged = event => {
            if (event.target !== this.el) return;
            if (event.type === 'object3dset' || event.type === 'object3dremove' ||
                ['material', 'geometry', 'rounded', 'bevelbox'].includes(event.detail.name)) {
                this._syncSurface();
            }
        };
        this.el.addEventListener('object3dset', this._onSurfaceChanged);
        this.el.addEventListener('object3dremove', this._onSurfaceChanged);
        this.el.addEventListener('componentchanged', this._onSurfaceChanged);
        this._syncSurface();
    },
    update: function () {
        this._syncSurface();
    },
    _syncSurface: function () {
        const mesh = this.el.getObject3D('mesh');
        const material = mesh && mesh.material;
        if (!material || !mesh.geometry || Array.isArray(material) || material.map ||
            (!material.isMeshBasicMaterial && !material.isMeshStandardMaterial)) {
            this._restoreSurface();
            return;
        }
        if (!this._state || this._state.mesh !== mesh || this._state.material !== material) {
            this._restoreSurface();
            this._attachSurface(mesh, material);
        }
        const uniforms = this._state.uniforms;
        mesh.geometry.computeBoundingBox();
        const bounds = mesh.geometry.boundingBox;
        const secondAxis = this.data.axis === 'xz' ? 'z' : 'y';
        uniforms.sxrGlassSize.value.set(
            Math.max(0.0001, bounds.max.x - bounds.min.x),
            Math.max(0.0001, bounds.max[secondAxis] - bounds.min[secondAxis])
        );
        uniforms.sxrGlassCenter.value.set(
            (bounds.max.x + bounds.min.x) / 2,
            (bounds.max[secondAxis] + bounds.min[secondAxis]) / 2
        );
        uniforms.sxrGlassAxis.value = secondAxis === 'z' ? 1 : 0;
        uniforms.sxrGlassRadius.value = Math.max(0, Math.min(this.data.radius,
            uniforms.sxrGlassSize.value.x / 2, uniforms.sxrGlassSize.value.y / 2));
        uniforms.sxrGlassEdge.value = Math.max(0.0001, this.data.edge);
        uniforms.sxrGlassFrost.value = Math.max(0, Math.min(1, this.data.frost));
        this._setRenderState();
    },
    _setRenderState: function () {
        const material = this._state.material;
        material.transparent = true;
        material.depthWrite = false;
        material.opacity = Math.max(0, Math.min(1, this.data.opacity));
        material.alphaTest = 0;
    },
    _attachSurface: function (mesh, material) {
        const component = this;
        const original = {
            onBeforeCompile: material.onBeforeCompile,
            customProgramCacheKey: material.customProgramCacheKey,
            onBeforeRender: mesh.onBeforeRender,
            transparent: material.transparent,
            depthWrite: material.depthWrite,
            opacity: material.opacity,
            alphaTest: material.alphaTest
        };
        const uniforms = {
            sxrGlassSize: {value: new AFRAME.THREE.Vector2(1, 1)},
            sxrGlassCenter: {value: new AFRAME.THREE.Vector2()},
            sxrGlassAxis: {value: 0},
            sxrGlassRadius: {value: 0},
            sxrGlassEdge: {value: 0.012},
            sxrGlassFrost: {value: 0.16}
        };
        this._state = {mesh, material, original, uniforms};
        material.onBeforeCompile = function (shader, renderer) {
            original.onBeforeCompile.call(this, shader, renderer);
            Object.assign(shader.uniforms, uniforms);
            shader.vertexShader = `
                uniform float sxrGlassAxis;
                varying vec2 vSxrGlassPosition;
                varying vec3 vSxrGlassNormal;
                varying vec3 vSxrGlassView;
            ` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
                #include <begin_vertex>
                vSxrGlassPosition = vec2(position.x, mix(position.y, position.z, sxrGlassAxis));
                vSxrGlassNormal = normalize(normalMatrix * normal);
                vSxrGlassView = -(modelViewMatrix * vec4(position, 1.0)).xyz;
            `);
            shader.fragmentShader = `
                uniform vec2 sxrGlassSize;
                uniform vec2 sxrGlassCenter;
                uniform float sxrGlassRadius;
                uniform float sxrGlassEdge;
                uniform float sxrGlassFrost;
                varying vec2 vSxrGlassPosition;
                varying vec3 vSxrGlassNormal;
                varying vec3 vSxrGlassView;
            ` + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
                #include <color_fragment>
                vec2 glassP = vSxrGlassPosition - sxrGlassCenter;
                vec2 glassUV = glassP / sxrGlassSize + 0.5;
                vec2 glassQ = abs(glassP) - sxrGlassSize * 0.5 + sxrGlassRadius;
                float glassDistance = length(max(glassQ, 0.0))
                    + min(max(glassQ.x, glassQ.y), 0.0) - sxrGlassRadius;
                if (glassDistance > 0.0) discard;
                float glassEdge = 1.0 - smoothstep(0.0, sxrGlassEdge, -glassDistance);
                float glassRim = 1.0 - smoothstep(0.0, sxrGlassEdge * 5.0, -glassDistance);
                float glassLight = smoothstep(0.15, 1.0, glassUV.y) * 0.10;
                float glassSheen = exp(-pow((glassUV.x + glassUV.y * 0.72 - 0.9) * 2.4, 2.0)) * 0.07;
                float glassFresnel = pow(1.0 - abs(dot(normalize(vSxrGlassNormal), normalize(vSxrGlassView))), 3.0);
                float glassReflection = sxrGlassFrost + glassLight + glassSheen
                    + glassRim * 0.09 + glassEdge * (0.24 + glassUV.y * 0.20) + glassFresnel * 0.10;
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.92, 0.96, 1.0), clamp(glassReflection, 0.0, 0.85));
                diffuseColor.a = clamp(diffuseColor.a + glassEdge * 0.36 + glassRim * 0.04, 0.0, 1.0);
            `);
        };
        // Dimensions and styling are uniforms, so all surfaces of the same
        // material type can reuse a shader program without baking values in.
        material.customProgramCacheKey = function () {
            return original.customProgramCacheKey.call(this) + '|sxr-glass-v1';
        };
        mesh.onBeforeRender = function (...args) {
            original.onBeforeRender.apply(this, args);
            component._setRenderState();
        };
        material.needsUpdate = true;
    },
    _restoreSurface: function () {
        if (!this._state) return;
        const {mesh, material, original} = this._state;
        mesh.onBeforeRender = original.onBeforeRender;
        ['onBeforeCompile', 'customProgramCacheKey', 'transparent', 'depthWrite', 'opacity', 'alphaTest']
            .forEach(key => { material[key] = original[key]; });
        material.needsUpdate = true;
        this._state = null;
    },
    remove: function () {
        this.el.removeEventListener('object3dset', this._onSurfaceChanged);
        this.el.removeEventListener('object3dremove', this._onSurfaceChanged);
        this.el.removeEventListener('componentchanged', this._onSurfaceChanged);
        this._restoreSurface();
    }
});
