'use strict';

AFRAME.registerComponent('sxr-vertical-slider', {
    schema: {
        activeColor: {type: 'string', default: SXR.colors.primary},
        backgroundColor: {type: 'string', default: SXR.colors.onSurface},
        borderColor: {type: 'string', default: SXR.colors.neutral},
        handleColor: {type: 'string', default: SXR.colors.onSurface},
        handleInnerDepth: {type: 'number', default: 0.02},
        handleInnerRadius: {type: 'number', default: 0.13},
        handleOuterDepth: {type: 'number', default: 0.04},
        handleOuterRadius: {type: 'number', default: 0.17},
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        hoverFontSize: {type: 'number', default: 0.2 },
        hoverHeight: {type: 'number', default: 0.35},
        hoverPercent: {type: 'number'},
        hoverWidth: {type: 'number', default: 0.7},
        percent: {type: 'number', default: 0.5},
        opacity: { type: 'number', default: 1.0 },
        outputFontSize: {type: 'number', default: 0.2},
        outputFunction: {type: 'string'},
        outputTextDepth: {type: 'number', default: 0.25},
        outputWidth: {type: 'number', default: 1.0},
        sliderBarDepth: {type: 'number', default: 0.03},
        sliderBarWidth: {type: 'number', default: 0.08},
        topBottomPadding: {type: 'number', default: 0.25},
    },
    init: function() {
        const data = this.data;
        const el = this.el;
        const guiItem = el.getAttribute('sxr-item');
        const sliderHeight = guiItem.height - data.topBottomPadding*2.0
        this.sliderHeight = sliderHeight;
        this._pos = new THREE.Vector3();
        this._rot = new THREE.Quaternion();
        this._scale = new THREE.Vector3();

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', `shader: flat; opacity: ${data.opacity};  alphaTest: 0.5; color: ${data.backgroundColor}; side:front;`);

        const sliderActiveBar = document.createElement("a-entity");
        sliderActiveBar.setAttribute('geometry', `primitive: box; height: ${data.percent*sliderHeight}; width: ${data.sliderBarWidth}; depth: ${data.sliderBarDepth};`);
        sliderActiveBar.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor};`);
        sliderActiveBar.setAttribute('position', `0 ${data.percent*sliderHeight - sliderHeight*0.5 - data.percent *sliderHeight * 0.5} ${data.sliderBarDepth - 0.01}`);
        this.sliderActiveBar = sliderActiveBar;
        el.appendChild(sliderActiveBar);

        const sliderBar = document.createElement("a-entity");
        sliderBar.setAttribute('geometry', `primitive: box; height: ${sliderHeight - data.percent * sliderHeight}; width: ${data.sliderBarWidth}; depth: ${data.sliderBarDepth};`);
        sliderBar.setAttribute('material', `shader: flat; opacity: 1; alphaTest: 0.5; side:double; color:${data.borderColor};`);
        sliderBar.setAttribute('position', `0 ${data.percent * sliderHeight * 0.5} ${data.sliderBarDepth - 0.01}`);
        this.sliderBar = sliderBar;
        el.appendChild(sliderBar);

        const handleContainer = document.createElement("a-entity");
        handleContainer.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleOuterRadius}; height: ${data.handleOuterDepth};`);
        handleContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor};`);
        handleContainer.setAttribute('rotation', '90 0 0');
        handleContainer.setAttribute('position', `0 ${data.percent*sliderHeight - sliderHeight*0.5} ${data.handleOuterDepth - 0.01}`);
        this.handleContainer = handleContainer;
        el.appendChild(handleContainer);

        const handle = document.createElement("a-entity");
        handle.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleInnerRadius}; height: ${data.handleInnerDepth};`);
        handle.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.handleColor};`);
        handle.setAttribute('position', `0 ${data.handleInnerDepth} 0`);
        handleContainer.appendChild(handle);

        const valueLabel = document.createElement('a-sxr-label');
        valueLabel.setAttribute('width', `${guiItem.width * 1.4 * data.outputWidth}`);
        valueLabel.setAttribute('height', `${guiItem.width * 0.7}`);
        // TODO: use function to calculate display value
        valueLabel.setAttribute('value', '0.0');
        valueLabel.setAttribute('opacity', '1.0');
        valueLabel.setAttribute('position', `${guiItem.width * 1.4} 0 ${data.sliderBarDepth}`);
        valueLabel.setAttribute('rotation', '-90 0 0');
        valueLabel.setAttribute('font-color', data.activeColor);
        valueLabel.setAttribute('font-size', `${SXR.normalizeFontSize(data.outputFontSize)}`);
        valueLabel.setAttribute('font-weight', 'bold');
        valueLabel.setAttribute('text-depth', data.outputTextDepth);
        this.valueLabel = valueLabel;
        handleContainer.appendChild(valueLabel);

        const hoverIndicator = document.createElement("a-entity");
        hoverIndicator.setAttribute('geometry', `primitive: box; height: 0.02; width: ${guiItem.width * 0.5}; depth: ${data.sliderBarDepth};`);
        hoverIndicator.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor};`);
        hoverIndicator.setAttribute('position', `${-guiItem.width * 0.5} 0 ${data.sliderBarDepth - 0.01}`);
        hoverIndicator.setAttribute('visible', 'false');
        this.hoverIndicator = hoverIndicator;
        el.appendChild(hoverIndicator);

        const hoverLabel = document.createElement('a-sxr-label');
        hoverLabel.setAttribute('width', `${guiItem.width * data.hoverWidth}`);
        hoverLabel.setAttribute('height', `${guiItem.width * data.hoverHeight}`);
        hoverLabel.setAttribute('value', '');
        hoverLabel.setAttribute('opacity', '0.5');
        hoverLabel.setAttribute('position', `${-guiItem.width * data.hoverWidth} 0 ${data.sliderBarDepth}`);
        hoverLabel.setAttribute('font-color', data.borderColor);
        hoverLabel.setAttribute('font-size', `${SXR.normalizeFontSize(data.hoverFontSize)}`);
        hoverLabel.setAttribute('text-depth', data.outputTextDepth);
        this.hoverLabel = hoverLabel;
        hoverIndicator.appendChild(hoverLabel);

        el.addEventListener('mouseenter', function () {
            handle.setAttribute('material', 'color', data.hoverColor);
        });

        el.addEventListener('mouseleave', function () {
            handle.setAttribute('material', 'color', data.handleColor);
        });

        el.addEventListener('click', function (evt) {
            // keyboard-activated clicks (sxr-interactable) carry no intersection detail
            if (!evt.detail || !evt.detail.intersection) { return; }
            const localCoordinates = el.object3D.worldToLocal(evt.detail.intersection.point);
            let newPercent = null;
            if (localCoordinates.y <= (-sliderHeight / 2)) {
                newPercent = 0;
            } else if (localCoordinates.y >= (sliderHeight / 2)) {
                newPercent = 1.0;
            } else {
                newPercent = (localCoordinates.y + (sliderHeight /2)) / sliderHeight;
            }
            el.setAttribute('sxr-vertical-slider', 'percent', String(newPercent));
            el.setAttribute('sxr-vertical-slider', 'hoverPercent', String(newPercent));
            const guiInteractable = el.getAttribute("sxr-interactable");
            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(data.percent);
        });

        this._onIntersected = evt => {
            this.raycaster = evt.detail.el;
        };
        this.el.addEventListener('raycaster-intersected', this._onIntersected);
        this._onIntersectedCleared = () => {
            this.raycaster = null;
            this.hoverIndicator.setAttribute('visible', false);
            this.hoverLabel.setAttribute('visible', false);
        };
        this.el.addEventListener('raycaster-intersected-cleared', this._onIntersectedCleared);


    },
    update: function (oldData) {
        const data = this.data;
        const el = this.el;
        const guiItem = el.getAttribute('sxr-item');
        const sliderHeight = guiItem.height - data.topBottomPadding*2.0
        if (data.percent !== oldData.percent && this.sliderActiveBar && this.sliderBar && this.handleContainer) {
            this.sliderActiveBar.setAttribute('geometry', `primitive: box; height: ${data.percent*sliderHeight}; width: ${data.sliderBarWidth}; depth: ${data.sliderBarDepth};`);
            this.sliderActiveBar.setAttribute('position', `0 ${data.percent*sliderHeight - sliderHeight*0.5 - data.percent *sliderHeight * 0.5} ${data.sliderBarDepth - 0.01}`);
            this.sliderBar.setAttribute('geometry', `primitive: box; width: ${data.sliderBarWidth}; height: ${sliderHeight - data.percent * sliderHeight}; depth: ${data.sliderBarDepth};`);
            this.sliderBar.setAttribute('position', `0 ${data.percent * sliderHeight * 0.5} ${data.sliderBarDepth - 0.01}`);
            this.handleContainer.setAttribute('position', `0 ${data.percent*sliderHeight - sliderHeight*0.5} ${data.handleOuterDepth - 0.01}`);
            const outputValue = this.getOutputValue(false);
            if (outputValue) {
                this.valueLabel.setAttribute('value', outputValue);
            }
            this.hoverIndicator.setAttribute('visible', false);
            this.hoverLabel.setAttribute('visible', false);
        } else if (data.hoverPercent !== oldData.hoverPercent && data.hoverPercent !== data.percent && this.hoverIndicator) {
            const hoverOutputValue = this.getOutputValue(true);
            if (hoverOutputValue) {
                this.hoverLabel.setAttribute('value', hoverOutputValue);
            }
            this.hoverIndicator.setAttribute('position', `0 ${data.hoverPercent*sliderHeight - sliderHeight*0.5} ${data.sliderBarDepth - 0.01}`)
            this.hoverIndicator.setAttribute('visible', true);
            this.hoverLabel.setAttribute('visible', true);
        }
    },
    tick: function () {
        if (!this.raycaster) { return; }  // Not intersecting.

        var elapsed = this.el.sceneEl.time;
        if (this._lastTickTime && (elapsed - this._lastTickTime) < 50) { return; }
        this._lastTickTime = elapsed;

        const el = this.el;
        const sliderHeight = this.sliderHeight;
        let intersection = this.raycaster.components.raycaster.getIntersection(el);
        if (!intersection) {
            return;
        } else {
            const mesh = this.el.object3D;
            mesh.updateMatrixWorld();

            this._pos.set(0, 0, 0);
            this._rot.set(0, 0, 0, 1);
            this._scale.set(1, 1, 1);

            mesh.matrixWorld.decompose(this._pos, this._rot, this._scale);

            const localCoordinates = this._localCoordinates || (this._localCoordinates = new THREE.Vector3());
            localCoordinates.x = intersection.point.x - this._pos.x;
            localCoordinates.y = intersection.point.y - this._pos.y;
            localCoordinates.z = intersection.point.z - this._pos.z;

            // no movement along the slider axis: hide the hover indicator
            if (this.previousLocalY !== undefined && this.previousLocalY === localCoordinates.y) {
                this.hoverIndicator.setAttribute('visible', false);
                this.hoverLabel.setAttribute('visible', false);
                return;
            }
            this.previousLocalY = localCoordinates.y;
              // var localCoordinates = el.object3D.worldToLocal(intersection.point);
              let hoverPercent = null;
              if (localCoordinates.y <= (-sliderHeight / 2)) {
                  hoverPercent = 0;
              } else if (localCoordinates.y >= (sliderHeight / 2)) {
                  hoverPercent = 1.0;
              } else {
                  hoverPercent = (localCoordinates.y + (sliderHeight /2)) / sliderHeight;
              }
              if (hoverPercent !== this.data.hoverPercent) {
                  el.setAttribute('sxr-vertical-slider', 'hoverPercent', String(hoverPercent));
              }
              // el.setAttribute('sxr-vertical-slider', 'percent', String(newPercent));
              const guiInteractable = el.getAttribute("sxr-interactable");
              if (!guiInteractable) { return; }
              const hoverActionFunction = SXR.getActionFunction(guiInteractable.hoverAction);
              if (hoverActionFunction) hoverActionFunction(hoverPercent);

        }
    },
    remove: function () {
        const el = this.el;
        el.removeEventListener('raycaster-intersected', this._onIntersected);
        el.removeEventListener('raycaster-intersected-cleared', this._onIntersectedCleared);
        this.raycaster = null;
        this._lastTickTime = null;
    },
    getOutputValue: function (hover) {
        const outputValueFunction = SXR.getActionFunction(this.data.outputFunction);
        if (outputValueFunction) {
            return outputValueFunction(hover ? this.data.hoverPercent : this.data.percent);
        }
        return null;
    },
});

