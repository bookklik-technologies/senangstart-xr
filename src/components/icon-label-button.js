'use strict';

AFRAME.registerComponent('sxr-icon-label-button', {
    dependencies: ['sxr-item', 'sxr-interactable'],
    schema: {
        on: {default: 'click'},
        toggle: {type: 'boolean', default: false},
        toggleState: {type: 'boolean', default: false},
        icon: {type: 'string', default: 'check'},
        iconActive: {type: 'string', default: ''},
        iconFontSize: {type: 'number', default: 0.35},
        iconFont: {type: 'string', default: ''},
        iconOcclusion: {type: 'boolean', default: false},
        value: {type: 'string', default: ''},
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.onSurface},
        borderColor: {type: 'string', default: SXR.colors.border},
        backgroundColor: {type: 'string', default: SXR.colors.surface},
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        activeColor: {type: 'string', default: SXR.colors.primary},
    },
    init: function() {

        const data = this.data;
        const el = this.el;
        const component = this;
        const guiItem = SXR.getItem(el);
        this.guiItem = guiItem;
        this.normalizedIconFontSize = SXR.normalizeFontSize(data.iconFontSize);
        this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);
        const guiInteractable = el.getAttribute("sxr-interactable");
        this.guiInteractable = guiInteractable;

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', `shader: flat; side:front; color:${data.backgroundColor};`);

        const buttonContainer = document.createElement("a-entity");
        buttonContainer.setAttribute('geometry', `primitive: box; width: ${guiItem.width}; height: ${guiItem.height}; depth: 0.02;`);
        buttonContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        buttonContainer.setAttribute('rotation', '0 0 0');
        buttonContainer.setAttribute('position', '0 0 0.01');
        el.appendChild(buttonContainer);
        this.buttonContainer = buttonContainer;

        const buttonEntity = document.createElement("a-entity");
        buttonEntity.setAttribute('geometry', `primitive: box; width: ${(guiItem.width-0.025)}; height: ${(guiItem.height-0.025)}; depth: 0.04;`);
        buttonEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.toggleState ? data.activeColor : data.backgroundColor}`);
        buttonEntity.setAttribute('rotation', '0 0 0');
        buttonEntity.setAttribute('position', '0 0 0.02');
        el.appendChild(buttonEntity);
        this.buttonEntity = buttonEntity;

        this.setIcon(this.getIconName());

        if(data.value !== ''){ this.setText(data.value) }

        this._onMouseEnter = function() {
            component.buttonEntity.removeAttribute('animation__leave');
            if (!(data.toggle)) {
                component.buttonEntity.setAttribute('animation__enter', `property: material.color; from: ${data.backgroundColor}; to:${data.hoverColor}; dur:200;`);
            }
        };
        el.addEventListener('mouseenter', this._onMouseEnter);
        this._onMouseLeave = function() {
            if (!(data.toggle)) {
                component.buttonEntity.removeAttribute('animation__click');
                component.buttonEntity.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.backgroundColor}; dur:200; easing: easeOutQuad;`);
            }
            component.buttonEntity.removeAttribute('animation__enter');
        };
        el.addEventListener('mouseleave', this._onMouseLeave);
        this._onClick = function(event) {
            if (!(data.toggle)) { // if not toggling flashing active state
                component.buttonEntity.setAttribute('animation__click', `property: material.color; from: ${data.activeColor}; to:${data.backgroundColor}; dur:400; easing: easeOutQuad;`);
            }else{
                component.setActiveState(!data.toggleState);
            }

            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(event);
        };
        el.addEventListener(data.on, this._onClick);

        // focused keyboard operation: Enter/Space activate (a bound key
        // shortcut fires through the shared registry, so skip to avoid
        // duplicate activation)
        this._onKeyUp = function (event) {
            if (event.isComposing || event.keyCode === 229 || event.repeat) { return; }
            if (!(event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar')) { return; }
            const interactable = el.components['sxr-interactable'];
            if (interactable && interactable.matchesEvent && interactable.matchesEvent(event)) { return; }
            event.preventDefault();
            el.emit(data.on);
        };
        el.addEventListener('keyup', this._onKeyUp);

        ////WAI ARIA Support
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', data.value);
        this._onItemChanged = SXR.watchGuiItem(el, () => this._resize());


    },
    update: function (oldData) {
        const data = this.data;
        const el = this.el;
        const hasOld = oldData && Object.keys(oldData).length > 0;
        this.buttonContainer.setAttribute('material', 'color', data.borderColor);
        this.buttonEntity.setAttribute('material', 'color', data.toggleState ? data.activeColor : data.backgroundColor);
        if (data.toggle) el.setAttribute('aria-pressed', String(data.toggleState));

        // rebind the activation listener when the event name changes
        if (hasOld && data.on !== oldData.on) {
            el.removeEventListener(oldData.on, this._onClick);
            el.addEventListener(data.on, this._onClick);
        }

        const iconKey = [this.getIconName(), data.fontColor, data.iconFontSize, data.value !== '', data.iconOcclusion].join('|');
        if (!hasOld || iconKey !== this._lastIconKey) {
            this._lastIconKey = iconKey;
            if (this.iconEntity) {
                this.setIcon(this.getIconName());
            }
        }

        const textKey = [data.value, data.fontSize, data.fontFamily, data.fontColor].join('|');
        if (!hasOld || textKey !== this._lastTextKey) {
            this._lastTextKey = textKey;
            el.setAttribute('aria-label', data.value);
            this.setText(this.data.value);
        }

    },
    _resize: function () {
        this.guiItem = SXR.getItem(this.el);
        const {width, height} = this.guiItem;
        this.el.setAttribute('geometry', {primitive: 'plane', width, height});
        this.buttonContainer.setAttribute('geometry', {primitive: 'box', width, height, depth: 0.02});
        this.buttonEntity.setAttribute('geometry', {primitive: 'box', width: Math.max(0.001, width - 0.025), height: Math.max(0.001, height - 0.025), depth: 0.04});
        this.setIcon(this.getIconName());
        this.setText(this.data.value);
    },
    remove: function () {
        const el = this.el;
        el.removeEventListener('mouseenter', this._onMouseEnter);
        el.removeEventListener('mouseleave', this._onMouseLeave);
        el.removeEventListener(this.data.on, this._onClick);
        el.removeEventListener('keyup', this._onKeyUp);
        el.removeEventListener('componentchanged', this._onItemChanged);
        if (this.iconEntity) {
            SXR.removeEntity(this.iconEntity);
            this.iconEntity = null;
        }
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
        if (this.buttonContainer) {
            SXR.removeEntity(this.buttonContainer);
            this.buttonContainer = null;
        }
        if (this.buttonEntity) {
            SXR.removeEntity(this.buttonEntity);
            this.buttonEntity = null;
        }
    },
    getIconName: function () {
        return (this.data.toggleState && this.data.iconActive) ? this.data.iconActive : this.data.icon;
    },
    setActiveState: function (activeState) {
        // drives update(), which refreshes the icon and resting colors
        this.el.setAttribute('sxr-icon-label-button', 'toggleState', String(activeState));
        this.buttonEntity.setAttribute('material', 'color', activeState ? this.data.activeColor : this.data.backgroundColor);
    },
    setIcon: function (icon) {
        this.normalizedIconFontSize = SXR.normalizeFontSize(this.data.iconFontSize);
        let iconEntityX = 0;
        if(this.data.value !== ''){
            iconEntityX = -this.guiItem.width*0.5 + this.guiItem.height*0.5;
        }
        const options = {
            icon,
            width: this.normalizedIconFontSize,
            height: this.normalizedIconFontSize,
            color: this.data.fontColor,
            depthTest: this.data.iconOcclusion === true
        };
        // toggling swaps the icon on the existing canvas/texture
        if (this.iconEntity && SXR.redrawIconEntity(this.iconEntity, options)) {
            this.iconEntity.setAttribute('position', `${iconEntityX} 0 0.05`);
            return;
        }
        if (this.iconEntity) {
            SXR.removeEntity(this.iconEntity);
            this.iconEntity = null;
        }
        const iconEntity = SXR.createIconEntity(options);
        this.iconEntity = iconEntity;
        iconEntity.setAttribute('position', `${iconEntityX} 0 0.05`);
        this.el.appendChild(iconEntity);
    },
    setText: function (newText) {
        this.normalizedFontSize = SXR.normalizeFontSize(this.data.fontSize);
        const guiItem = this.guiItem || SXR.getItem(this.el);
        const textEntityX = guiItem.height - guiItem.width*0.5;
        const textWidth = Math.max(0.1, guiItem.width - guiItem.height - 0.12);
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
    },
});

