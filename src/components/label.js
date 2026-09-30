'use strict';

AFRAME.registerComponent('sxr-label', {
  dependencies: ['sxr-item'],
  schema: {
    value: {type: 'string', default: ''},
    align: {type: 'string', default: 'center'},
    anchor: {type: 'string', default: 'center'},
    fontSize: {type: 'number', default: 0.2},
    lineHeight: {type: 'number', default: 0.2},
    letterSpacing: {type: 'number', default: 0},
    fontFamily: {type: 'string', default: SXR.fonts.default},
    fontColor: {type: 'string', default: SXR.colors.onSurface},
    backgroundColor: {type: 'string', default: SXR.colors.surface},
    opacity: { type: 'number', default: 1.0 },
    textDepth: { type: 'number', default: 0.01 },
    textOcclusion: {type: 'boolean', default: false},
    textStrokeColor: {type: 'string', default: ''},
    textStrokeWidth: {type: 'number', default: -1},
  },
  init: function() {
    const data = this.data;
    const el = this.el;
    const component = this;
    const guiItem = SXR.getItem(el);
    this.guiItem = guiItem;

    this.updateBackground();

    this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);

    this.setText(data.value);

    // live sxr-item updates (dimensions) resize the background + text box
    this._onItemChanged = SXR.watchGuiItem(el, function () {
      component.guiItem = SXR.getItem(el);
      component.updateBackground();
      if (component.textEntity) {
        SXR.removeEntity(component.textEntity);
        component.textEntity = null;
        component._lastTextKey = null;
        component.setText(data.value);
      }
    });

    ////WAI ARIA Support

    // if(data.labelFor){
    //   // el.setAttribute('role', 'button');
    // }


    },
    update: function (oldData) {
        const data = this.data;
        const hasOld = oldData && Object.keys(oldData).length > 0;
        this.guiItem = SXR.getItem(this.el);

        const textKey = [
            data.value, data.fontSize, data.lineHeight, data.letterSpacing,
            data.fontFamily, data.fontColor, data.align,
            data.textOcclusion, data.textStrokeColor, data.textStrokeWidth, data.textDepth
        ].join('|');
        const backgroundKey = [
            data.backgroundColor, data.opacity, this.guiItem.width, this.guiItem.height
        ].join('|');

        if (!hasOld || textKey !== this._lastTextKey) {
            this._lastTextKey = textKey;
            if (this.textEntity) {
                // occlusion changes the material, so recreate instead of redraw
                if (oldData && oldData.textOcclusion !== undefined && data.textOcclusion !== oldData.textOcclusion) {
                    SXR.removeEntity(this.textEntity);
                    this.textEntity = null;
                }
                this.setText(data.value);
            }
        }

        if (!hasOld || backgroundKey !== this._lastBackgroundKey) {
            this._lastBackgroundKey = backgroundKey;
            this.updateBackground();
        }
    },
    remove: function () {
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
        if (this._onItemChanged) {
            this.el.removeEventListener('componentchanged', this._onItemChanged);
        }
    },
    updateBackground: function () {
        const guiItem = this.guiItem || SXR.getItem(this.el);
        if (this.data.opacity <= 0) {
            this.el.removeAttribute('geometry');
            this.el.removeAttribute('material');
            if (this.el.getObject3D('mesh')) {
                this.el.removeObject3D('mesh');
            }
            return;
        }

        this.el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        this.el.setAttribute('material', {
            shader: 'flat',
            side: 'front',
            color: this.data.backgroundColor,
            transparent: true,
            opacity: this.data.opacity,
            alphaTest: 0.5,
            depthWrite: false
        });

        const backgroundMesh = this.el.getObject3D('mesh');
        if (backgroundMesh) {
            backgroundMesh.renderOrder = -50;
            if (backgroundMesh.material) {
                backgroundMesh.material.depthWrite = false;
            }
        }
    },
    setText: function (newText) {
        this.normalizedFontSize = SXR.normalizeFontSize(this.data.fontSize);
        const guiItem = this.guiItem || SXR.getItem(this.el);
        const options = {
            value: newText,
            width: guiItem.width / 1.05,
            height: guiItem.height,
            fontSize: this.normalizedFontSize,
            lineHeight: this.data.lineHeight,
            fontFamily: this.data.fontFamily,
            color: this.data.fontColor,
            depthTest: this.data.textOcclusion === true,
            strokeColor: this.data.textStrokeColor || undefined,
            strokeWidth: this.data.textStrokeWidth >= 0 ? this.data.textStrokeWidth : undefined,
            align: this.data.align
        };
        if (this.textEntity && SXR.redrawTextEntity(this.textEntity, options)) {
            this.textEntity.setAttribute('position', `0 0 ${this.data.textDepth}`);
            return;
        }
        if (this.textEntity) { SXR.removeEntity(this.textEntity); }
        const textEntity = SXR.createTextEntity(options);
        this.textEntity = textEntity;
        textEntity.setAttribute('position', `0 0 ${this.data.textDepth}`);
        this.el.appendChild(textEntity);
    }
});

AFRAME.registerPrimitive( 'a-sxr-label', {
  defaultComponents: {
    'sxr-item': { type: 'label' },
    'sxr-label': { }
  },
  mappings: {
    'width': 'sxr-item.width',
    'height': 'sxr-item.height',
    'margin': 'sxr-item.margin',
    'align': 'sxr-label.align',
    'anchor': 'sxr-label.anchor',
    'value': 'sxr-label.value',
    'font-size': 'sxr-label.fontSize',
    'line-height': 'sxr-label.lineHeight',
    'letter-spacing': 'sxr-label.letterSpacing',
    'font-color': 'sxr-label.fontColor',
    'font-family': 'sxr-label.fontFamily',
    'background-color': 'sxr-label.backgroundColor',
    'opacity': 'sxr-label.opacity',
    'text-depth': 'sxr-label.textDepth',
    'text-occlusion': 'sxr-label.textOcclusion',
    'text-stroke-color': 'sxr-label.textStrokeColor',
    'text-stroke-width': 'sxr-label.textStrokeWidth'
  }
 });