AFRAME.registerPrimitive( 'a-sxr-vertical-slider', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'slider' },
        'sxr-vertical-slider': { }
    },
    mappings: {
        'active-color': 'sxr-vertical-slider.activeColor',
        'background-color': 'sxr-vertical-slider.backgroundColor',
        'border-color': 'sxr-vertical-slider.borderColor',
        'handle-color': 'sxr-vertical-slider.handleColor',
        'handle-inner-depth': 'sxr-vertical-slider.handleInnerDepth',
        'handle-inner-radius': 'sxr-vertical-slider.handleInnerRadius',
        'handle-outer-depth': 'sxr-vertical-slider.handleOuterDepth',
        'handle-outer-radius': 'sxr-vertical-slider.handleOuterRadius',
        'height': 'sxr-item.height',
        'hover-color': 'sxr-vertical-slider.hoverColor',
        'hover-font-size': 'sxr-vertical-slider.hoverFontSize',
        'hover-height': 'sxr-vertical-slider.hoverHeight',
        'hover-percent': 'sxr-vertical-slider.hoverPercent',
        'hover-width': 'sxr-vertical-slider.hoverWidth',
       'key-code': 'sxr-interactable.keyCode',
        'margin': 'sxr-item.margin',
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        'opacity': 'sxr-vertical-slider.opacity',
        'output-font-size': 'sxr-vertical-slider.outputFontSize',
        'output-function': 'sxr-vertical-slider.outputFunction',
        'output-text-depth': 'sxr-vertical-slider.outputTextDepth',
        'output-width': 'sxr-vertical-slider.outputWidth',
        'percent': 'sxr-vertical-slider.percent',
        'slider-bar-depth': 'sxr-vertical-slider.sliderBarDepth',
        'slider-bar-width': 'sxr-vertical-slider.sliderBarWidth',
        'top-bottom-padding': 'sxr-vertical-slider.topBottomPadding',
        'width': 'sxr-item.width',
    }
});
