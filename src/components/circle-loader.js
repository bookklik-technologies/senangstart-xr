'use strict';

AFRAME.registerComponent('sxr-circle-loader', {
    dependencies: ['sxr-item'],
    schema: {
        loaded: {type: 'number', default: 0.5 },
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.onSurface},
        backgroundColor: {type: 'string', default: SXR.colors.surface},
        activeColor: {type: 'string', default: SXR.colors.primary},
    },
    init: function() {

        const data = this.data;
        const el = this.el;
        const component = this;
        const guiItem = SXR.getItem(el);
        this.guiItem = guiItem;

        this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.height};`);
        el.setAttribute('material', `shader: flat; transparent: true; opacity: 1; side:back; color:${data.backgroundColor};`);

        const loaderContainer = document.createElement("a-entity");
        loaderContainer.setAttribute('geometry', `primitive: cylinder; radius: ${guiItem.height/2}; height: 0.02;`);
        loaderContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.backgroundColor}`);
        loaderContainer.setAttribute('rotation', '90 0 0');
        loaderContainer.setAttribute('position', '0 0 0.01');
        el.appendChild(loaderContainer);
        this.loaderContainer = loaderContainer;

        const loaderRing = document.createElement("a-ring");
        loaderRing.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor}`);
        loaderRing.setAttribute('radius-inner', `${guiItem.height/3}`);
        loaderRing.setAttribute('radius-outer', `${guiItem.height/2}`);
        loaderRing.setAttribute('theta-start', '90');
        loaderRing.setAttribute('theta-length', `${Math.abs(data.loaded) * 360}`);
        loaderRing.setAttribute('rotation', '0 0 0');
        loaderRing.setAttribute('position', '0 0 0.04');
        el.appendChild(loaderRing);
        this.loaderRing = loaderRing;

        this.setText(data.loaded);

        // live sxr-item updates (dimensions) rebuild the geometry
        this._onItemChanged = SXR.watchGuiItem(el, function () {
            component._rebuild();
        });

    },
    // dispose owned geometry and rebuild from current sxr-item data
    _rebuild: function () {
        const el = this.el;
        const previousItemKey = this._itemKey;
        this.guiItem = SXR.getItem(el);
        const guiItem = this.guiItem;
        this._itemKey = [guiItem.width, guiItem.height].join('|');
        if (previousItemKey !== undefined && previousItemKey === this._itemKey) { return; }

        const data = this.data;
        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.height};`);
        if (this.loaderContainer) {
            this.loaderContainer.setAttribute('geometry', `primitive: cylinder; radius: ${guiItem.height/2}; height: 0.02;`);
        }
        if (this.loaderRing) {
            this.loaderRing.setAttribute('radius-inner', `${guiItem.height/3}`);
            this.loaderRing.setAttribute('radius-outer', `${guiItem.height/2}`);
            this.loaderRing.setAttribute('theta-length', `${Math.abs(data.loaded) * 360}`);
        }
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
        this.setText(data.loaded);
    },
    update: function (_oldData) {
        this.el.setAttribute('material', 'color', this.data.backgroundColor);
        if (this.loaderContainer) this.loaderContainer.setAttribute('material', 'color', this.data.backgroundColor);
        if (this.loaderRing) {
            this.loaderRing.setAttribute('material', 'color', this.data.activeColor);
            this.loaderRing.setAttribute('theta-length', `${Math.abs(this.data.loaded) * 360}`);
        }
        if (this.textEntity) {
            this.setText(this.data.loaded);
        }
    },
    remove: function () {
        const el = this.el;
        el.removeEventListener('componentchanged', this._onItemChanged);
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
        if (this.loaderContainer) {
            SXR.removeEntity(this.loaderContainer);
            this.loaderContainer = null;
        }
        if (this.loaderRing) {
            SXR.removeEntity(this.loaderRing);
            this.loaderRing = null;
        }
    },
    setText: function (newLoaded) {
        this.normalizedFontSize = SXR.normalizeFontSize(this.data.fontSize);
        const options = {
            value: Math.round(newLoaded * 100),
            width: this.guiItem.height * 0.7,
            height: this.guiItem.height * 0.38,
            fontSize: this.normalizedFontSize,
            fontFamily: this.data.fontFamily,
            color: this.data.fontColor,
            align: 'center'
        };
        if (this.textEntity && SXR.redrawTextEntity(this.textEntity, options)) { return; }
        if (this.textEntity) { SXR.removeEntity(this.textEntity); }
        const textEntity = SXR.createTextEntity(options);
        this.textEntity = textEntity;
        textEntity.setAttribute('position', '0 0 0.05');
        this.el.appendChild(textEntity);
    }
});

AFRAME.registerPrimitive( 'a-sxr-circle-loader', {
    defaultComponents: {
        'sxr-item': { type: 'circle-loader' },
        'sxr-circle-loader': { }
    },
    mappings: {
        //gui item general
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        //gui loader specific
        'loaded': 'sxr-circle-loader.loaded',
        'font-size': 'sxr-circle-loader.fontSize',
        'font-family': 'sxr-circle-loader.fontFamily',
        'font-color': 'sxr-circle-loader.fontColor',
        'background-color': 'sxr-circle-loader.backgroundColor',
        'active-color': 'sxr-circle-loader.activeColor'
    }
});
