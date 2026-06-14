'use strict';

AFRAME.registerComponent('sxr-icon-button', {
    schema: {
        on: {default: 'click'},
        toggle: {type: 'boolean', default: false},
        toggleState: {type: 'boolean', default: false},
        icon: {type: 'string', default: 'check'},
        iconActive: {type: 'string', default: ''},
        iconFontSize: {type: 'number', default: 0.4},
        iconFont: {type: 'string', default: ''},
        fontColor: {type: 'string', default: SXR.colors.onSurface},
        borderColor: {type: 'string', default: SXR.colors.border},
        backgroundColor: {type: 'string', default: SXR.colors.surface},
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        activeColor: {type: 'string', default: SXR.colors.primary},
    },
    init: function() {

        const data = this.data;
        const el = this.el;
        const guiItem = el.getAttribute("sxr-item");
        this.guiItem = guiItem;        
        this.checkedState = data.toggleState;
        this.normalizedFontSize = SXR.normalizeFontSize(data.iconFontSize);
        const guiInteractable = el.getAttribute("sxr-interactable");
        this.guiInteractable = guiInteractable;

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', `shader: flat; transparent: true; opacity: 0.0; alphaTest: 0.5; side:double; color:${data.backgroundColor};`);

        const buttonContainer = document.createElement("a-entity");
        buttonContainer.setAttribute('geometry', `primitive: cylinder; radius: ${guiItem.height/2}; height: 0.02;`);
        buttonContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        buttonContainer.setAttribute('rotation', '90 0 0');
        buttonContainer.setAttribute('position', '0 0 0.01');
        el.appendChild(buttonContainer);

        const buttonEntity = document.createElement("a-entity");
        buttonEntity.setAttribute('geometry', `primitive: cylinder; radius: ${(guiItem.height/2.05)}; height: 0.04;`);
        buttonEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.backgroundColor}`);
        buttonEntity.setAttribute('rotation', '90 0 0');
        buttonEntity.setAttribute('position', '0 0 0.02');
        el.appendChild(buttonEntity);
        this.buttonEntity = buttonEntity;

        this.setIcon(data.icon);

        el.addEventListener('mouseenter', function() {
            buttonEntity.removeAttribute('animation__leave');
            if (!(data.toggle)) {
                buttonEntity.setAttribute('animation__enter', `property: material.color; from: ${data.backgroundColor}; to:${data.hoverColor}; dur:200;`);
            }
        });
        el.addEventListener('mouseleave', function() {
            if (!(data.toggle)) {
                buttonEntity.removeAttribute('animation__click');
                buttonEntity.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.backgroundColor}; dur:200; easing: easeOutQuad;`);
            }
            buttonEntity.removeAttribute('animation__enter');
        });
        el.addEventListener(data.on, function(event) {
            if (!(data.toggle)) { // if not toggling flashing active state
                buttonEntity.setAttribute('animation__click', `property: material.color; from: ${data.activeColor}; to:${data.backgroundColor}; dur:400; easing: easeOutQuad;`);
            }else{
                const guiButton = el.components['sxr-icon-button'];
                guiButton.setActiveState(!guiButton.data.toggleState);
            }

            const clickActionFunctionName = guiInteractable.clickAction;
            const clickActionFunction = window[clickActionFunctionName];
            if (typeof clickActionFunction === "function") clickActionFunction(event);
        });
        ////WAI ARIA Support
        el.setAttribute('role', 'button');


    },
    update: function (_oldData) {
        if(this.iconEntity){

            SXR.removeEntity(this.iconEntity);

            this.setIcon(this.data.icon);
   
        }       
    },
    setActiveState: function (activeState) {
        this.data.toggleState = activeState;
        if (!activeState) {
            this.buttonEntity.setAttribute('material', 'color', this.data.backgroundColor);
        } else {
            this.buttonEntity.setAttribute('material', 'color', this.data.activeColor);
        }
    },
    setIcon: function (icon) {
        const iconEntity = SXR.createIconEntity({
            icon,
            width: this.normalizedFontSize,
            height: this.normalizedFontSize,
            color: this.data.fontColor
        });
        this.iconEntity = iconEntity;
        iconEntity.setAttribute('position', `0 0 0.05`);
        this.el.appendChild(iconEntity);
    }
});

AFRAME.registerPrimitive( 'a-sxr-icon-button', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'icon-button' },
        'sxr-icon-button': { }
    },
    mappings: {
        //gui interactable general
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        'key-code': 'sxr-interactable.keyCode',
        //gui item general
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        //gui button specific
        'on': 'sxr-icon-button.on',
        'font-color': 'sxr-icon-button.fontColor',
        'font-family': 'sxr-icon-button.fontFamily',
        'border-color': 'sxr-icon-button.borderColor',
        'background-color': 'sxr-icon-button.backgroundColor',
        'hover-color': 'sxr-icon-button.hoverColor',
        'active-color': 'sxr-icon-button.activeColor',
        'icon': 'sxr-icon-button.icon',
        'icon-active': 'sxr-icon-button.iconActive',
        'icon-font': 'sxr-icon-button.iconFont',
        'icon-font-size': 'sxr-icon-button.iconFontSize',
        'toggle': 'sxr-icon-button.toggle',
        'toggle-state': 'sxr-icon-button.toggleState'        
    }
});
