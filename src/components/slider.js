'use strict';

AFRAME.registerComponent('sxr-slider', {
    dependencies: ['sxr-item', 'sxr-interactable'],
    schema: {
        activeColor: {type: 'string', default: SXR.colors.primary},
        backgroundColor: {type: 'string', default: SXR.colors.onSurface},
        borderColor: {type: 'string', default: SXR.colors.neutral},
        handleColor: {type: 'string', default: SXR.colors.onSurface},
        handleInnerDepth: {type: 'number', default: 0.02 },
        handleInnerRadius: {type: 'number', default: 0.13 },
        handleOuterDepth: {type: 'number', default: 0.04 },
        handleOuterRadius: {type: 'number', default: 0.17 },
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        keyboardStep: {type: 'number', default: 0.05 },
        leftRightPadding: {type: 'number', default: 0.25 },
        percent: {type: 'number', default: 0.5 },
        sliderBarHeight: {type: 'number', default: 0.05 },
        sliderBarDepth: {type: 'number', default: 0.03 },
        topBottomPadding: {type: 'number', default: 0.125 },
    },
    init: function() {

        const data = this.data;
        const el = this.el;
        const component = this;
        const guiItem = SXR.getItem(el);
        this.guiItem = guiItem;
        const sliderWidth = Math.max(0.001, guiItem.width - data.leftRightPadding*2.0);
        this.sliderWidth = sliderWidth;
        // reusable vectors: the incoming intersection point must never be
        // mutated (worldToLocal transforms in place), and rotated/scaled
        // parents need a fresh world matrix
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
        el.setAttribute('material', `shader: flat; opacity: 1;  color: ${data.backgroundColor}; side:front;`);

        const sliderActiveBar = document.createElement("a-entity");
        sliderActiveBar.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor};`);
        el.appendChild(sliderActiveBar);
        this.sliderActiveBar = sliderActiveBar;

        const sliderBar = document.createElement("a-entity");
        sliderBar.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor};`);
        el.appendChild(sliderBar);
        this.sliderBar = sliderBar;

        const handleContainer = document.createElement("a-entity");
        this.handleContainer = handleContainer;
        handleContainer.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleOuterRadius}; height: ${data.handleOuterDepth};`);
        handleContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor};`);
        handleContainer.setAttribute('rotation', '90 0 0');
        el.appendChild(handleContainer);

        const handle = document.createElement("a-entity");
        this.handle = handle;
        handle.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleInnerRadius}; height: ${data.handleInnerDepth};`);
        handle.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.handleColor};`);
        handle.setAttribute('position', `0 ${data.handleInnerDepth} 0`);
        handleContainer.appendChild(handle);

        const updateSlider = function(percent) {
            const sliderWidth = component.sliderWidth;
            data.percent = Number.isFinite(Number(percent)) ? Math.min(1, Math.max(0, Number(percent))) : 0;
            const activeWidth = data.percent * sliderWidth;
            const inactiveWidth = sliderWidth - activeWidth;
            const leftEdge = -sliderWidth / 2;
            const handleX = leftEdge + activeWidth;

            sliderActiveBar.setAttribute('geometry', `primitive: box; width: ${activeWidth}; height: ${data.sliderBarHeight}; depth: ${data.sliderBarDepth};`);
            sliderActiveBar.setAttribute('position', `${leftEdge + activeWidth / 2} 0 ${data.sliderBarDepth - 0.01}`);
            sliderBar.setAttribute('geometry', `primitive: box; width: ${inactiveWidth}; height: ${data.sliderBarHeight}; depth: ${data.sliderBarDepth};`);
            sliderBar.setAttribute('position', `${handleX + inactiveWidth / 2} 0 ${data.sliderBarDepth - 0.01}`);
            handleContainer.setAttribute('position', `${handleX} 0 ${data.handleOuterDepth - 0.01}`);
            el.setAttribute('aria-valuenow', `${data.percent}`);
        };
        this._updateSlider = updateSlider;

        updateSlider(data.percent);

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
            const sliderBarWidth = component.sliderWidth || sliderWidth;
            let percent;
            if (localCoordinates.x <= (-sliderBarWidth / 2)) {
                percent = 0;
            } else if (localCoordinates.x >= (sliderBarWidth / 2)) {
                percent = 1.0;
            } else {
                percent = (localCoordinates.x + (sliderBarWidth /2)) / sliderBarWidth;
            }
            updateSlider(percent);
            const guiInteractable = el.getAttribute("sxr-interactable");
            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(evt, data.percent);
        };

        el.addEventListener('click', this._onClick);

        // focused keyboard operation: arrows step the value, Home/End jump to
        // the extremes. The action callback keeps the click signature
        // (event, percent).
        this._onKeyUp = function (event) {
            if (event.isComposing || event.keyCode === 229 || event.repeat) { return; }
            let percent = null;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                percent = data.percent - data.keyboardStep;
            } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                percent = data.percent + data.keyboardStep;
            } else if (event.key === 'Home') {
                percent = 0;
            } else if (event.key === 'End') {
                percent = 1;
            }
            if (percent === null) { return; }
            event.preventDefault();
            updateSlider(percent);
            const guiInteractable = el.getAttribute("sxr-interactable");
            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(event, data.percent);
        };
        el.addEventListener('keyup', this._onKeyUp);

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
        el.setAttribute('aria-orientation', 'horizontal');

    },
    _rebuild: function () {
        const el = this.el;
        this.guiItem = SXR.getItem(el);
        const guiItem = this.guiItem;

        const data = this.data;
        this.sliderWidth = Math.max(0.001, guiItem.width - data.leftRightPadding*2.0);
        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', 'color', data.backgroundColor);
        this.sliderActiveBar.setAttribute('material', 'color', data.activeColor);
        this.sliderBar.setAttribute('material', 'color', data.borderColor);
        this.handleContainer.setAttribute('material', 'color', data.borderColor);
        this.handleContainer.setAttribute('geometry', {primitive: 'cylinder', radius: data.handleOuterRadius, height: data.handleOuterDepth});
        this.handle.setAttribute('material', 'color', data.handleColor);
        this.handle.setAttribute('geometry', {primitive: 'cylinder', radius: data.handleInnerRadius, height: data.handleInnerDepth});
        this.handle.setAttribute('position', `0 ${data.handleInnerDepth} 0`);
        if (this._updateSlider) { this._updateSlider(data.percent); }
    },
    update: function (oldData) {
        const data = this.data;
        if (this.sliderActiveBar && oldData && Object.keys(data).some(key => key !== 'percent' && data[key] !== oldData[key])) {
            this._rebuild();
        }
        // `percent` is live: setAttribute after init moves the handle
        if (this._updateSlider && oldData && oldData.percent !== undefined && oldData.percent !== data.percent) {
            this._updateSlider(data.percent);
        }
        // rebind nothing: click/keyboard listeners are event-name independent
    },
    remove: function () {
        const el = this.el;
        el.removeEventListener('mouseenter', this._onMouseEnter);
        el.removeEventListener('mouseleave', this._onMouseLeave);
        el.removeEventListener('click', this._onClick);
        el.removeEventListener('keyup', this._onKeyUp);
        el.removeEventListener('componentchanged', this._onItemChanged);
        if (this.sliderActiveBar) { SXR.removeEntity(this.sliderActiveBar); }
        if (this.sliderBar) { SXR.removeEntity(this.sliderBar); }
        if (this.handleContainer) { SXR.removeEntity(this.handleContainer); }
        this.handleContainer = null;
        this.handle = null;
        this.sliderActiveBar = null;
        this.sliderBar = null;
    },
});

