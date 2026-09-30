'use strict';

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}


AFRAME.registerComponent('bevelbox', {
  schema: {
    width: {type: 'number', default: 1},
    height: {type: 'number', default: 1},
    depth: {type: 'number', default: 1},

    topLeftRadius: {type: 'number', default: 0.00001},
    topRightRadius: {type: 'number', default: 0.00001},
    bottomLeftRadius: {type: 'number', default: 0.00001},
    bottomRightRadius: {type: 'number', default: 0.00001},

    bevelEnabled: {type: 'boolean', default: true},
    bevelSegments: {type: 'number', default: 2},
    steps: {type: 'number', default: 1},
    bevelSize: {type: 'number', default: 0.1},
    bevelOffset: {type: 'number', default: 0},
    bevelThickness: {type: 'number', default: 0.1}
  },

  multiple: false,

  init: function() {
    this.el.setObject3D('mesh', this.extrude(this.buildShape()));
  },
  update: function () {
    const el = this.el;

    const extrudedShape = this.extrude(this.buildShape());

    if (this.el.getObject3D('mesh')) {
      const oldMesh = this.el.getObject3D('mesh');
      oldMesh.geometry.dispose();
      oldMesh.material.dispose();
      this.el.removeObject3D('mesh');
    }
    el.setObject3D('mesh', extrudedShape);
  },

  remove: function () {
    const mesh = this.el.getObject3D('mesh');
    if (mesh) {
      if (mesh.geometry) { mesh.geometry.dispose(); }
      if (mesh.material) { mesh.material.dispose(); }
      this.el.removeObject3D('mesh');
    }
  },

  buildShape: function () {
    const data = this.data;

    const _w = data.width;
    const _h = data.height;
    const _x = -data.width / 2;
    const _y = -data.height / 2;

    const shape = new AFRAME.THREE.Shape();
    shape.moveTo( _x, _y + data.topLeftRadius );
    shape.lineTo( _x, _y + _h - data.topLeftRadius );
    shape.quadraticCurveTo( _x, _y + _h, _x + data.topLeftRadius, _y + _h );
    shape.lineTo( _x + _w - data.topRightRadius, _y + _h );
    shape.quadraticCurveTo( _x + _w, _y + _h, _x + _w, _y + _h - data.topRightRadius );
    shape.lineTo( _x + _w, _y + data.bottomRightRadius );
    shape.quadraticCurveTo( _x + _w, _y, _x + _w - data.bottomRightRadius, _y );
    shape.lineTo( _x + data.bottomLeftRadius, _y );
    shape.quadraticCurveTo( _x, _y, _x, _y + data.bottomLeftRadius );
    return shape;
  },

  extrude: function (roundedBase) {
    const data = this.data;

    const extrudeSettings = {
      steps: data.steps,
      depth: data.depth,
      bevelEnabled: data.bevelEnabled,
      bevelThickness: data.bevelThickness,
      bevelSize: data.bevelSize,
      bevelOffset: data.bevelOffset,
      bevelSegments: data.bevelSegments
    };

    const extrudedGeometry = new AFRAME.THREE.ExtrudeGeometry(roundedBase, extrudeSettings);
    return new AFRAME.THREE.Mesh( extrudedGeometry , new AFRAME.THREE.MeshStandardMaterial({
      side: AFRAME.THREE.DoubleSide
    }) );
  },

  /**
   * Called on each scene tick.
   */
  // tick: function (t) { },
});
