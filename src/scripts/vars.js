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
    registered: {}
};

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
    var counter = (window.SXR.getUniqueId._counter = (window.SXR.getUniqueId._counter || 0) + 1);
    var randomstr = Math.random().toString(36).substring(2, 10);
    return stringPrefix + '_' + counter + '_' + randomstr;
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
// so canvas text can actually use it. Resolved relative to the page URL.
// Returns a Promise resolving to the family name, or null when FontFace is
// unavailable or the load fails. Until the load completes, canvas rendering
// falls back to the system font stack.
window.SXR.registerFontFile = function (fontFile) {
    if (!fontFile || !/\.(ttf|otf|woff2?)(\?.*)?$/i.test(fontFile)) {
        return Promise.resolve(null);
    }
    const registered = window.SXR.fonts.registered;
    if (registered[fontFile] !== undefined) {
        return Promise.resolve(registered[fontFile] || null);
    }
    if (typeof FontFace === 'undefined' || !document.fonts || !document.fonts.add) {
        registered[fontFile] = false;
        return Promise.resolve(null);
    }
    const family = fontFile.replace(/\.[^.]+(\?.*)?$/, '').replace(/[^\w-]/g, '') || 'SXRFont';
    registered[fontFile] = null; // pending
    const face = new FontFace(family, `url("${fontFile}")`);
    return face.load().then(function (loaded) {
        document.fonts.add(loaded);
        registered[fontFile] = family;
        return family;
    }).catch(function () {
        registered[fontFile] = false;
        return null;
    });
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
    if (entity && entity.parentNode) {
        if (entity._sxrTextTexture) entity._sxrTextTexture.dispose();
        if (entity._sxrTextMaterial) entity._sxrTextMaterial.dispose();
        if (entity._sxrTextGeometry) entity._sxrTextGeometry.dispose();
        if (entity._sxrIconTexture) entity._sxrIconTexture.dispose();
        if (entity._sxrIconMaterial) entity._sxrIconMaterial.dispose();
        if (entity._sxrIconGeometry) entity._sxrIconGeometry.dispose();
        entity.parentNode.removeChild(entity);
    }
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
    const texture = new THREE.CanvasTexture(state.canvas);
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const geometry = new THREE.PlaneGeometry(state.width, state.height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1000;
    entity.setObject3D('mesh', mesh);
    entity._sxrTextCanvas = state.canvas;
    entity._sxrTextCtx = state.ctx;
    entity._sxrTextTexture = texture;
    entity._sxrTextMaterial = material;
    entity._sxrTextGeometry = geometry;
    entity._sxrTextState = state;
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
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1001;

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
        const iconDataUrl = window.SXR.getIconDataUrl(state.icon, state.color, state.thickness);
        if (!iconDataUrl) {
            state.drawFallback();
            if (onLoad) onLoad(entity);
            return;
        }
        const image = new Image();
        image.onload = function() {
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
    state.draw();
    return true;
};
