'use strict';

AFRAME.registerComponent('rounded', {
  schema: {
    enabled: {default: true},
    width: {type: 'number', default: 1},
    height: {type: 'number', default: 1},
    radius: {type: 'number', default: 0.3},
    topLeftRadius: {type: 'number', default: -1},
    topRightRadius: {type: 'number', default: -1},
    bottomLeftRadius: {type: 'number', default: -1},
    bottomRightRadius: {type: 'number', default: -1},
    depthWrite: {type: 'boolean', default: true},
    polygonOffset: {type: 'boolean', default: false},
    polygonOffsetFactor: {type: 'number', default: 0},
    renderOrder: {type: 'number', default: 0},
    color: {type: 'color', default: "#F0F0F0"},
    opacity: {type: 'number', default: 1}
  },
  init: function () {
    this.rounded = new AFRAME.THREE.Mesh( this.draw(), new AFRAME.THREE.MeshStandardMaterial( { color: new AFRAME.THREE.Color(this.data.color) } ) );
    this.updateOpacity();
    this.el.setObject3D('mesh', this.rounded);
  },
  update: function (oldData) {
    if (this.data.enabled) {
      if (this.rounded) {
        this.rounded.visible = true;
        // rebuild the tessellated shape only when its dimensions changed
        const shapeChanged = !oldData || Object.keys(oldData).length === 0 || (
          oldData.width !== this.data.width ||
          oldData.height !== this.data.height ||
          oldData.radius !== this.data.radius ||
          oldData.topLeftRadius !== this.data.topLeftRadius ||
          oldData.topRightRadius !== this.data.topRightRadius ||
          oldData.bottomLeftRadius !== this.data.bottomLeftRadius ||
          oldData.bottomRightRadius !== this.data.bottomRightRadius
        );
        if (shapeChanged) {
          if (this.rounded.geometry) { this.rounded.geometry.dispose(); }
          this.rounded.geometry = this.draw();
        }
        this.rounded.material.color.set(this.data.color);
        this.updateOpacity();
        this.updateRenderState();
      }
    } else {
      this.rounded.visible = false;
    }
  },
  updateOpacity: function() {
    const opacity = Math.max(0, Math.min(1, this.data.opacity));
    if (opacity < 1) {
      this.rounded.material.transparent = true;
      this.rounded.material.opacity = opacity;
      this.rounded.material.alphaTest = 0;
    } else {
      this.rounded.material.transparent = false;
    }
    this.updateRenderState();
  },
  updateRenderState: function() {
    this.rounded.material.depthWrite = Boolean(this.data.depthWrite);
    this.rounded.material.polygonOffset = Boolean(this.data.polygonOffset);
    this.rounded.material.polygonOffsetFactor = this.data.polygonOffsetFactor;
    this.rounded.renderOrder = this.data.renderOrder;
  },
  remove: function () {
    if (!this.rounded) { return; }
    this.el.removeObject3D('mesh');
    if (this.rounded.geometry) { this.rounded.geometry.dispose(); }
    if (this.rounded.material) { this.rounded.material.dispose(); }
    this.rounded = null;
  },
  draw: function() {
    const roundedRectShape = new AFRAME.THREE.Shape();
    function roundedRect( ctx, x, y, width, height, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius ) {
      if (!topLeftRadius) { topLeftRadius = 0.00001; }
      if (!topRightRadius) { topRightRadius = 0.00001; }
      if (!bottomLeftRadius) { bottomLeftRadius = 0.00001; }
      if (!bottomRightRadius) { bottomRightRadius = 0.00001; }
      ctx.moveTo( x, y + topLeftRadius );
      ctx.lineTo( x, y + height - topLeftRadius );
      ctx.quadraticCurveTo( x, y + height, x + topLeftRadius, y + height );
      ctx.lineTo( x + width - topRightRadius, y + height );
      ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - topRightRadius );
      ctx.lineTo( x + width, y + bottomRightRadius );
      ctx.quadraticCurveTo( x + width, y, x + width - bottomRightRadius, y );
      ctx.lineTo( x + bottomLeftRadius, y );
      ctx.quadraticCurveTo( x, y, x, y + bottomLeftRadius );
    }

    const corners = [this.data.radius, this.data.radius, this.data.radius, this.data.radius];
    if (this.data.topLeftRadius !== -1) { corners[0] = this.data.topLeftRadius; }
    if (this.data.topRightRadius !== -1) { corners[1] = this.data.topRightRadius; }
    if (this.data.bottomLeftRadius !== -1) { corners[2] = this.data.bottomLeftRadius; }
    if (this.data.bottomRightRadius !== -1) { corners[3] = this.data.bottomRightRadius; }

    roundedRect( roundedRectShape, -this.data.width/2, -this.data.height/2, this.data.width, this.data.height, corners[0], corners[1], corners[2], corners[3] );
    return new AFRAME.THREE.ShapeGeometry( roundedRectShape );
  }
});

AFRAME.registerPrimitive('a-rounded', {
  defaultComponents: {
    rounded: {}
  },
  mappings: {
    enabled: 'rounded.enabled',
    width: 'rounded.width',
    height: 'rounded.height',
    radius: 'rounded.radius',
    'depth-write': 'rounded.depthWrite',
    'polygon-offset': 'rounded.polygonOffset',
    'polygon-offset-factor': 'rounded.polygonOffsetFactor',
    'render-order': 'rounded.renderOrder',
    'top-left-radius': 'rounded.topLeftRadius',
    'top-right-radius': 'rounded.topRightRadius',
    'bottom-left-radius': 'rounded.bottomLeftRadius',
    'bottom-right-radius': 'rounded.bottomRightRadius',
    color: 'rounded.color',
    opacity: 'rounded.opacity'
  }
});
