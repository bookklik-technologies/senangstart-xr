'use strict';

AFRAME.registerComponent('sxr-radio', {
    schema: {
        on: {default: 'click'},
        value: {type: 'string', default: ''},
        group: {type: 'string', default: ''},
        active: {type: 'boolean', default: true },
        toggle: {type: 'boolean', default: false},
        toggleState: {type: 'boolean', default: false},
        checked: {type: 'boolean', default: false },
        radiosizecoef: {type: 'number', default: 1 },
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.background},
        borderColor: {type: 'string', default: SXR.colors.border},
        backgroundColor: {type: 'string', default: SXR.colors.onSurface},
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        activeColor: {type: 'string', default: SXR.colors.primary},
        handleColor: {type: 'string', default: SXR.colors.surface},
    },
    init: function() {

        const data = this.data;
        const el = this.el;
        const guiItem = el.getAttribute("sxr-item");
        this.guiItem = guiItem;        
        this.checkedState = data.checked;
        this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);
        const guiInteractable = el.getAttribute("sxr-interactable");
        this.guiInteractable = guiInteractable;

        el.setAttribute('material', `shader: flat; depthTest:true;transparent: false; opacity: 1;  color: ${this.data.backgroundColor}; side:front;`);
        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.height};`);

        const radioBoxX = -guiItem.width*0.5 + guiItem.height*0.5;
        const radioBox = document.createElement("a-cylinder");
        radioBox.setAttribute('radius', guiItem.height*0.2*data.radiosizecoef);
        radioBox.setAttribute('height', '0.01');
        radioBox.setAttribute('rotation', '90 0 0');
        radioBox.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
        radioBox.setAttribute('position', `${radioBoxX} 0 0`);
        el.appendChild(radioBox);

        const radioborder = document.createElement("a-torus");
        radioborder.setAttribute('radius', guiItem.height*0.19*data.radiosizecoef);
        radioborder.setAttribute('radius-tubular', '0.01');
        radioborder.setAttribute('rotation', '90 0 0');
        radioborder.setAttribute('material', `color:${data.borderColor}; shader: flat;`);
        radioBox.appendChild(radioborder);

        const radioCenter = document.createElement("a-cylinder");
        radioCenter.setAttribute('radius', guiItem.height*0.18*data.radiosizecoef);
        radioCenter.setAttribute('height', '0.02');
        radioCenter.setAttribute('rotation', '0 0 0');
        radioCenter.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
        radioBox.appendChild(radioCenter);

        this.setText(data.value);

        this.updateToggle(data.active);
        el.setAttribute("checked",data.active);

        el.addEventListener('mouseenter', function() {
            radioborder.removeAttribute('animation__leave');
            radioborder.setAttribute('animation__enter', `property: material.color; from: ${data.borderColor}; to:${data.hoverColor}; dur:200;`);
        });
        el.addEventListener('mouseleave', function() {
            radioborder.removeAttribute('animation__enter');
            radioborder.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.borderColor}; dur:200; easing: easeOutQuad;`);
        });
        el.addEventListener(data.on, function (evt) {
            data.checked = !data.checked;
            if (data.checked && data.group) {
                const siblings = el.parentElement ? el.parentElement.querySelectorAll('[sxr-radio]') : [];
                siblings.forEach(function(sibling) {
                    if (sibling !== el) {
                        const radioComp = sibling.components && sibling.components['sxr-radio'];
                        if (radioComp && radioComp.data.group === data.group) {
                            sibling.emit('uncheck');
                        }
                    }
                });
            }
            if (data.checked) {
                radioCenter.removeAttribute('animation__colorOut');
                radioCenter.removeAttribute('animation__rotationOut');
                radioCenter.removeAttribute('animation__position1Out');
                radioCenter.removeAttribute('animation__position2Out');
                radioCenter.setAttribute('animation__colorIn', `property: material.color; from: ${data.handleColor}; to:${data.activeColor}; dur:500; easing:easeInOutCubic;`);
                radioCenter.setAttribute('animation__rotationIn', `property: rotation; from: 0 0 0; to:-180 0 0; dur:500; easing:easeInOutCubic;`);
                radioCenter.setAttribute('animation__position1In', `property: position; from: 0 0 0; to:0 0.3 0; dur:200; easing:easeInOutCubic;`);
                radioCenter.setAttribute('animation__position2In', `property: position; from: 0 0.3 0; to:0 0 0; dur:200; easing:easeInOutCubic; delay:300;`);
            }else{
                radioCenter.removeAttribute('animation__colorIn');
                radioCenter.removeAttribute('animation__rotationIn');
                radioCenter.removeAttribute('animation__position1In');
                radioCenter.removeAttribute('animation__position2In');
                radioCenter.setAttribute('animation__colorOut', `property: material.color; from: ${data.activeColor}; to:${data.handleColor}; dur:500; easing:easeInOutCubic;`);
                radioCenter.setAttribute('animation__rotationOut', `property: rotation; from: -180 0 0; to:0 0 0; dur:500; easing:easeInOutCubic;`);
                radioCenter.setAttribute('animation__position1Out', `property: position; from: 0 0 0; to:0 0.3 0; dur:200; easing:easeInOutCubic; `);
                radioCenter.setAttribute('animation__position2Out', `property: position; from: 0 0.3 0; to:0 0 0; dur:200; easing:easeInOutCubic; delay:300;`);
            }

            const guiInteractable = el.getAttribute("sxr-interactable");
            const clickActionFunctionName = guiInteractable.clickAction;
            // find object
            const clickActionFunction = window[clickActionFunctionName];
            // is object a function?
            if (typeof clickActionFunction === "function") clickActionFunction(evt);
        });

        ////WAI ARIA Support
        el.setAttribute('role', 'radio');

    },
    update: function(){
        const data = this.data;
        this.updateToggle(data.active)

        if(this.textEntity){

            SXR.removeEntity(this.textEntity);

            this.setText(this.data.value);
   
        }

    },


    updateToggle: function(active){
        this.el.setAttribute('aria-disabled', (!active).toString());

    },
    setText: function (newText) {
        const textEntityX = this.guiItem.height  - this.guiItem.width*0.5;
        const textWidth = Math.max(0.1, this.guiItem.width - this.guiItem.height - 0.08);
        const textEntity = SXR.createTextEntity({
            value: newText,
            width: textWidth,
            height: this.guiItem.height * 0.72,
            fontSize: this.normalizedFontSize,
            fontFamily: this.data.fontFamily,
            color: this.data.fontColor,
            align: 'left'
        });
        this.textEntity = textEntity;
        textEntity.setAttribute('position', `${textEntityX + textWidth / 2} 0 0.05`);
        this.el.appendChild(textEntity);
    }


});

AFRAME.registerPrimitive( 'a-sxr-radio', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'radio' },
        'sxr-radio': { }
    },
    mappings: {
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        'key-code': 'sxr-interactable.keyCode',
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        'on': 'sxr-radio.on',
        'value': 'sxr-radio.value',
        'active': 'sxr-radio.active',
        'checked': 'sxr-radio.checked',
        'font-color': 'sxr-radio.fontColor',
        'font-size': 'sxr-radio.fontSize',
        'font-family': 'sxr-radio.fontFamily',
        'border-color': 'sxr-radio.borderColor',
        'background-color': 'sxr-radio.backgroundColor',
        'hover-color': 'sxr-radio.hoverColor',
        'active-color': 'sxr-radio.activeColor',
        'handle-color': 'sxr-radio.handleColor',
        'radiosizecoef': 'sxr-radio.radiosizecoef'
    }
});
