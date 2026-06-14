'use strict';

AFRAME.registerComponent('sxr-slider', {
    schema: {
        activeColor: {type: 'string', default: SXR.colors.primary},
        backgroundColor: {type: 'string', default: SXR.colors.onSurface},
        borderColor: {type: 'string', default: SXR.colors.neutral},
        handleColor: {type: 'string', default: SXR.colors.onSurface},
        handleInnerDepth: {type: 'number', default: 0.02 },
        handleInnerRadius: {type: 'number', default: 0.13 },
        handleOuterDepth: {type: 'number', default: 0.04 },
        handleOuterRadius: {type: 'number', default: 0.17 },
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        leftRightPadding: {type: 'number', default: 0.25 },
        percent: {type: 'number', default: 0.5 },
        sliderBarHeight: {type: 'number', default: 0.05 },
        sliderBarDepth: {type: 'number', default: 0.03 },
        topBottomPadding: {type: 'number', default: 0.125 },
    },
    init: function() {

        const data = this.data;
        const el = this.el;
        const guiItem = el.getAttribute("sxr-item");
        const sliderWidth = guiItem.width - data.leftRightPadding*2.0
        this.sliderWidth = sliderWidth;

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.height};`);
        el.setAttribute('material', `shader: flat; opacity: 1;  color: ${data.backgroundColor}; side:front;`);

        const sliderActiveBar = document.createElement("a-entity");
        sliderActiveBar.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor};`);
        el.appendChild(sliderActiveBar);

        const sliderBar = document.createElement("a-entity");
        sliderBar.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor};`);
        el.appendChild(sliderBar);

        const handleContainer = document.createElement("a-entity");
        handleContainer.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleOuterRadius}; height: ${data.handleOuterDepth};`);
        handleContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor};`);
        handleContainer.setAttribute('rotation', '90 0 0');
        el.appendChild(handleContainer);

        const handle = document.createElement("a-entity");
        handle.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleInnerRadius}; height: ${data.handleInnerDepth};`);
        handle.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.handleColor};`);
        handle.setAttribute('position', `0 ${data.handleInnerDepth} 0`);
        handleContainer.appendChild(handle);

        const updateSlider = function(percent) {
            data.percent = Math.min(1, Math.max(0, percent));
            const activeWidth = data.percent * sliderWidth;
            const inactiveWidth = sliderWidth - activeWidth;
            const leftEdge = -sliderWidth / 2;
            const handleX = leftEdge + activeWidth;

            sliderActiveBar.setAttribute('geometry', `primitive: box; width: ${activeWidth}; height: ${data.sliderBarHeight}; depth: ${data.sliderBarDepth};`);
            sliderActiveBar.setAttribute('position', `${leftEdge + activeWidth / 2} 0 ${data.sliderBarDepth - 0.01}`);
            sliderBar.setAttribute('geometry', `primitive: box; width: ${inactiveWidth}; height: ${data.sliderBarHeight}; depth: ${data.sliderBarDepth};`);
            sliderBar.setAttribute('position', `${handleX + inactiveWidth / 2} 0 ${data.sliderBarDepth - 0.01}`);
            handleContainer.setAttribute('position', `${handleX} 0 ${data.handleOuterDepth - 0.01}`);
        };

        updateSlider(data.percent);

        el.addEventListener('mouseenter', function () {
            handle.setAttribute('material', 'color', data.hoverColor);
        });

        el.addEventListener('mouseleave', function () {
            handle.setAttribute('material', 'color', data.handleColor);
        });

        el.addEventListener('click', function (evt) {
            const localCoordinates = el.object3D.worldToLocal(evt.detail.intersection.point);
            const sliderBarWidth = this.sliderWidth || sliderWidth;
            if (localCoordinates.x <= (-sliderBarWidth / 2)) {
                data.percent = 0;
            } else if (localCoordinates.x >= (sliderBarWidth / 2)) {
                data.percent = 1.0;
            } else {
                data.percent = (localCoordinates.x + (sliderBarWidth /2)) / sliderBarWidth;
            }
            updateSlider(data.percent);
            const guiInteractable = el.getAttribute("sxr-interactable");
            const clickActionFunctionName = guiInteractable.clickAction;
            // find object
            const clickActionFunction = window[clickActionFunctionName];
            // is object a function?
            if (typeof clickActionFunction === "function") clickActionFunction(evt, data.percent);
        });


    },
});

AFRAME.registerPrimitive( 'a-sxr-slider', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'slider' },
        'sxr-slider': { }
    },
    mappings: {
        'active-color': 'sxr-slider.activeColor',
        'background-color': 'sxr-slider.backgroundColor',
        'border-color': 'sxr-slider.borderColor',
        'handle-color': 'sxr-slider.handleColor',
        'handle-inner-depth': 'sxr-slider.handleInnerDepth',
        'handle-inner-radius': 'sxr-slider.handleInnerRadius',
        'handle-outer-depth': 'sxr-slider.handleOuterDepth',
        'handle-outer-radius': 'sxr-slider.handleOuterRadius',
        'height': 'sxr-item.height',
        'hover-color': 'sxr-slider.hoverColor',
        'key-code': 'sxr-interactable.keyCode',
        'left-right-padding': 'sxr-slider.leftRightPadding',
        'margin': 'sxr-item.margin',
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        'percent': 'sxr-slider.percent',
        'slider-bar-depth': 'sxr-slider.sliderBarDepth',
        'slider-bar-height': 'sxr-slider.sliderBarHeight',
        'top-bottom-padding': 'sxr-slider.topBottomPadding',
        'width': 'sxr-item.width',
    }
});