AFRAME.registerPrimitive( 'a-sxr-slider', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'slider' },
        'sxr-slider': { }
    },
    mappings: {
        'active-color': 'sxr-slider.activeColor',
        'background-color': 'sxr-slider.backgroundColor',
        'border-color': 'sxr-slider.borderColor',
        'handle-color': 'sxr-slider.handleColor',
        'handle-inner-depth': 'sxr-slider.handleInnerDepth',
        'handle-inner-radius': 'sxr-slider.handleInnerRadius',
        'handle-outer-depth': 'sxr-slider.handleOuterDepth',
        'handle-outer-radius': 'sxr-slider.handleOuterRadius',
        'height': 'sxr-item.height',
        'hover-color': 'sxr-slider.hoverColor',
        'keyboard-step': 'sxr-slider.keyboardStep',
        'key-code': 'sxr-interactable.keyCode',
        'key': 'sxr-interactable.key',
        'left-right-padding': 'sxr-slider.leftRightPadding',
        'margin': 'sxr-item.margin',
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        'percent': 'sxr-slider.percent',
        'slider-bar-depth': 'sxr-slider.sliderBarDepth',
        'slider-bar-height': 'sxr-slider.sliderBarHeight',
        'top-bottom-padding': 'sxr-slider.topBottomPadding',
        'width': 'sxr-item.width',
    }
});
