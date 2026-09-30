'use strict';

AFRAME.registerComponent('sxr-vertical-slider', {
    dependencies: ['sxr-item', 'sxr-interactable'],
    schema: {
        activeColor: {type: 'string', default: SXR.colors.primary},
        backgroundColor: {type: 'string', default: SXR.colors.onSurface},
        borderColor: {type: 'string', default: SXR.colors.neutral},
        handleColor: {type: 'string', default: SXR.colors.onSurface},
        handleInnerDepth: {type: 'number', default: 0.02},
        handleInnerRadius: {type: 'number', default: 0.13},
        handleOuterDepth: {type: 'number', default: 0.04},
        handleOuterRadius: {type: 'number', default: 0.17},
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        hoverFontSize: {type: 'number', default: 0.2 },
        hoverHeight: {type: 'number', default: 0.35},
        hoverPercent: {type: 'number'},
        hoverWidth: {type: 'number', default: 0.7},
        keyboardStep: {type: 'number', default: 0.05 },
        percent: {type: 'number', default: 0.5},
        opacity: { type: 'number', default: 1.0 },
        outputFontSize: {type: 'number', default: 0.2},
        outputFunction: {type: 'string'},
        outputTextDepth: {type: 'number', default: 0.25},
        outputWidth: {type: 'number', default: 1.0},
        sliderBarDepth: {type: 'number', default: 0.03},
        sliderBarWidth: {type: 'number', default: 0.08},
        topBottomPadding: {type: 'number', default: 0.25},
    },
    init: function() {
        const data = this.data;
        const el = this.el;
        const component = this;
        const guiItem = SXR.getItem(el);
        this.guiItem = guiItem;
        const sliderHeight = Math.max(0.001, guiItem.height - data.topBottomPadding*2.0);
        this.sliderHeight = sliderHeight;
        // reusable vector: the incoming intersection point must never be
        // mutated (worldToLocal transforms in place)
        const localPoint = new AFRAME.THREE.Vector3();
        const toLocal = function (point) {
            localPoint.copy(point);
            if (el.object3D && el.object3D.updateMatrixWorld) {
                el.object3D.updateMatrixWorld();
            }
            return el.object3D.worldToLocal(localPoint);
        };
        this._toLocal = toLocal;
        this._localPoint = localPoint;

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', `shader: flat; opacity: ${data.opacity};  alphaTest: 0.5; color: ${data.backgroundColor}; side:front;`);

        const sliderActiveBar = document.createElement("a-entity");
        sliderActiveBar.setAttribute('geometry', `primitive: box; height: ${data.percent*sliderHeight}; width: ${data.sliderBarWidth}; depth: ${data.sliderBarDepth};`);
        sliderActiveBar.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor};`);
        sliderActiveBar.setAttribute('position', `0 ${data.percent*sliderHeight - sliderHeight*0.5 - data.percent *sliderHeight * 0.5} ${data.sliderBarDepth - 0.01}`);
        this.sliderActiveBar = sliderActiveBar;
        el.appendChild(sliderActiveBar);

        const sliderBar = document.createElement("a-entity");
        sliderBar.setAttribute('geometry', `primitive: box; height: ${sliderHeight - data.percent * sliderHeight}; width: ${data.sliderBarWidth}; depth: ${data.sliderBarDepth};`);
        sliderBar.setAttribute('material', `shader: flat; opacity: 1; alphaTest: 0.5; side:double; color:${data.borderColor};`);
        sliderBar.setAttribute('position', `0 ${data.percent * sliderHeight * 0.5} ${data.sliderBarDepth - 0.01}`);
        this.sliderBar = sliderBar;
        el.appendChild(sliderBar);

        const handleContainer = document.createElement("a-entity");
        handleContainer.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleOuterRadius}; height: ${data.handleOuterDepth};`);
        handleContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor};`);
        handleContainer.setAttribute('rotation', '90 0 0');
        handleContainer.setAttribute('position', `0 ${data.percent*sliderHeight - sliderHeight*0.5} ${data.handleOuterDepth - 0.01}`);
        this.handleContainer = handleContainer;
        el.appendChild(handleContainer);

        const handle = document.createElement("a-entity");
        this.handle = handle;
        handle.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleInnerRadius}; height: ${data.handleInnerDepth};`);
        handle.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.handleColor};`);
        handle.setAttribute('position', `0 ${data.handleInnerDepth} 0`);
        handleContainer.appendChild(handle);

        const valueLabel = document.createElement('a-sxr-label');
        valueLabel.setAttribute('width', `${guiItem.width * 1.4 * data.outputWidth}`);
        valueLabel.setAttribute('height', `${guiItem.width * 0.7}`);
        // TODO: use function to calculate display value
        valueLabel.setAttribute('value', '0.0');
        valueLabel.setAttribute('opacity', '1.0');
        valueLabel.setAttribute('position', `${guiItem.width * 1.4} 0 ${data.sliderBarDepth}`);
        valueLabel.setAttribute('rotation', '-90 0 0');
        valueLabel.setAttribute('font-color', data.activeColor);
        valueLabel.setAttribute('font-size', `${SXR.normalizeFontSize(data.outputFontSize)}`);
        valueLabel.setAttribute('font-weight', 'bold');
        valueLabel.setAttribute('text-depth', data.outputTextDepth);
        this.valueLabel = valueLabel;
        handleContainer.appendChild(valueLabel);

        const hoverIndicator = document.createElement("a-entity");
        hoverIndicator.setAttribute('geometry', `primitive: box; height: 0.02; width: ${guiItem.width * 0.5}; depth: ${data.sliderBarDepth};`);
        hoverIndicator.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor};`);
        hoverIndicator.setAttribute('position', `${-guiItem.width * 0.5} 0 ${data.sliderBarDepth - 0.01}`);
        hoverIndicator.setAttribute('visible', 'false');
        this.hoverIndicator = hoverIndicator;
        el.appendChild(hoverIndicator);

        const hoverLabel = document.createElement('a-sxr-label');
        hoverLabel.setAttribute('width', `${guiItem.width * data.hoverWidth}`);
        hoverLabel.setAttribute('height', `${guiItem.width * data.hoverHeight}`);
        hoverLabel.setAttribute('value', '');
        hoverLabel.setAttribute('opacity', '0.5');
        hoverLabel.setAttribute('position', `${-guiItem.width * data.hoverWidth} 0 ${data.sliderBarDepth}`);
        hoverLabel.setAttribute('font-color', data.borderColor);
        hoverLabel.setAttribute('font-size', `${SXR.normalizeFontSize(data.hoverFontSize)}`);
        hoverLabel.setAttribute('text-depth', data.outputTextDepth);
        this.hoverLabel = hoverLabel;
        hoverIndicator.appendChild(hoverLabel);

        this._onMouseEnter = function () {
            handle.setAttribute('material', 'color', data.hoverColor);
        };
        el.addEventListener('mouseenter', this._onMouseEnter);

        this._onMouseLeave = function () {
            handle.setAttribute('material', 'color', data.handleColor);
        };
        el.addEventListener('mouseleave', this._onMouseLeave);

        this._onClick = function (evt) {
            // keyboard-activated clicks (sxr-interactable) carry no intersection detail
            if (!evt.detail || !evt.detail.intersection) { return; }
            const localCoordinates = toLocal(evt.detail.intersection.point);
            const sliderHeight = component.sliderHeight;
            let newPercent = null;
            if (localCoordinates.y <= (-sliderHeight / 2)) {
                newPercent = 0;
            } else if (localCoordinates.y >= (sliderHeight / 2)) {
                newPercent = 1.0;
            } else {
                newPercent = (localCoordinates.y + (sliderHeight /2)) / sliderHeight;
            }
            el.setAttribute('sxr-vertical-slider', 'percent', String(newPercent));
            el.setAttribute('sxr-vertical-slider', 'hoverPercent', String(newPercent));
            const guiInteractable = el.getAttribute("sxr-interactable");
            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(data.percent);
        };
        el.addEventListener('click', this._onClick);

        // focused keyboard operation: arrows step the value, Home/End jump to
        // the extremes. The action callback keeps its click signature.
        this._onKeyUp = function (event) {
            if (event.isComposing || event.keyCode === 229 || event.repeat) { return; }
            let percent = null;
            if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
                percent = data.percent - data.keyboardStep;
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
                percent = data.percent + data.keyboardStep;
            } else if (event.key === 'Home') {
                percent = 0;
            } else if (event.key === 'End') {
                percent = 1;
            }
            if (percent === null) { return; }
            event.preventDefault();
            el.setAttribute('sxr-vertical-slider', 'percent', String(percent));
            const guiInteractable = el.getAttribute("sxr-interactable");
            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(data.percent);
        };
        el.addEventListener('keyup', this._onKeyUp);

        this._onIntersected = evt => {
            this.raycaster = evt.detail.el;
        };
        this.el.addEventListener('raycaster-intersected', this._onIntersected);
        this._onIntersectedCleared = () => {
            this.raycaster = null;
            this.hoverIndicator.setAttribute('visible', false);
            this.hoverLabel.setAttribute('visible', false);
        };
        this.el.addEventListener('raycaster-intersected-cleared', this._onIntersectedCleared);

        // live sxr-item updates (dimensions) rebuild the geometry
        this._onItemChanged = SXR.watchGuiItem(el, function () {
            component._rebuild();
        });

        //WAI ARIA Support
        el.setAttribute('role', 'slider');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-valuemin', '0');
        el.setAttribute('aria-valuemax', '1');
        el.setAttribute('aria-valuenow', `${data.percent}`);
        el.setAttribute('aria-orientation', 'vertical');

    },
    // dispose owned geometry and rebuild from current sxr-item data
    _rebuild: function () {
        const el = this.el;
        this.guiItem = SXR.getItem(el);
        const guiItem = this.guiItem;

        const data = this.data;
        this.sliderHeight = Math.max(0.001, guiItem.height - data.topBottomPadding*2.0);
        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', {shader: 'flat', color: data.backgroundColor, opacity: data.opacity, transparent: data.opacity < 1});
        this.sliderActiveBar.setAttribute('material', 'color', data.activeColor);
        this.sliderBar.setAttribute('material', 'color', data.borderColor);
        this.handleContainer.setAttribute('material', 'color', data.activeColor);
        this.handleContainer.setAttribute('geometry', {primitive: 'cylinder', radius: data.handleOuterRadius, height: data.handleOuterDepth});
        this.handle.setAttribute('material', 'color', data.handleColor);
        this.handle.setAttribute('geometry', {primitive: 'cylinder', radius: data.handleInnerRadius, height: data.handleInnerDepth});
        this.handle.setAttribute('position', `0 ${data.handleInnerDepth} 0`);
        this.valueLabel.setAttribute('width', guiItem.width * 1.4 * data.outputWidth);
        this.valueLabel.setAttribute('height', guiItem.width * 0.7);
        this.valueLabel.setAttribute('position', `${guiItem.width * 1.4} 0 ${data.sliderBarDepth}`);
        this.valueLabel.setAttribute('font-color', data.activeColor);
        this.valueLabel.setAttribute('font-size', data.outputFontSize);
        this.valueLabel.setAttribute('text-depth', data.outputTextDepth);
        this.hoverIndicator.setAttribute('geometry', {primitive: 'box', height: 0.02, width: guiItem.width * 0.5, depth: data.sliderBarDepth});
        this.hoverIndicator.setAttribute('material', 'color', data.activeColor);
        this.hoverLabel.setAttribute('width', guiItem.width * data.hoverWidth);
        this.hoverLabel.setAttribute('height', guiItem.width * data.hoverHeight);
        this.hoverLabel.setAttribute('position', `${-guiItem.width * data.hoverWidth} 0 ${data.sliderBarDepth}`);
        this.hoverLabel.setAttribute('font-color', data.borderColor);
        this.hoverLabel.setAttribute('font-size', data.hoverFontSize);
        this.hoverLabel.setAttribute('text-depth', data.outputTextDepth);
        this._applyPercent(data.percent);
    },
    update: function (oldData) {
        oldData = oldData || {};
        const data = this.data;
        const el = this.el;
        const guiItem = el.getAttribute('sxr-item') || this.guiItem || SXR.getItem(el);
        const sliderHeight = Math.max(0.001, guiItem.height - data.topBottomPadding*2.0);
        if (this.sliderActiveBar && Object.keys(data).some(key => key !== 'percent' && key !== 'hoverPercent' && data[key] !== oldData[key])) this._rebuild();
        if (data.percent !== oldData.percent && this.sliderActiveBar && this.sliderBar && this.handleContainer) {
            this._applyPercent(data.percent);
            const outputValue = this.getOutputValue(false);
            if (outputValue !== null && outputValue !== undefined) {
                this.valueLabel.setAttribute('value', outputValue);
            }
            this.hoverIndicator.setAttribute('visible', false);
            this.hoverLabel.setAttribute('visible', false);
        } else if (data.hoverPercent !== oldData.hoverPercent && data.hoverPercent !== data.percent && this.hoverIndicator) {
            const hoverOutputValue = this.getOutputValue(true);
            if (hoverOutputValue !== null && hoverOutputValue !== undefined) {
                this.hoverLabel.setAttribute('value', hoverOutputValue);
            }
            this.hoverIndicator.setAttribute('position', `0 ${data.hoverPercent*sliderHeight - sliderHeight*0.5} ${data.sliderBarDepth - 0.01}`)
            this.hoverIndicator.setAttribute('visible', true);
            this.hoverLabel.setAttribute('visible', true);
        }
    },
    // re-render bars/handle for a percent value (clamped)
    _applyPercent: function (rawPercent) {
        const data = this.data;
        const sliderHeight = this.sliderHeight;
        const percent = Number.isFinite(Number(rawPercent)) ? Math.min(1, Math.max(0, Number(rawPercent))) : 0;
        data.percent = percent;
        this.sliderActiveBar.setAttribute('geometry', `primitive: box; height: ${percent*sliderHeight}; width: ${data.sliderBarWidth}; depth: ${data.sliderBarDepth};`);
        this.sliderActiveBar.setAttribute('position', `0 ${percent*sliderHeight - sliderHeight*0.5 - percent *sliderHeight * 0.5} ${data.sliderBarDepth - 0.01}`);
        this.sliderBar.setAttribute('geometry', `primitive: box; width: ${data.sliderBarWidth}; height: ${sliderHeight - percent * sliderHeight}; depth: ${data.sliderBarDepth};`);
        this.sliderBar.setAttribute('position', `0 ${percent * sliderHeight * 0.5} ${data.sliderBarDepth - 0.01}`);
        this.handleContainer.setAttribute('position', `0 ${percent*sliderHeight - sliderHeight*0.5} ${data.handleOuterDepth - 0.01}`);
        this.el.setAttribute('aria-valuenow', `${percent}`);
    },
    tick: function () {
        if (!this.raycaster) { return; }  // Not intersecting.

        const elapsed = this.el.sceneEl.time;
        if (this._lastTickTime && (elapsed - this._lastTickTime) < 50) { return; }
        this._lastTickTime = elapsed;

        const el = this.el;
        const sliderHeight = this.sliderHeight;
        const intersection = this.raycaster.components.raycaster.getIntersection(el);
        if (!intersection) {
            return;
        } else {
            // full matrix transform (position + rotation + scale) so hover
            // values are correct under transformed parents
            const localCoordinates = this._toLocal
                ? this._toLocal(intersection.point)
                : intersection.point;

            // no movement along the slider axis: hide the hover indicator
            if (this.previousLocalY !== undefined && this.previousLocalY === localCoordinates.y) {
                this.hoverIndicator.setAttribute('visible', false);
                this.hoverLabel.setAttribute('visible', false);
                return;
            }
            this.previousLocalY = localCoordinates.y;
            let hoverPercent = null;
            if (localCoordinates.y <= (-sliderHeight / 2)) {
                hoverPercent = 0;
            } else if (localCoordinates.y >= (sliderHeight / 2)) {
                hoverPercent = 1.0;
            } else {
                hoverPercent = (localCoordinates.y + (sliderHeight /2)) / sliderHeight;
            }
            if (hoverPercent !== this.data.hoverPercent) {
                el.setAttribute('sxr-vertical-slider', 'hoverPercent', String(hoverPercent));
            }
            const guiInteractable = el.getAttribute("sxr-interactable");
            if (!guiInteractable) { return; }
            const hoverActionFunction = SXR.getActionFunction(guiInteractable.hoverAction);
            if (hoverActionFunction) hoverActionFunction(hoverPercent);
        }
    },
    remove: function () {
        const el = this.el;
        el.removeEventListener('mouseenter', this._onMouseEnter);
        el.removeEventListener('mouseleave', this._onMouseLeave);
        el.removeEventListener('click', this._onClick);
        el.removeEventListener('keyup', this._onKeyUp);
        el.removeEventListener('raycaster-intersected', this._onIntersected);
        el.removeEventListener('raycaster-intersected-cleared', this._onIntersectedCleared);
        el.removeEventListener('componentchanged', this._onItemChanged);
        this.raycaster = null;
        this._lastTickTime = null;
        if (this.sliderActiveBar) { SXR.removeEntity(this.sliderActiveBar); }
        if (this.sliderBar) { SXR.removeEntity(this.sliderBar); }
        if (this.hoverIndicator) { SXR.removeEntity(this.hoverIndicator); }
        if (this.handleContainer) { SXR.removeEntity(this.handleContainer); }
        this.handleContainer = null;
        this.handle = null;
        this.valueLabel = null;
        this.hoverLabel = null;
        this.sliderActiveBar = null;
        this.sliderBar = null;
        this.hoverIndicator = null;
    },
    getOutputValue: function (hover) {
        const outputValueFunction = SXR.getActionFunction(this.data.outputFunction);
        if (outputValueFunction) {
            return outputValueFunction(hover ? this.data.hoverPercent : this.data.percent);
        }
        return null;
    },
});

