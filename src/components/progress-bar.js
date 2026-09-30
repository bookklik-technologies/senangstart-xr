'use strict';

AFRAME.registerComponent('sxr-progressbar', {
    dependencies: ['sxr-item'],
    schema: {
        backgroundColor: {type: 'string', default: SXR.colors.surface},
        activeColor: {type: 'string', default: SXR.colors.primary},
        percent: {type: 'number', default: 0.5},
    },
    init: function () {

        const data = this.data;
        const el = this.el;
        const component = this;
        const guiItem = SXR.getItem(el);

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', `shader: flat; opacity: 1;  color: ${data.backgroundColor}; side:front;`);

        const progressMeter = document.createElement("a-entity");
        progressMeter.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor}`);
        el.appendChild(progressMeter);

        this.guiItem = guiItem;
        this.progressMeter = progressMeter;
        this.updateProgress();

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

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        this.updateProgress();
    },
    update: function () {
        if (this.progressMeter) this.updateProgress();
    },
    updateProgress: function () {
        this.el.setAttribute('material', 'color', this.data.backgroundColor);
        this.progressMeter.setAttribute('material', 'color', this.data.activeColor);
        const percent = Math.min(1, Math.max(0, this.data.percent));
        const activeWidth = this.guiItem.width * percent;
        const activeX = -this.guiItem.width/2 + activeWidth/2;

        this.progressMeter.setAttribute('geometry', `primitive: box; width: ${activeWidth}; height: ${this.guiItem.height}; depth: 0.02;`);
        this.progressMeter.setAttribute('position', `${activeX} 0 0.01`);
    },
    remove: function () {
        const el = this.el;
        el.removeEventListener('componentchanged', this._onItemChanged);
        if (this.progressMeter) {
            SXR.removeEntity(this.progressMeter);
            this.progressMeter = null;
        }
    }
});

AFRAME.registerPrimitive( 'a-sxr-progressbar', {
    defaultComponents: {
        'sxr-item': { type: 'progressbar' },
        'sxr-progressbar': { }
    },
    mappings: {
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        'background-color': 'sxr-progressbar.backgroundColor',
        'active-color': 'sxr-progressbar.activeColor',
        'percent': 'sxr-progressbar.percent'
    }
});
