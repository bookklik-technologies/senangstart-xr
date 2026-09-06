'use strict';

AFRAME.registerComponent('sxr-progressbar', {
    schema: {
        backgroundColor: {type: 'string', default: SXR.colors.surface},
        activeColor: {type: 'string', default: SXR.colors.primary},
        percent: {type: 'number', default: 0.5},
    },
    init: function () {

        const data = this.data;
        const el = this.el;
        const guiItem = el.getAttribute("sxr-item");

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', `shader: flat; opacity: 1;  color: ${data.backgroundColor}; side:front;`);

        const progressMeter = document.createElement("a-entity");
        progressMeter.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor}`);
        el.appendChild(progressMeter);

        this.guiItem = guiItem;
        this.progressMeter = progressMeter;
        this.updateProgress();
    },
    update: function () {
        if (this.progressMeter) this.updateProgress();
    },
    updateProgress: function () {
        const percent = Math.min(1, Math.max(0, this.data.percent));
        const activeWidth = this.guiItem.width * percent;
        const activeX = -this.guiItem.width/2 + activeWidth/2;

        this.progressMeter.setAttribute('geometry', `primitive: box; width: ${activeWidth}; height: ${this.guiItem.height}; depth: 0.02;`);
        this.progressMeter.setAttribute('position', `${activeX} 0 0.01`);
    },
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
