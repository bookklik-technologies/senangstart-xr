const senangStartIcons = require('./icons.js');

window.SXR = {};

// SenangStart XR brand colors.
window.SXR.colors = {
    primary:         '#2563EB',
    secondary:       '#0EA5E9',
    darkBase:        '#1B1B1F',
    darkDeeper:      '#161618',
    darkCard:        '#202127',

    background: '#161618',
    surface:    '#202127',
    onSurface:  '#F1F5F9',
    border:     '#1B1B1F',
    neutral:    '#1B1B1F'
};

window.SXR.fonts = {
    default: 'Outfit-Regular.ttf',
    // filename -> registered family name (loaded), false (failed) or null (pending)
    registered: {},
    // filename -> shared in-flight load Promise (so concurrent widgets share one load)
    pending: {},
    // filename -> [callback,...] invoked once the font resolves, so already
    // rendered text can redraw with the real typeface
    redrawQueue: {}
};

// Base URL of the distributed bundle (captured while this script runs, when
// document.currentScript still points at the bundle). Used to resolve the
// bundled default font relative to the script instead of the page.
window.SXR.bundleBaseUrl = (function () {
    try {
        if (document.currentScript && document.currentScript.src) {
            return new URL('.', document.currentScript.src).href;
        }
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            const src = scripts[i].getAttribute('src') || '';
            if (src.indexOf('senangstart-xr') !== -1) {
                return new URL('.', new URL(src, document.baseURI)).href;
            }
        }
    } catch { /* non-DOM environment: fall back to page-relative URLs */ }
    return '';
})();

// SenangStart SVG icons replace the legacy icon-font mapping while preserving
// the public SXR.icons lookup used by existing integrations.
window.SXR.icons = senangStartIcons;

window.SXR.getIconSvg = function(icon, color = 'currentColor', thickness = null) {
    let svg = window.SXR.icons[icon] || '';
    if (!svg) return '';
    if (thickness !== null && thickness !== undefined && thickness !== '') {
        svg = svg.replace(/stroke-width="[^"]*"/, `stroke-width="${thickness}"`);
    }
    return svg.replace(/currentColor/g, color);
};

