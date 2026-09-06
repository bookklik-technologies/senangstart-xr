'use strict';

AFRAME.registerComponent('sxr-input', {
    schema: {
        on: {default: 'click'},
        value: {type: 'string', default: ''},
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.background},
        borderColor: {type: 'string', default: SXR.colors.border},
        borderHoverColor: {type: 'string', default: SXR.colors.secondary},
        backgroundColor: {type: 'string', default: SXR.colors.onSurface},
        hoverColor: {type: 'string', default: SXR.colors.onSurface},
    },
    init: function() {

        const data = this.data;
        const el = this.el;
        const guiItem = el.getAttribute("sxr-item");
        this.guiItem = guiItem;
        this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);
        const guiInteractable = el.getAttribute("sxr-interactable");
        this.guiInteractable = guiInteractable;

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', `shader: flat; transparent: false; side:front; color:${data.backgroundColor};`);

        const borderTopEntity = document.createElement("a-entity");
        borderTopEntity.setAttribute('geometry', `primitive: box; width: ${(guiItem.width)}; height: 0.05; depth: 0.02;`);
        borderTopEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        borderTopEntity.setAttribute('position', `0 ${(guiItem.height/2)-0.025} 0.01`);
        el.appendChild(borderTopEntity);
        const borderBottomEntity = document.createElement("a-entity");
        borderBottomEntity.setAttribute('geometry', `primitive: box; width: ${(guiItem.width)}; height: 0.05; depth: 0.02;`);
        borderBottomEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        borderBottomEntity.setAttribute('position', `0 -${(guiItem.height/2)-0.025} 0.01`);
        el.appendChild(borderBottomEntity);
        const borderLeftEntity = document.createElement("a-entity");
        borderLeftEntity.setAttribute('geometry', `primitive: box; width: 0.05; height: ${(guiItem.height)}; depth: 0.02;`);
        borderLeftEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        borderLeftEntity.setAttribute('position', `-${(guiItem.width/2)-0.025} 0 0.01`);
        el.appendChild(borderLeftEntity);
        const borderRightEntity = document.createElement("a-entity");
        borderRightEntity.setAttribute('geometry', `primitive: box; width: 0.05; height: ${(guiItem.height)}; depth: 0.02;`);
        borderRightEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        borderRightEntity.setAttribute('position', `${(guiItem.width/2)-0.025} 0 0.01`);
        el.appendChild(borderRightEntity);

        this.setText(data.value);

        ////WAI ARIA Support
        el.setAttribute('role', 'textbox');

        this._onMouseEnter = function () {
            el.setAttribute('material', 'color', data.hoverColor);
            borderTopEntity.setAttribute('material', 'color', data.borderHoverColor);
            borderBottomEntity.setAttribute('material', 'color', data.borderHoverColor);
            borderLeftEntity.setAttribute('material', 'color', data.borderHoverColor);
            borderRightEntity.setAttribute('material', 'color', data.borderHoverColor);
        };
        el.addEventListener('mouseenter', this._onMouseEnter);

        this._onMouseLeave = function () {
            el.setAttribute('material', 'color', data.backgroundColor);
            borderTopEntity.setAttribute('material', 'color', data.borderColor);
            borderBottomEntity.setAttribute('material', 'color', data.borderColor);
            borderLeftEntity.setAttribute('material', 'color', data.borderColor);
            borderRightEntity.setAttribute('material', 'color', data.borderColor);
        };
        el.addEventListener('mouseleave', this._onMouseLeave);

        this._onClick = function (evt) {
            const guiInteractable = el.getAttribute("sxr-interactable");
            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(evt);
        };
        el.addEventListener(data.on, this._onClick);


    },
    remove: function () {
        const el = this.el;
        el.removeEventListener('mouseenter', this._onMouseEnter);
        el.removeEventListener('mouseleave', this._onMouseLeave);
        el.removeEventListener(this.data.on, this._onClick);
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
    },
    setText: function (newText) {
        const options = {
            value: newText,
            width: this.guiItem.width * 0.9,
            height: this.guiItem.height * 0.72,
            fontSize: this.normalizedFontSize,
            fontFamily: this.data.fontFamily,
            color: this.data.fontColor,
            align: 'left'
        };
        // per-keystroke redraws reuse the existing canvas/texture
        if (this.textEntity && SXR.redrawTextEntity(this.textEntity, options)) { return; }
        if (this.textEntity) { SXR.removeEntity(this.textEntity); }
        const textEntity = SXR.createTextEntity(options);
        this.textEntity = textEntity;
        textEntity.setAttribute('position', `0 0 0.05`);
        this.el.appendChild(textEntity);
    },
    update: function (_oldData) {
        if (this.textEntity) {
            this.setText(this.data.value);
        }
    },
    appendText(text) {
        const newText = this.data.value + text;
        this.el.setAttribute('sxr-input', 'value', newText);
    },
    delete() {
        if (this.data.value && this.data.value.length > 0) {
            const newText = this.data.value.slice(0, -1);
            this.el.setAttribute('sxr-input', 'value', newText);
        }
    }
});

AFRAME.registerPrimitive( 'a-sxr-input', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'input' },
        'sxr-input': { }
    },
    mappings: {
        //gui interactable general
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        //gui item general
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        //gui input specific
        'value': 'sxr-input.value',
        'font-size': 'sxr-input.fontSize',
        'font-family': 'sxr-input.fontFamily',
        'font-color': 'sxr-input.fontColor',
        'background-color': 'sxr-input.backgroundColor',
        'hover-color': 'sxr-input.hoverColor',
        'border-color': 'sxr-input.borderColor',
        'border-hover-color': 'sxr-input.borderHoverColor',
    }
});