AFRAME.registerPrimitive( 'a-sxr-vertical-slider', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'slider' },
        'sxr-vertical-slider': { }
    },
    mappings: {
        'active-color': 'sxr-vertical-slider.activeColor',
        'background-color': 'sxr-vertical-slider.backgroundColor',
        'border-color': 'sxr-vertical-slider.borderColor',
        'handle-color': 'sxr-vertical-slider.handleColor',
        'handle-inner-depth': 'sxr-vertical-slider.handleInnerDepth',
        'handle-inner-radius': 'sxr-vertical-slider.handleInnerRadius',
        'handle-outer-depth': 'sxr-vertical-slider.handleOuterDepth',
        'handle-outer-radius': 'sxr-vertical-slider.handleOuterRadius',
        'height': 'sxr-item.height',
        'hover-color': 'sxr-vertical-slider.hoverColor',
        'hover-font-size': 'sxr-vertical-slider.hoverFontSize',
        'hover-height': 'sxr-vertical-slider.hoverHeight',
        'hover-percent': 'sxr-vertical-slider.hoverPercent',
        'hover-width': 'sxr-vertical-slider.hoverWidth',
        'keyboard-step': 'sxr-vertical-slider.keyboardStep',
        'key-code': 'sxr-interactable.keyCode',
        'key': 'sxr-interactable.key',
        'margin': 'sxr-item.margin',
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        'opacity': 'sxr-vertical-slider.opacity',
        'output-font-size': 'sxr-vertical-slider.outputFontSize',
        'output-function': 'sxr-vertical-slider.outputFunction',
        'output-text-depth': 'sxr-vertical-slider.outputTextDepth',
        'output-width': 'sxr-vertical-slider.outputWidth',
        'percent': 'sxr-vertical-slider.percent',
        'slider-bar-depth': 'sxr-vertical-slider.sliderBarDepth',
        'slider-bar-width': 'sxr-vertical-slider.sliderBarWidth',
        'top-bottom-padding': 'sxr-vertical-slider.topBottomPadding',
        'width': 'sxr-item.width',
    }
});