window.SXR.getIconDataUrl = function(icon, color = '#000000', thickness = null) {
    const svg = window.SXR.getIconSvg(icon, color, thickness);
    if (!svg) return '';
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

window.SXR.getUniqueId = function (stringPrefix) {
    const counter = (window.SXR.getUniqueId._counter = (window.SXR.getUniqueId._counter || 0) + 1);
    const randomstr = Math.random().toString(36).substring(2, 10);
    return stringPrefix + '_' + counter + '_' + randomstr;
};

// Read the sxr-item data for a widget element, falling back to documented
// defaults when the widget is placed on an ordinary entity (or a primitive
// whose sxr-item has not parsed yet). Keeps widget init safe everywhere.
window.SXR.getItem = function (el) {
    const item = el && el.getAttribute ? el.getAttribute('sxr-item') : null;
    if (item && item.width !== undefined && item.height !== undefined) { return item; }
    return {
        type: '', width: 1, height: 1, baseDepth: 0.01, depth: 0.02, gap: 0.025,
        radius: 0, margin: {x: 0, y: 0, z: 0, w: 0},
        bevel: false, bevelSegments: 5, steps: 2, bevelSize: 0.1, bevelOffset: 0,
        bevelThickness: 0.1
    };
};

window.SXR.getTextWidth = function(text, font) {
    const canvas = window.SXR.getTextWidth.canvas || (window.SXR.getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.save();
    context.font = font;
    const metrics = context.measureText(text);
    context.restore();
    return metrics.width;
};

window.SXR.normalizeFontSize = function(fontSize, fallback = 0.2) {
    const parsed = typeof fontSize === 'number' ? fontSize : parseFloat(fontSize);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return parsed;
};

// Resolve an action callback declared as a global function name (e.g.
// onclick="myFunction"). Returns the function, or null when the name is
// empty, unknown, or not callable. Modern integrations can also listen to
// the widget's emitted events instead of using global callbacks.
window.SXR.getActionFunction = function (name) {
    if (!name || typeof name !== 'string') { return null; }
    const fn = window[name];
    return typeof fn === 'function' ? fn : null;
};

// Register a font file (e.g. 'Outfit-Regular.ttf') through the FontFace API
// so canvas text can actually use it. The bundled default font resolves
// relative to the distributed bundle; custom fonts resolve relative to the
// page URL. Concurrent callers share one pending load, and callbacks
// registered through SXR.onFontResolved run once the load settles so existing
// text can redraw with the real typeface. Returns a Promise resolving to the
// family name, or null when FontFace is unavailable or the load fails.
window.SXR.registerFontFile = function (fontFile) {
    if (!fontFile || !/\.(ttf|otf|woff2?)(\?.*)?$/i.test(fontFile)) {
        return Promise.resolve(null);
    }
    const fonts = window.SXR.fonts;
    if (fonts.registered[fontFile]) {
        return Promise.resolve(fonts.registered[fontFile]);
    }
    if (fonts.registered[fontFile] === false) return Promise.resolve(null);
    if (fonts.pending[fontFile]) {
        return fonts.pending[fontFile];
    }
    if (typeof FontFace === 'undefined' || !document.fonts || !document.fonts.add) {
        fonts.registered[fontFile] = false;
        return Promise.resolve(null);
    }
    const family = fontFile.replace(/\.[^.]+(\?.*)?$/, '').replace(/[^\w-]/g, '') || 'SXRFont';
    const url = (fontFile === fonts.default && window.SXR.bundleBaseUrl)
        ? window.SXR.bundleBaseUrl + fontFile
        : fontFile;
    const face = new FontFace(family, `url("${url}")`);
    const promise = face.load().then(function (loaded) {
        document.fonts.add(loaded);
        fonts.registered[fontFile] = family;
        delete fonts.pending[fontFile];
        const redraws = fonts.redrawQueue[fontFile] || [];
        delete fonts.redrawQueue[fontFile];
        redraws.forEach(function (callback) {
            try { callback(family); } catch { /* a dead entity must not break the rest */ }
        });
        return family;
    }).catch(function () {
        fonts.registered[fontFile] = false;
        delete fonts.pending[fontFile];
        delete fonts.redrawQueue[fontFile];
        return null;
    });
    fonts.pending[fontFile] = promise;
    return promise;
};

// Queue a callback for when a font file finishes (or fails) loading. Returns
// true when the font is still pending (callback queued), false when it has
// already resolved and the callback will never fire.
window.SXR.onFontResolved = function (fontFile, callback) {
    const fonts = window.SXR.fonts;
    if (!fontFile || !/\.(ttf|otf|woff2?)(\?.*)?$/i.test(fontFile)) { return false; }
    if (fonts.registered[fontFile] !== undefined || typeof FontFace === 'undefined') {
        return false;
    }
    if (typeof callback !== 'function') { return false; }
    (fonts.redrawQueue[fontFile] = fonts.redrawQueue[fontFile] || []).push(callback);
    return true;
};

window.SXR.getCanvasFontFamily = function(fontFamily) {
    if (!fontFamily || fontFamily === 'undefined' || fontFamily === 'null') {
        return 'Arial, Helvetica, sans-serif';
    }
    if (/\.(ttf|otf|woff2?)(\?.*)?$/i.test(fontFamily)) {
        const registered = window.SXR.fonts.registered[fontFamily];
        if (registered) { return registered; }
        window.SXR.registerFontFile(fontFamily);
        return 'Arial, Helvetica, sans-serif';
    }
    return fontFamily;
};

window.SXR.getValidColor = function(color, fallback = window.SXR.colors.onSurface) {
    const normalized = String(color || '').trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') return fallback;
    return normalized;
};

window.SXR.removeEntity = function(entity) {
    if (entity && !entity._sxrDisposed) {
        // flag first so pending async asset callbacks (icon image loads,
        // font redraws) ignore this entity instead of touching disposed
        // GPU resources
        entity._sxrDisposed = true;
        if (entity._sxrTextTexture) entity._sxrTextTexture.dispose();
        if (entity._sxrTextMaterial) entity._sxrTextMaterial.dispose();
        if (entity._sxrTextGeometry) entity._sxrTextGeometry.dispose();
        if (entity._sxrIconTexture) entity._sxrIconTexture.dispose();
        if (entity._sxrIconMaterial) entity._sxrIconMaterial.dispose();
        if (entity._sxrIconGeometry) entity._sxrIconGeometry.dispose();
        if (entity.children) Array.from(entity.children).forEach(window.SXR.removeEntity);
        if (entity.parentNode) entity.parentNode.removeChild(entity);
    }
};

// Keyboard interaction helpers shared by the widgets. Widgets attach these to
// their own element, so they only fire while the widget holds DOM focus.
window.SXR.keyboard = {
    // Surfaces where the user is typing text: global shortcuts must not fire
    // and activation keys must not double-handle.
    isEditableTarget: function (target) {
        if (!target) { return false; }
        const tag = (target.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' ||
            target.isContentEditable === true;
    },
    // True when the event is a plain activation press (not a repeated key,
    // not part of IME composition).
    isActivationPress: function (event) {
        if (!event || event.repeat || event.isComposing || event.keyCode === 229) {
            return false;
        }
        return event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';
    },
    isActivationKey: function (key) {
        return key === 'Enter' || key === ' ' || key === 'Spacebar';
    },
    isArrowKey: function (key) {
        return key === 'ArrowUp' || key === 'ArrowDown' ||
            key === 'ArrowLeft' || key === 'ArrowRight';
    }
};

// Watch the sxr-item component for live changes (width/height/depth/...).
// Returns the handler so the owning component can detach it on remove().
window.SXR.watchGuiItem = function (el, callback) {
    const handler = function (evt) {
        if (!evt.detail || evt.detail.name !== 'sxr-item') { return; }
        if (evt.target && evt.target !== el) return;
        callback(evt.detail.newData || el.getAttribute('sxr-item'));
    };
    el.addEventListener('componentchanged', handler);
    return handler;
};

const TEXT_PIXEL_RATIO = 128;

window.SXR.computeTextCanvasSize = function (width, height, pixelRatio) {
    const nextPow2 = function(n) { return Math.pow(2, Math.ceil(Math.log(Math.max(2, n)) / Math.log(2))); };
    return {
        canvasWidth: Math.min(2048, Math.max(128, nextPow2(width * pixelRatio))),
        canvasHeight: Math.min(1024, Math.max(64, nextPow2(height * pixelRatio)))
    };
};

// Build (or reuse) the persistent drawing state for a text entity: canvas,
// 2d context and normalized geometry. Called by createTextEntity and
// redrawTextEntity.
window.SXR.createTextState = function (options = {}) {
    const value = options.value === undefined || options.value === null ? '' : String(options.value);
    const width = Math.max(0.01, options.width || 1);
    const height = Math.max(0.01, options.height || 0.25);
    const pixelRatio = options.pixelRatio || TEXT_PIXEL_RATIO;
    const size = window.SXR.computeTextCanvasSize(width, height, pixelRatio);

    const canvas = document.createElement('canvas');
    canvas.width = size.canvasWidth;
    canvas.height = size.canvasHeight;

    const ctx = canvas.getContext('2d');
    const pad = Math.max(8, Math.round(canvas.height * 0.08));

    return {
        width, height, pixelRatio, value,
        canvas, ctx,
        pad,
        availableWidth: canvas.width - pad * 2,
        availableHeight: canvas.height - pad * 2,
        worldToCanvas: canvas.height / height
    };
};

// Draw text into an existing text state (the fitting/layout algorithm runs
// again, but the canvas, texture and GPU resources are reused).
window.SXR.drawTextToState = function (state, options = {}) {
    // remember the last draw options so font-resolution redraws can repeat it
    state.lastOptions = Object.assign({}, options);
    const ctx = state.ctx;
    const canvas = state.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const value = options.value === undefined || options.value === null ? '' : String(options.value);
    state.value = value;
    const color = window.SXR.getValidColor(options.color);
    const align = options.align || 'center';
    const fontSize = window.SXR.normalizeFontSize(options.fontSize, Math.min(0.2, state.height * 0.7));
    const lineHeight = window.SXR.normalizeFontSize(options.lineHeight, fontSize * 1.25);
    const fontFamily = window.SXR.getCanvasFontFamily(options.fontFamily);
    const fontWeight = options.fontWeight || '600';

    const worldToCanvas = state.worldToCanvas;
    const requestedFontPx = Math.max(10, Math.round(fontSize * worldToCanvas));
    const requestedLineHeightPx = Math.max(requestedFontPx * 1.1, Math.round(lineHeight * worldToCanvas));

    const wrapText = function(text) {
        const lines = [];
        String(text).split('\n').forEach(function(paragraph) {
            const words = paragraph.split(/\s+/).filter(Boolean);
            if (!words.length) {
                lines.push('');
                return;
            }
            let line = '';
            words.forEach(function(word) {
                const next = line ? line + ' ' + word : word;
                if (line && ctx.measureText(next).width > state.availableWidth) {
                    lines.push(line);
                    line = word;
                } else {
                    line = next;
                }
            });
            lines.push(line);
        });
        return lines;
    };

    const minFontPx = 12;
    const getLayout = function(candidateFontPx) {
        const scale = candidateFontPx / requestedFontPx;
        const candidateLineHeightPx = Math.max(
            candidateFontPx * 1.1,
            Math.round(requestedLineHeightPx * scale)
        );
        ctx.font = `${fontWeight} ${candidateFontPx}px ${fontFamily}`;
        const candidateLines = wrapText(value);
        const fits = candidateLines.length * candidateLineHeightPx <= state.availableHeight
            && candidateLines.every(function(line) {
                return ctx.measureText(line).width <= state.availableWidth;
            });
        return {fits, lines: candidateLines, lineHeightPx: candidateLineHeightPx};
    };

    let layout = getLayout(requestedFontPx);
    let finalFontPx = requestedFontPx;
    if (!layout.fits && requestedFontPx > minFontPx) {
        let low = minFontPx;
        let high = requestedFontPx - 1;
        let bestLayout = getLayout(minFontPx);
        let fontPx = minFontPx;

        while (low <= high) {
            const candidateFontPx = Math.floor((low + high) / 2);
            const candidateLayout = getLayout(candidateFontPx);
            if (candidateLayout.fits) {
                fontPx = candidateFontPx;
                bestLayout = candidateLayout;
                low = candidateFontPx + 1;
            } else {
                high = candidateFontPx - 1;
            }
        }
        layout = bestLayout;
        finalFontPx = fontPx;
    }

    ctx.font = `${fontWeight} ${finalFontPx}px ${fontFamily}`;
    const lines = layout.lines;
    ctx.textBaseline = 'middle';
    ctx.textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
    const strokeColor = options.strokeColor === undefined ? 'transparent' : options.strokeColor;
    const strokeWidth = options.strokeWidth === undefined
        ? 0
        : Math.max(0, Number(options.strokeWidth) || 0);

    ctx.fillStyle = color;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    const x = ctx.textAlign === 'left' ? state.pad : ctx.textAlign === 'right' ? canvas.width - state.pad : canvas.width / 2;
    const totalHeight = lines.length * layout.lineHeightPx;
    const firstY = canvas.height / 2 - totalHeight / 2 + layout.lineHeightPx / 2;
    lines.forEach(function(line, index) {
        const y = firstY + index * layout.lineHeightPx;
        if (strokeWidth > 0 && strokeColor !== 'transparent') {
            ctx.strokeText(line, x, y);
        }
        ctx.fillText(line, x, y);
    });
};

window.SXR.createTextEntity = function(options = {}) {
    const state = window.SXR.createTextState(options);
    window.SXR.drawTextToState(state, options);

    const entity = document.createElement('a-entity');
    const texture = new AFRAME.THREE.CanvasTexture(state.canvas);
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.minFilter = AFRAME.THREE.LinearFilter;
    texture.magFilter = AFRAME.THREE.LinearFilter;
    // default preserves the legacy always-on-top rendering; opt in with
    // options.depthTest to let scene geometry occlude the text
    const depthTest = options.depthTest === true;
    const material = new AFRAME.THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthTest: depthTest,
        depthWrite: false,
        side: AFRAME.THREE.DoubleSide
    });
    const geometry = new AFRAME.THREE.PlaneGeometry(state.width, state.height);
    const mesh = new AFRAME.THREE.Mesh(geometry, material);
    mesh.renderOrder = depthTest ? 10 : 1000;
    entity.setObject3D('mesh', mesh);
    entity._sxrTextCanvas = state.canvas;
    entity._sxrTextCtx = state.ctx;
    entity._sxrTextTexture = texture;
    entity._sxrTextMaterial = material;
    entity._sxrTextGeometry = geometry;
    entity._sxrTextState = state;

    // if the requested font is still loading, redraw this text with the real
    // typeface once it resolves (the pending load is shared across widgets)
    const fontFamily = options.fontFamily;
    if (fontFamily && /\.(ttf|otf|woff2?)(\?.*)?$/i.test(fontFamily)) {
        window.SXR.onFontResolved(fontFamily, function () {
            if (entity._sxrDisposed || !entity._sxrTextState) { return; }
            window.SXR.redrawTextEntity(entity, state.lastOptions || options);
        });
    }
    return entity;
};

// Redraw text onto an existing text entity's canvas without recreating the
// entity, texture or geometry. Returns true when the redraw happened in
// place; false when the entity has no text state or the box size changed
// (the caller should then recreate the entity).
window.SXR.redrawTextEntity = function(entity, options = {}) {
    const state = entity && entity._sxrTextState;
    if (!state) { return false; }
    const width = Math.max(0.01, options.width || 1);
    const height = Math.max(0.01, options.height || 0.25);
    const pixelRatio = options.pixelRatio || TEXT_PIXEL_RATIO;
    if (width !== state.width || height !== state.height || pixelRatio !== state.pixelRatio) {
        return false;
    }
    window.SXR.drawTextToState(state, options);
    state.textureNeedsUpdate = true;
    if (entity._sxrTextMaterial) entity._sxrTextMaterial.depthTest = options.depthTest === true;
    const mesh = entity.getObject3D && entity.getObject3D('mesh');
    if (mesh) mesh.renderOrder = options.depthTest === true ? 10 : 1000;
    if (entity._sxrTextTexture) {
        entity._sxrTextTexture.needsUpdate = true;
    }
    return true;
};

window.SXR.createIconEntity = function(options = {}) {
    const state = {
        icon: options.icon || '',
        width: Math.max(0.01, options.width || options.size || 0.25),
        height: Math.max(0.01, options.height || options.size || 0.25),
        color: window.SXR.getValidColor(options.color),
        thickness: options.thickness === undefined ? null : options.thickness,
        scale: Number.isFinite(Number(options.scale)) ? Number(options.scale) : 0.78,
        pixelRatio: options.pixelRatio || 768
    };
    if (options.height === undefined && options.size === undefined) {
        state.height = state.width; // square by default, matching previous behavior
    }
    const width = state.width;
    const height = state.height;
    const onLoad = options.onLoad || null;
    const nextPow2 = function(n) { return Math.pow(2, Math.ceil(Math.log(Math.max(2, n)) / Math.log(2))); };
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(2048, Math.max(128, nextPow2(width * state.pixelRatio)));
    canvas.height = Math.min(2048, Math.max(128, nextPow2(height * state.pixelRatio)));

    const ctx = canvas.getContext('2d');
    const texture = new AFRAME.THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.minFilter = AFRAME.THREE.LinearFilter;
    texture.magFilter = AFRAME.THREE.LinearFilter;

    const material = new AFRAME.THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        // default preserves the legacy always-on-top rendering; opt in with
        // options.depthTest to let scene geometry occlude the icon
        depthTest: options.depthTest === true,
        depthWrite: false,
        side: AFRAME.THREE.DoubleSide
    });
    const geometry = new AFRAME.THREE.PlaneGeometry(width, height);
    const mesh = new AFRAME.THREE.Mesh(geometry, material);
    mesh.renderOrder = options.depthTest === true ? 10 : 1001;

    const entity = document.createElement('a-entity');
    entity.setObject3D('mesh', mesh);
    entity._sxrIconTexture = texture;
    entity._sxrIconMaterial = material;
    entity._sxrIconGeometry = geometry;

    state.canvas = canvas;
    state.ctx = ctx;
    state.drawFallback = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${Math.round(canvas.height * 0.72)}px Arial, Helvetica, sans-serif`;
        ctx.fillStyle = state.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', canvas.width / 2, canvas.height / 2);
        texture.needsUpdate = true;
    };
    state.draw = function() {
        // never draw into disposed GPU resources (the entity may have been
        // removed while a previous draw's image was still loading)
        if (entity._sxrDisposed) { return; }
        const iconDataUrl = window.SXR.getIconDataUrl(state.icon, state.color, state.thickness);
        if (!iconDataUrl) {
            state.drawFallback();
            if (onLoad) onLoad(entity);
            return;
        }
        const image = new Image();
        image.onload = function() {
            if (entity._sxrDisposed) { return; }
            const size = Math.min(canvas.width, canvas.height) * state.scale;
            const x = (canvas.width - size) / 2;
            const y = (canvas.height - size) / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, x, y, size, size);
            texture.needsUpdate = true;
            if (onLoad) onLoad(entity);
        };
        image.onerror = state.drawFallback;
        image.src = iconDataUrl;
    };

    entity._sxrIconState = state;
    state.draw();

    return entity;
};

// Redraw an icon onto an existing icon entity's canvas without recreating
// the entity, texture or geometry (the SVG image loads asynchronously).
// Returns true when the redraw was scheduled in place; false when the entity
// has no icon state or the box size changed (caller should recreate).
window.SXR.redrawIconEntity = function(entity, options = {}) {
    const state = entity && entity._sxrIconState;
    if (!state) { return false; }
    const width = Math.max(0.01, options.width || options.size || state.width);
    const height = Math.max(0.01, options.height || options.size || state.height);
    const pixelRatio = options.pixelRatio || state.pixelRatio;
    if (width !== state.width || height !== state.height || pixelRatio !== state.pixelRatio) {
        return false;
    }
    if (options.icon !== undefined) { state.icon = options.icon; }
    if (options.color !== undefined) { state.color = window.SXR.getValidColor(options.color, state.color); }
    if (options.thickness !== undefined) { state.thickness = options.thickness; }
    if (options.scale !== undefined && Number.isFinite(Number(options.scale))) { state.scale = Number(options.scale); }
    if (entity._sxrIconMaterial) entity._sxrIconMaterial.depthTest = options.depthTest === true;
    const mesh = entity.getObject3D && entity.getObject3D('mesh');
    if (mesh) mesh.renderOrder = options.depthTest === true ? 10 : 1001;
    state.draw();
    return true;
};
