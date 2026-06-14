'use strict';

function setupCursorReset() {
    const cursor = document.querySelector("#cursor");
    if (!cursor) return;
    cursor.addEventListener("stateremoved", function (evt) {
        if (evt.detail.state === 'cursor-fusing') {
            AFRAME.utils.entity.setComponentProperty(this, "geometry.thetaLength", 360);
            AFRAME.utils.entity.setComponentProperty(this, "material.color", window.SXR.colors.onSurface);
            AFRAME.utils.entity.setComponentProperty(this, "scale", "1 1 1");
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCursorReset);
} else {
    setupCursorReset();
}
