'use strict';

AFRAME.registerComponent('sxr-toggle', {
    dependencies: ['sxr-item', 'sxr-interactable'],
    schema: {
        on: {default: 'click'},
        value: {type: 'string', default: ''},
        toggle: {type: 'boolean', default: false},
        toggleState: {type: 'boolean', default: false},
        active: {type: 'boolean', default: true },
        checked: {type: 'boolean', default: false },
        borderWidth: {type: 'number', default: 1 },
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.background},
        borderColor: {type: 'string', default: SXR.colors.border},
        backgroundColor: {type: 'string', default: SXR.colors.onSurface},
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        activeColor: {type: 'string', default: SXR.colors.primary},
        handleColor: {type: 'string', default: SXR.colors.onSurface},
    },
    init: function() {

        const data = this.data;
        const el = this.el;
        const component = this;
        const guiItem = SXR.getItem(el);
        this.guiItem = guiItem;
        this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);
        const guiInteractable = el.getAttribute("sxr-interactable");
        this.guiInteractable = guiInteractable;

        this._buildGeometry();

        this.setText(data.value);

        this.updateToggle(data.active);

        this._onMouseEnter = function() {
            if (!data.active) { return; }
            component.toggleHandle.removeAttribute('animation__leave');
            component.toggleHandle.setAttribute('animation__enter', `property: material.color; from: ${data.handleColor}; to:${data.hoverColor}; dur:200;`);
        };
        el.addEventListener('mouseenter', this._onMouseEnter);
        this._onMouseLeave = function() {
            if (!data.active) { return; }
            component.toggleHandle.removeAttribute('animation__enter');
            component.toggleHandle.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.handleColor}; dur:200; easing: easeOutQuad;`);
        };
        el.addEventListener('mouseleave', this._onMouseLeave);

        this._onCheck = function () {
            el.setAttribute('sxr-toggle', 'checked', 'true');
        };
        el.addEventListener("check", this._onCheck);
        this._onUncheck = function () {
            el.setAttribute('sxr-toggle', 'checked', 'false');
        };
        el.addEventListener("uncheck", this._onUncheck);

        this._onActivate = function (evt) {
            if (!data.active) { return; }
            el.setAttribute('sxr-toggle', 'checked', String(!data.checked));
            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(evt);
        };
        el.addEventListener(data.on, this._onActivate);

        // focused keyboard operation: Enter/Space activate (respecting the
        // disabled state); a bound key shortcut fires through the shared
        // registry instead, so skip the keyup path to avoid double activation
        this._onKeyUp = function (event) {
            if (event.isComposing || event.keyCode === 229 || event.repeat) { return; }
            if (!(event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar')) { return; }
            const interactable = el.components['sxr-interactable'];
            if (interactable && interactable.matchesEvent && interactable.matchesEvent(event)) { return; }
            event.preventDefault();
            el.emit(data.on);
        };
        el.addEventListener('keyup', this._onKeyUp);

        // live sxr-item updates (dimensions) rebuild the geometry + label
        this._onItemChanged = SXR.watchGuiItem(el, function () {
            component._rebuild();
        });

        ////WAI ARIA Support
        el.setAttribute('role', 'switch');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', data.value);
        el.setAttribute('aria-checked', String(data.checked));
        el.setAttribute('aria-disabled', String(!data.active));

    },
    _buildGeometry: function () {
        const data = this.data;
        const el = this.el;
        const guiItem = this.guiItem || SXR.getItem(el);

        // Keep the entire labelled row raycastable without painting a square
        // behind the text or hiding scene geometry in the depth buffer.
        el.setAttribute('material', `shader: flat; transparent: true; opacity: 0; depthWrite: false; color: ${data.backgroundColor}; side: front;`);
        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);

        const toggleTrackWidth = guiItem.height*0.9;
        const toggleTrackHeight = guiItem.height*0.48;
        const toggleTrackX = -guiItem.width*0.5 + guiItem.height/2;
        const toggleTrack = document.createElement("a-rounded");

        toggleTrack.setAttribute('rounded', {
            width: toggleTrackWidth,
            height: toggleTrackHeight,
            radius: toggleTrackHeight/2,
            color: data.checked ? data.activeColor : data.borderColor
        });
        toggleTrack.setAttribute('position', `${toggleTrackX} 0 0.01`);
        el.appendChild(toggleTrack);
        this.toggleTrack = toggleTrack;

        const toggleHandleRadius = toggleTrackHeight*0.4;
        const toggleHandleInset = toggleTrackHeight*0.1;
        this.toggleHandleXStart = -toggleTrackWidth/2 + toggleHandleRadius + toggleHandleInset;
        this.toggleHandleXEnd = toggleTrackWidth/2 - toggleHandleRadius - toggleHandleInset;
        const toggleHandle = document.createElement("a-circle");

        toggleHandle.setAttribute('geometry', `primitive: circle; radius: ${toggleHandleRadius}; segments: 32;`);
        toggleHandle.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
        toggleHandle.setAttribute('position', `${data.checked ? this.toggleHandleXEnd : this.toggleHandleXStart} 0 0.02`);
        toggleTrack.appendChild(toggleHandle);
        this.toggleHandle = toggleHandle;
    },
    // dispose owned geometry and rebuild from current sxr-item data
    _rebuild: function () {
        const el = this.el;
        const previousItemKey = this._itemKey;
        this.guiItem = SXR.getItem(el);
        const guiItem = this.guiItem;
        this._itemKey = [guiItem.width, guiItem.height].join('|');
        if (previousItemKey !== undefined && previousItemKey === this._itemKey) { return; }

        if (this.toggleTrack) { SXR.removeEntity(this.toggleTrack); }
        this.toggleTrack = null;
        this.toggleHandle = null;
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
        this._buildGeometry();
        if (this.data.checked) {
            this.toggleTrack.setAttribute('rounded', 'color', this.data.activeColor);
        }
        this.setText(this.data.value);
    },
    update: function (oldData) {
        const data = this.data;
        const el = this.el;
        const hasOldData = oldData && Object.keys(oldData).length > 0;
        if (hasOldData && ['fontSize', 'fontFamily', 'fontColor', 'backgroundColor', 'borderColor', 'activeColor', 'handleColor'].some(key => data[key] !== oldData[key])) {
            this._itemKey = undefined;
            this._rebuild();
        }
        el.setAttribute('aria-label', data.value);

        // rebind the activation listener when the event name changes
        if (hasOldData && data.on !== oldData.on) {
            el.removeEventListener(oldData.on, this._onActivate);
            el.addEventListener(data.on, this._onActivate);
        }

        if (hasOldData && data.checked !== oldData.checked && this.toggleTrack && this.toggleHandle) {
            this.applyCheckedVisuals(data.checked);
        }
        this.updateToggle(data.active);

        if (hasOldData && data.checked !== oldData.checked) {
            el.setAttribute('aria-checked', String(data.checked));
        }

        if (hasOldData && data.value !== oldData.value && this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.setText(data.value);
        }

    },

    remove: function () {
        const el = this.el;
        el.removeEventListener('mouseenter', this._onMouseEnter);
        el.removeEventListener('mouseleave', this._onMouseLeave);
        el.removeEventListener('check', this._onCheck);
        el.removeEventListener('uncheck', this._onUncheck);
        el.removeEventListener(this.data.on, this._onActivate);
        el.removeEventListener('keyup', this._onKeyUp);
        el.removeEventListener('componentchanged', this._onItemChanged);
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
        if (this.toggleTrack) {
            SXR.removeEntity(this.toggleTrack);
            this.toggleTrack = null;
            this.toggleHandle = null;
        }
    },

    applyCheckedVisuals: function (checked) {
        const data = this.data;
        const toggleTrack = this.toggleTrack;
        const toggleHandle = this.toggleHandle;
        if (checked) {
            toggleTrack.removeAttribute('animation__colorOut');
            toggleHandle.removeAttribute('animation__positionOut');
            toggleTrack.setAttribute('animation__colorIn', `property: rounded.color; from: ${data.borderColor}; to:${data.activeColor}; dur:200; easing:easeInOutCubic;`);
            toggleHandle.setAttribute('animation__positionIn', `property: position; from: ${this.toggleHandleXStart} 0 0.02; to:${this.toggleHandleXEnd} 0 0.02; dur:200; easing:easeInOutCubic;`);
        }else{
            toggleTrack.removeAttribute('animation__colorIn');
            toggleHandle.removeAttribute('animation__positionIn');
            toggleTrack.setAttribute('animation__colorOut', `property: rounded.color; from: ${data.activeColor}; to:${data.borderColor}; dur:200; easing:easeInOutCubic;`);
            toggleHandle.setAttribute('animation__positionOut', `property: position; from: ${this.toggleHandleXEnd} 0 0.02; to:${this.toggleHandleXStart} 0 0.02; dur:200; easing:easeInOutCubic;`);
        }
    },

    updateToggle: function(active){
        this.el.setAttribute('aria-disabled', (!active).toString());

    },
    setText: function (newText) {
        this.normalizedFontSize = SXR.normalizeFontSize(this.data.fontSize);
        const guiItem = this.guiItem || SXR.getItem(this.el);
        const textEntityX = guiItem.height  - guiItem.width*0.5;
        const textWidth = Math.max(0.1, guiItem.width - guiItem.height - 0.08);
        const options = {
            value: newText,
            width: textWidth,
            height: guiItem.height * 0.72,
            fontSize: this.normalizedFontSize,
            fontFamily: this.data.fontFamily,
            color: this.data.fontColor,
            align: 'left'
        };
        if (this.textEntity && SXR.redrawTextEntity(this.textEntity, options)) { return; }
        if (this.textEntity) { SXR.removeEntity(this.textEntity); }
        const textEntity = SXR.createTextEntity(options);
        this.textEntity = textEntity;
        textEntity.setAttribute('position', `${textEntityX + textWidth / 2} 0 0.05`);
        this.el.appendChild(textEntity);
    }
});

AFRAME.registerPrimitive( 'a-sxr-toggle', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'toggle' },
        'sxr-toggle': { }
    },
    mappings: {
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        'key-code': 'sxr-interactable.keyCode',
        'key': 'sxr-interactable.key',
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        'on': 'sxr-toggle.on',
        'active': 'sxr-toggle.active',
        'checked': 'sxr-toggle.checked',
        'value': 'sxr-toggle.value',
        'font-color': 'sxr-toggle.fontColor',
        'font-family': 'sxr-toggle.fontFamily',
        'font-size': 'sxr-toggle.fontSize',
        'border-width': 'sxr-toggle.borderWidth',
        'border-color': 'sxr-toggle.borderColor',
        'background-color': 'sxr-toggle.backgroundColor',
        'hover-color': 'sxr-toggle.hoverColor',
        'active-color': 'sxr-toggle.activeColor',
        'handle-color': 'sxr-toggle.handleColor',
        'toggle': 'sxr-toggle.toggle',
        'toggle-state': 'sxr-toggle.toggleState'
    }
});
