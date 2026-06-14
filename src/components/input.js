'use strict';

AFRAME.registerComponent('sxr-input', {
    schema: {
        align: {type: 'string', default: 'left'},
        on: {default: 'click'},
        value: {type: 'string', default: ''},
        toggle: {type: 'boolean', default: false},
        toggleState: {type: 'boolean', default: false},
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.background},
        borderColor: {type: 'string', default: SXR.colors.border},
        borderHoverColor: {type: 'string', default: SXR.colors.secondary},
        backgroundColor: {type: 'string', default: SXR.colors.onSurface},
        hoverColor: {type: 'string', default: SXR.colors.onSurface},
        activeColor: {type: 'string', default: SXR.colors.primary},
    },
    init: function() {

        const data = this.data;
        const el = this.el;
        const guiItem = el.getAttribute("sxr-item");
        this.guiItem = guiItem;        
        this.checkedState = data.toggle;
        this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);
        const guiInteractable = el.getAttribute("sxr-interactable");
        this.guiInteractable = guiInteractable;

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', `shader: flat; transparent: false; side:front; color:${data.backgroundColor};`);

        const borderTopEntity = document.createElement("a-entity");
        borderTopEntity.setAttribute('geometry', `primitive: box; width: ${(guiItem.width)}; height: 0.05; depth: 0.02;`);
        borderTopEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        borderTopEntity.setAttribute('position', `0 -${(guiItem.height/2)-0.025} 0.01`);
        el.appendChild(borderTopEntity);
        const borderBottomEntity = document.createElement("a-entity");
        borderBottomEntity.setAttribute('geometry', `primitive: box; width: ${(guiItem.width)}; height: 0.05; depth: 0.02;`);
        borderBottomEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        borderBottomEntity.setAttribute('position', `0 ${(guiItem.height/2)-0.025} 0.01`);
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
        el.setAttribute('role', 'input');

        el.addEventListener('mouseenter', function () {
            el.setAttribute('material', 'color', data.hoverColor);
            borderTopEntity.setAttribute('material', 'color', data.borderHoverColor);
            borderBottomEntity.setAttribute('material', 'color', data.borderHoverColor);
            borderLeftEntity.setAttribute('material', 'color', data.borderHoverColor);
            borderRightEntity.setAttribute('material', 'color', data.borderHoverColor);
        });

        el.addEventListener('mouseleave', function () {
            el.setAttribute('material', 'color', data.backgroundColor);
            borderTopEntity.setAttribute('material', 'color', data.borderColor);
            borderBottomEntity.setAttribute('material', 'color', data.borderColor);
            borderLeftEntity.setAttribute('material', 'color', data.borderColor);
            borderRightEntity.setAttribute('material', 'color', data.borderColor);
        });

        el.addEventListener(data.on, function (evt) {
            const guiInteractable = el.getAttribute("sxr-interactable");
            const clickActionFunctionName = guiInteractable.clickAction;
            // find object
            const clickActionFunction = window[clickActionFunctionName];
            // is object a function?
            if (typeof clickActionFunction === "function") clickActionFunction(evt);
        });


    },
    setText: function (newText) {
        const textEntity = SXR.createTextEntity({
            value: newText,
            width: this.guiItem.width * 0.9,
            height: this.guiItem.height * 0.72,
            fontSize: this.normalizedFontSize,
            fontFamily: this.data.fontFamily,
            color: this.data.fontColor,
            align: 'left'
        });
        this.textEntity = textEntity;
        textEntity.setAttribute('position', `0 0 0.05`);
        this.el.appendChild(textEntity);
    },
    update: function (_oldData) {
        const data = this.data;
        SXR.removeEntity(this.textEntity);
        this.setText(data.value);
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
