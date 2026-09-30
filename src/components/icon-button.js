'use strict';

AFRAME.registerComponent('sxr-icon-button', {
    dependencies: ['sxr-item', 'sxr-interactable'],
    schema: {
        on: {default: 'click'},
        toggle: {type: 'boolean', default: false},
        toggleState: {type: 'boolean', default: false},
        icon: {type: 'string', default: 'check'},
        iconActive: {type: 'string', default: ''},
        iconFontSize: {type: 'number', default: 0.4},
        iconFont: {type: 'string', default: ''},
        iconOcclusion: {type: 'boolean', default: false},
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
        this.buttonContainer = buttonContainer;

        const buttonEntity = document.createElement("a-entity");
        buttonEntity.setAttribute('geometry', `primitive: cylinder; radius: ${(guiItem.height/2.05)}; height: 0.04;`);
        buttonEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.backgroundColor}`);
        buttonEntity.setAttribute('rotation', '90 0 0');
        buttonEntity.setAttribute('position', '0 0 0.02');
        el.appendChild(buttonEntity);
        this.buttonEntity = buttonEntity;

        this.setIcon(this.getIconName());

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

        //WAI ARIA Support
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', this.getIconName());
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

        const iconKey = [this.getIconName(), data.fontColor, data.iconFontSize, data.iconOcclusion].join('|');
        if (!hasOld || iconKey !== this._lastIconKey) {
            this._lastIconKey = iconKey;
            if (this.iconEntity) {
                this.setIcon(this.getIconName());
            }
        }
    },
    _resize: function () {
        this.guiItem = SXR.getItem(this.el);
        const {width, height} = this.guiItem;
        this.el.setAttribute('geometry', {primitive: 'plane', width, height});
        this.buttonContainer.setAttribute('geometry', {primitive: 'cylinder', radius: height / 2, height: 0.02});
        this.buttonEntity.setAttribute('geometry', {primitive: 'cylinder', radius: height / 2.05, height: 0.04});
        this.setIcon(this.getIconName());
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
        this.el.setAttribute('sxr-icon-button', 'toggleState', String(activeState));
        this.buttonEntity.setAttribute('material', 'color', activeState ? this.data.activeColor : this.data.backgroundColor);
    },
    setIcon: function (icon) {
        this.normalizedFontSize = SXR.normalizeFontSize(this.data.iconFontSize);
        const options = {
            icon,
            width: this.normalizedFontSize,
            height: this.normalizedFontSize,
            color: this.data.fontColor,
            depthTest: this.data.iconOcclusion === true
        };
        // toggling swaps the icon on the existing canvas/texture
        if (this.iconEntity && SXR.redrawIconEntity(this.iconEntity, options)) { return; }
        if (this.iconEntity) {
            SXR.removeEntity(this.iconEntity);
            this.iconEntity = null;
        }
        this.normalizedFontSize = SXR.normalizeFontSize(this.data.iconFontSize);
        const iconEntity = SXR.createIconEntity(options);
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
        'key': 'sxr-interactable.key',
        //gui item general
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        //gui button specific
        'on': 'sxr-icon-button.on',
        'font-color': 'sxr-icon-button.fontColor',
        'border-color': 'sxr-icon-button.borderColor',
        'background-color': 'sxr-icon-button.backgroundColor',
        'hover-color': 'sxr-icon-button.hoverColor',
        'active-color': 'sxr-icon-button.activeColor',
        'icon': 'sxr-icon-button.icon',
        'icon-active': 'sxr-icon-button.iconActive',
        'icon-font': 'sxr-icon-button.iconFont',
        'icon-font-size': 'sxr-icon-button.iconFontSize',
        'icon-occlusion': 'sxr-icon-button.iconOcclusion',
        'toggle': 'sxr-icon-button.toggle',
        'toggle-state': 'sxr-icon-button.toggleState'
    }
});
