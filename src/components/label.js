'use strict';

AFRAME.registerComponent('sxr-label', {
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
    textStrokeColor: {type: 'string', default: ''},
    textStrokeWidth: {type: 'number', default: -1},
  },
  init: function() {
    const data = this.data;
    const el = this.el;
    const guiItem = el.getAttribute("sxr-item");
    this.guiItem = guiItem;

    this.updateBackground();
    
    this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);

    this.setText(data.value);

    ////WAI ARIA Support

    // if(data.labelFor){
    //   // el.setAttribute('role', 'button');
    // }


    },
    update: function (_oldData) {
        this.guiItem = this.el.getAttribute("sxr-item");
        this.updateBackground();

        if(this.textEntity){

            SXR.removeEntity(this.textEntity);

            this.setText(this.data.value);
   
        }
    },
    updateBackground: function () {
        const guiItem = this.guiItem || this.el.getAttribute("sxr-item");
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
        const textEntity = SXR.createTextEntity({
            value: newText,
            width: this.guiItem.width / 1.05,
            height: this.guiItem.height,
            fontSize: this.normalizedFontSize,
            lineHeight: this.data.lineHeight,
            fontFamily: this.data.fontFamily,
            color: this.data.fontColor,
            strokeColor: this.data.textStrokeColor || undefined,
            strokeWidth: this.data.textStrokeWidth >= 0 ? this.data.textStrokeWidth : undefined,
            align: this.data.align
        });
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
    'text-stroke-color': 'sxr-label.textStrokeColor',
    'text-stroke-width': 'sxr-label.textStrokeWidth'
  }
 });
