'use strict';

AFRAME.registerComponent('sxr-radio', {
    dependencies: ['sxr-item', 'sxr-interactable'],
    schema: {
        on: {default: 'click'},
        value: {type: 'string', default: ''},
        group: {type: 'string', default: ''},
        active: {type: 'boolean', default: true },
        toggle: {type: 'boolean', default: false},
        toggleState: {type: 'boolean', default: false},
        checked: {type: 'boolean', default: false },
        radiosizecoef: {type: 'number', default: 1 },
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.background},
        borderColor: {type: 'string', default: SXR.colors.border},
        backgroundColor: {type: 'string', default: SXR.colors.onSurface},
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        activeColor: {type: 'string', default: SXR.colors.primary},
        handleColor: {type: 'string', default: SXR.colors.surface},
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

        if (data.checked) {
            // initial checked state: set the resting color without animations
            this.radioCenter.setAttribute('material', 'color', data.activeColor);
        }

        this._onMouseEnter = function() {
            if (!data.active) { return; }
            component.radioBorder.removeAttribute('animation__leave');
            component.radioBorder.setAttribute('animation__enter', `property: material.color; from: ${data.borderColor}; to:${data.hoverColor}; dur:200;`);
        };
        el.addEventListener('mouseenter', this._onMouseEnter);
        this._onMouseLeave = function() {
            if (!data.active) { return; }
            component.radioBorder.removeAttribute('animation__enter');
            component.radioBorder.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.borderColor}; dur:200; easing: easeOutQuad;`);
        };
        el.addEventListener('mouseleave', this._onMouseLeave);

        // group support: external check/uncheck events keep visuals in sync
        this._onCheck = function () {
            el.setAttribute('sxr-radio', 'checked', 'true');
        };
        el.addEventListener('check', this._onCheck);
        this._onUncheck = function () {
            el.setAttribute('sxr-radio', 'checked', 'false');
        };
        el.addEventListener('uncheck', this._onUncheck);

        this._onActivate = function (evt) {
            if (!data.active) { return; }
            // a radio stays selected once checked; repeated clicks are a no-op
            if (data.checked) { return; }
            if (data.group) {
                component._uncheckGroupSiblings();
            }
            el.setAttribute('sxr-radio', 'checked', 'true');

            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(evt);
        };
        el.addEventListener(data.on, this._onActivate);

        // focused keyboard operation: Space selects; arrow keys move through
        // the radios of the same group, selecting as they go (WAI-ARIA radio
        // group behavior). A bound key shortcut fires through the shared
        // registry instead, so skip the keyup path to avoid double activation.
        this._onKeyUp = function (event) {
            if (event.isComposing || event.keyCode === 229 || event.repeat) { return; }
            const interactable = el.components['sxr-interactable'];
            const boundByShortcut = interactable && interactable.matchesEvent && interactable.matchesEvent(event);

            if (SXR.keyboard.isActivationKey(event.key)) {
                if (boundByShortcut) { return; }
                event.preventDefault();
                el.emit(data.on);
                return;
            }

            if (SXR.keyboard.isArrowKey(event.key)) {
                event.preventDefault();
                component._focusGroupNeighbor(
                    event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1
                );
            }
        };
        el.addEventListener('keyup', this._onKeyUp);

        // live sxr-item updates (dimensions) rebuild the geometry + label
        this._onItemChanged = SXR.watchGuiItem(el, function () {
            component._rebuild();
        });

        ////WAI ARIA Support
        el.setAttribute('role', 'radio');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', data.value);
        el.setAttribute('aria-checked', String(data.checked));
        el.setAttribute('aria-disabled', String(!data.active));

    },
    _buildGeometry: function () {
        const data = this.data;
        const el = this.el;
        const guiItem = this.guiItem || SXR.getItem(el);

        // The backing plane is an invisible hit target covering both the
        // radio and its label; only the radio geometry and text are drawn.
        el.setAttribute('material', `shader: flat; transparent: true; opacity: 0; depthWrite: false; color: ${data.backgroundColor}; side: front;`);
        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);

        const radioBoxX = -guiItem.width*0.5 + guiItem.height*0.5;
        const radioBox = document.createElement("a-cylinder");
        radioBox.setAttribute('radius', guiItem.height*0.2*data.radiosizecoef);
        radioBox.setAttribute('height', '0.01');
        radioBox.setAttribute('rotation', '90 0 0');
        radioBox.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
        radioBox.setAttribute('position', `${radioBoxX} 0 0`);
        el.appendChild(radioBox);

        const radioborder = document.createElement("a-torus");
        radioborder.setAttribute('radius', guiItem.height*0.19*data.radiosizecoef);
        radioborder.setAttribute('radius-tubular', '0.01');
        radioborder.setAttribute('rotation', '90 0 0');
        radioborder.setAttribute('material', `color:${data.borderColor}; shader: flat;`);
        radioBox.appendChild(radioborder);
        this.radioBorder = radioborder;

        const radioCenter = document.createElement("a-cylinder");
        radioCenter.setAttribute('radius', guiItem.height*0.18*data.radiosizecoef);
        radioCenter.setAttribute('height', '0.02');
        radioCenter.setAttribute('rotation', '0 0 0');
        radioCenter.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
        radioBox.appendChild(radioCenter);
        this.radioCenter = radioCenter;
        this.radioBox = radioBox;
    },
    _uncheckGroupSiblings: function () {
        const el = this.el;
        const data = this.data;
        const siblings = el.parentElement ? el.parentElement.querySelectorAll('[sxr-radio]') : [];
        siblings.forEach(function(sibling) {
            if (sibling !== el) {
                const radioComp = sibling.components && sibling.components['sxr-radio'];
                if (radioComp && radioComp.data.group === data.group) {
                    sibling.emit('uncheck');
                }
            }
        });
    },
    // WAI-ARIA radio group navigation: move DOM focus to the previous/next
    // radio of the same group and select it
    _focusGroupNeighbor: function (direction) {
        const el = this.el;
        const data = this.data;
        const siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.querySelectorAll('[sxr-radio]')) : [el];
        const group = siblings.filter(function (sibling) {
            const radioComp = sibling.components && sibling.components['sxr-radio'];
            return radioComp && radioComp.data.group === data.group && radioComp.data.active;
        });
        if (!group.length) { return; }
        const index = group.indexOf(el);
        const next = group[(index + direction + group.length) % group.length];
        if (!next || next === el) { return; }
        if (typeof next.focus === 'function') { next.focus(); }
        const nextRadio = next.components && next.components['sxr-radio'];
        next.emit(nextRadio ? nextRadio.data.on || 'click' : 'click');
    },
    // dispose owned geometry and rebuild from current sxr-item data
    _rebuild: function () {
        const el = this.el;
        const previousItemKey = this._itemKey;
        this.guiItem = SXR.getItem(el);
        const guiItem = this.guiItem;
        this._itemKey = [guiItem.width, guiItem.height].join('|');
        if (previousItemKey !== undefined && previousItemKey === this._itemKey) { return; }

        if (this.radioBox) { SXR.removeEntity(this.radioBox); }
        this.radioBox = null;
        this.radioBorder = null;
        this.radioCenter = null;
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
        this._buildGeometry();
        if (this.data.checked) {
            this.radioCenter.setAttribute('material', 'color', this.data.activeColor);
        }
        this.setText(this.data.value);
    },
    update: function (oldData) {
        const data = this.data;
        const el = this.el;
        const hasOldData = oldData && Object.keys(oldData).length > 0;
        if (hasOldData && ['fontSize', 'fontFamily', 'fontColor', 'backgroundColor', 'borderColor', 'activeColor', 'handleColor', 'radiosizecoef'].some(key => data[key] !== oldData[key])) {
            this._itemKey = undefined;
            this._rebuild();
        }
        el.setAttribute('aria-label', data.value);

        // rebind the activation listener when the event name changes
        if (hasOldData && data.on !== oldData.on) {
            el.removeEventListener(oldData.on, this._onActivate);
            el.addEventListener(data.on, this._onActivate);
        }

        if (hasOldData && data.checked !== oldData.checked && this.radioCenter) {
            if (data.checked) {
                this.applyCheckedVisuals();
            } else {
                this.applyUncheckedVisuals();
            }
        }
        this.updateToggle(data.active)

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
        if (this.radioBox) {
            SXR.removeEntity(this.radioBox);
            this.radioBox = null;
            this.radioBorder = null;
            this.radioCenter = null;
        }
    },

    applyCheckedVisuals: function () {
        const data = this.data;
        const radioCenter = this.radioCenter;
        radioCenter.removeAttribute('animation__colorOut');
        radioCenter.removeAttribute('animation__rotationOut');
        radioCenter.removeAttribute('animation__position1Out');
        radioCenter.removeAttribute('animation__position2Out');
        radioCenter.setAttribute('animation__colorIn', `property: material.color; from: ${data.handleColor}; to:${data.activeColor}; dur:500; easing:easeInOutCubic;`);
        radioCenter.setAttribute('animation__rotationIn', `property: rotation; from: 0 0 0; to:-180 0 0; dur:500; easing:easeInOutCubic;`);
        radioCenter.setAttribute('animation__position1In', `property: position; from: 0 0 0; to:0 0.3 0; dur:200; easing:easeInOutCubic;`);
        radioCenter.setAttribute('animation__position2In', `property: position; from: 0 0.3 0; to:0 0 0; dur:200; easing:easeInOutCubic; delay:300;`);
    },
    applyUncheckedVisuals: function () {
        const data = this.data;
        const radioCenter = this.radioCenter;
        radioCenter.removeAttribute('animation__colorIn');
        radioCenter.removeAttribute('animation__rotationIn');
        radioCenter.removeAttribute('animation__position1In');
        radioCenter.removeAttribute('animation__position2In');
        radioCenter.setAttribute('animation__colorOut', `property: material.color; from: ${data.activeColor}; to:${data.handleColor}; dur:500; easing:easeInOutCubic;`);
        radioCenter.setAttribute('animation__rotationOut', `property: rotation; from: -180 0 0; to:0 0 0; dur:500; easing:easeInOutCubic;`);
        radioCenter.setAttribute('animation__position1Out', `property: position; from: 0 0 0; to:0 0.3 0; dur:200; easing:easeInOutCubic; `);
        radioCenter.setAttribute('animation__position2Out', `property: position; from: 0 0.3 0; to:0 0 0; dur:200; easing:easeInOutCubic; delay:300;`);
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

AFRAME.registerPrimitive( 'a-sxr-radio', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'radio' },
        'sxr-radio': { }
    },
    mappings: {
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        'key-code': 'sxr-interactable.keyCode',
        'key': 'sxr-interactable.key',
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        'on': 'sxr-radio.on',
        'value': 'sxr-radio.value',
        'active': 'sxr-radio.active',
        'checked': 'sxr-radio.checked',
        'group': 'sxr-radio.group',
        'font-color': 'sxr-radio.fontColor',
        'font-size': 'sxr-radio.fontSize',
        'font-family': 'sxr-radio.fontFamily',
        'border-color': 'sxr-radio.borderColor',
        'background-color': 'sxr-radio.backgroundColor',
        'hover-color': 'sxr-radio.hoverColor',
        'active-color': 'sxr-radio.activeColor',
        'handle-color': 'sxr-radio.handleColor',
        'radiosizecoef': 'sxr-radio.radiosizecoef'
    }
});
