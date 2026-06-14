const importedSenangStartIcons = require('@bookklik/senangstart-icons/icons');
const senangStartIcons = importedSenangStartIcons.default || importedSenangStartIcons;

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
    default: 'Outfit-Regular.ttf'
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

window.SXR.getCanvasFontFamily = function(fontFamily) {
    if (!fontFamily || fontFamily === 'undefined' || fontFamily === 'null' || /\.(ttf|otf|woff2?)($|\?)/i.test(fontFamily)) {
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

window.SXR.createTextEntity = function(options = {}) {
    const value = options.value === undefined || options.value === null ? '' : String(options.value);
    const width = Math.max(0.01, options.width || 1);
    const height = Math.max(0.01, options.height || 0.25);
    const color = window.SXR.getValidColor(options.color);
    const align = options.align || 'center';
    const fontSize = window.SXR.normalizeFontSize(options.fontSize, Math.min(0.2, height * 0.7));
    const lineHeight = window.SXR.normalizeFontSize(options.lineHeight, fontSize * 1.25);
    const fontFamily = window.SXR.getCanvasFontFamily(options.fontFamily);
    const fontWeight = options.fontWeight || '600';
    const pixelRatio = options.pixelRatio || 768;
    const nextPow2 = function(n) { return Math.pow(2, Math.ceil(Math.log(Math.max(2, n)) / Math.log(2))); };
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(2048, Math.max(128, nextPow2(width * pixelRatio)));
    canvas.height = Math.min(1024, Math.max(64, nextPow2(height * pixelRatio)));

    const ctx = canvas.getContext('2d');
    const pad = Math.max(8, Math.round(canvas.height * 0.08));
    const availableWidth = canvas.width - pad * 2;
    const availableHeight = canvas.height - pad * 2;
    const worldToCanvas = canvas.height / height;
    const requestedFontPx = Math.max(10, Math.round(fontSize * worldToCanvas));
    const requestedLineHeightPx = Math.max(requestedFontPx * 1.1, Math.round(lineHeight * worldToCanvas));
    let fontPx = requestedFontPx;
    let lineHeightPx = requestedLineHeightPx;

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
                if (line && ctx.measureText(next).width > availableWidth) {
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
        const fits = candidateLines.length * candidateLineHeightPx <= availableHeight
            && candidateLines.every(function(line) {
                return ctx.measureText(line).width <= availableWidth;
            });
        return {fits, lines: candidateLines, lineHeightPx: candidateLineHeightPx};
    };

    let layout = getLayout(fontPx);
    if (!layout.fits && fontPx > minFontPx) {
        let low = minFontPx;
        let high = fontPx - 1;
        let bestLayout = getLayout(minFontPx);
        fontPx = minFontPx;

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
    }

    lineHeightPx = layout.lineHeightPx;
    ctx.font = `${fontWeight} ${fontPx}px ${fontFamily}`;
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

    const x = ctx.textAlign === 'left' ? pad : ctx.textAlign === 'right' ? canvas.width - pad : canvas.width / 2;
    const totalHeight = lines.length * lineHeightPx;
    const firstY = canvas.height / 2 - totalHeight / 2 + lineHeightPx / 2;
    lines.forEach(function(line, index) {
        const y = firstY + index * lineHeightPx;
        if (strokeWidth > 0 && strokeColor !== 'transparent') {
            ctx.strokeText(line, x, y);
        }
        ctx.fillText(line, x, y);
    });

    const entity = document.createElement('a-entity');
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
    mesh.renderOrder = 1000;
    entity.setObject3D('mesh', mesh);
    entity._sxrTextTexture = texture;
    entity._sxrTextMaterial = material;
    entity._sxrTextGeometry = geometry;
    return entity;
};

window.SXR.createIconEntity = function(options = {}) {
    const icon = options.icon || '';
    const width = Math.max(0.01, options.width || options.size || 0.25);
    const height = Math.max(0.01, options.height || options.size || width);
    const color = window.SXR.getValidColor(options.color);
    const thickness = options.thickness === undefined ? null : options.thickness;
    const scale = Number.isFinite(Number(options.scale)) ? Number(options.scale) : 0.78;
    const pixelRatio = options.pixelRatio || 768;
    const onLoad = options.onLoad || null;
    const nextPow2 = function(n) { return Math.pow(2, Math.ceil(Math.log(Math.max(2, n)) / Math.log(2))); };
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(2048, Math.max(128, nextPow2(width * pixelRatio)));
    canvas.height = Math.min(2048, Math.max(128, nextPow2(height * pixelRatio)));

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

    const drawFallback = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${Math.round(canvas.height * 0.72)}px Arial, Helvetica, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', canvas.width / 2, canvas.height / 2);
        texture.needsUpdate = true;
    };

    const iconDataUrl = window.SXR.getIconDataUrl(icon, color, thickness);
    if (!iconDataUrl) {
        drawFallback();
        if (onLoad) onLoad(entity);
        return entity;
    }

    const image = new Image();
    image.onload = function() {
        const size = Math.min(canvas.width, canvas.height) * scale;
        const x = (canvas.width - size) / 2;
        const y = (canvas.height - size) / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, x, y, size, size);
        texture.needsUpdate = true;
        if (onLoad) onLoad(entity);
    };
    image.onerror = drawFallback;
    image.src = iconDataUrl;

    return entity;
};
