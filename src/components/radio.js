'use strict';

AFRAME.registerComponent('sxr-radio', {
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
        const guiItem = el.getAttribute("sxr-item");
        this.guiItem = guiItem;
        this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);
        const guiInteractable = el.getAttribute("sxr-interactable");
        this.guiInteractable = guiInteractable;

        el.setAttribute('material', `shader: flat; depthTest:true;transparent: false; opacity: 1;  color: ${this.data.backgroundColor}; side:front;`);
        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.height};`);

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

        const radioCenter = document.createElement("a-cylinder");
        radioCenter.setAttribute('radius', guiItem.height*0.18*data.radiosizecoef);
        radioCenter.setAttribute('height', '0.02');
        radioCenter.setAttribute('rotation', '0 0 0');
        radioCenter.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
        radioBox.appendChild(radioCenter);
        this.radioCenter = radioCenter;

        this.setText(data.value);

        this.updateToggle(data.active);

        if (data.checked) {
            // initial checked state: set the resting color without animations
            radioCenter.setAttribute('material', 'color', data.activeColor);
        }

        this._onMouseEnter = function() {
            radioborder.removeAttribute('animation__leave');
            radioborder.setAttribute('animation__enter', `property: material.color; from: ${data.borderColor}; to:${data.hoverColor}; dur:200;`);
        };
        el.addEventListener('mouseenter', this._onMouseEnter);
        this._onMouseLeave = function() {
            radioborder.removeAttribute('animation__enter');
            radioborder.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.borderColor}; dur:200; easing: easeOutQuad;`);
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
            // a radio stays selected once checked; repeated clicks are a no-op
            if (data.checked) { return; }
            if (data.group) {
                const siblings = el.parentElement ? el.parentElement.querySelectorAll('[sxr-radio]') : [];
                siblings.forEach(function(sibling) {
                    if (sibling !== el) {
                        const radioComp = sibling.components && sibling.components['sxr-radio'];
                        if (radioComp && radioComp.data.group === data.group) {
                            sibling.emit('uncheck');
                        }
                    }
                });
            }
            el.setAttribute('sxr-radio', 'checked', 'true');

            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(evt);
        };
        el.addEventListener(data.on, this._onActivate);

        ////WAI ARIA Support
        el.setAttribute('role', 'radio');
        el.setAttribute('tabindex', '0');

    },
    update: function (oldData) {
        const data = this.data;
        const hasOldData = oldData && Object.keys(oldData).length > 0;

        if (hasOldData && data.checked !== oldData.checked && this.radioCenter) {
            if (data.checked) {
                this.applyCheckedVisuals();
            } else {
                this.applyUncheckedVisuals();
            }
        }
        this.updateToggle(data.active)

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
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
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
        const textEntityX = this.guiItem.height  - this.guiItem.width*0.5;
        const textWidth = Math.max(0.1, this.guiItem.width - this.guiItem.height - 0.08);
        const options = {
            value: newText,
            width: textWidth,
            height: this.guiItem.height * 0.72,
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