AFRAME.registerPrimitive( 'a-sxr-icon-label-button', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'icon-label-button' },
        'sxr-icon-label-button': { }
    },
    mappings: {
        //gui interactable general
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        'key-code': 'sxr-interactable.keyCode',
        'key': 'sxr-interactable.key',
        //gui item general
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        //gui button specific
        'on': 'sxr-icon-label-button.on',
        'font-color': 'sxr-icon-label-button.fontColor',
        'font-family': 'sxr-icon-label-button.fontFamily',
        'font-size': 'sxr-icon-label-button.fontSize',
        'border-color': 'sxr-icon-label-button.borderColor',
        'background-color': 'sxr-icon-label-button.backgroundColor',
        'hover-color': 'sxr-icon-label-button.hoverColor',
        'active-color': 'sxr-icon-label-button.activeColor',
        'icon': 'sxr-icon-label-button.icon',
        'icon-active': 'sxr-icon-label-button.iconActive',
        'icon-font': 'sxr-icon-label-button.iconFont',
        'icon-font-size': 'sxr-icon-label-button.iconFontSize',
        'icon-occlusion': 'sxr-icon-label-button.iconOcclusion',
        'value': 'sxr-icon-label-button.value',
        'toggle': 'sxr-icon-label-button.toggle',
        'toggle-state': 'sxr-icon-label-button.toggleState'
    }
});
