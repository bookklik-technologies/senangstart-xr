'use strict';

AFRAME.registerComponent('sxr-button', {
    dependencies: ['sxr-item', 'sxr-interactable'],
    schema: {
        on: {default: 'click'},
        value: {type: 'string', default: ''},
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.onSurface},
        borderColor: {type: 'string', default: SXR.colors.border},
        focusColor: {type: 'string', default: SXR.colors.secondary},
        backgroundColor: {type: 'string', default: SXR.colors.surface},
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        activeColor: {type: 'string', default: SXR.colors.primary},
        toggle: {type: 'boolean', default: false},
        toggleState: {type: 'boolean', default: false},
    },

    init: function(){

        const data = this.data;
        const el = this.el;
        const component = this;
        const guiItem = SXR.getItem(el);
        this.guiItem = guiItem;

        this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);

        const guiInteractable = el.getAttribute("sxr-interactable");
        this.guiInteractable = guiInteractable;

        this._buildGeometry();

        this.setText(data.value);

        this._onMouseEnter = function() {
            component.buttonEntity.removeAttribute('animation__leave');
            if (!(data.toggle)) {
                component.buttonEntity.setAttribute('animation__enter', `property: material.color; from: ${data.backgroundColor}; to:${data.hoverColor}; dur:200;`);
            }
        };
        el.addEventListener('mouseenter', this._onMouseEnter);
        this._onMouseLeave = function() {
            if (!(data.toggle)) {
                component.buttonEntity.removeAttribute('animation__click');
                component.buttonEntity.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.backgroundColor}; dur:200; easing: easeOutQuad;`);
            }
            component.buttonEntity.removeAttribute('animation__enter');
        };
        el.addEventListener('mouseleave', this._onMouseLeave);


        this._onFocus = function() {
            component.buttonContainer.setAttribute('material','color',`${data.focusColor}`);
        };

        el.addEventListener('focus', this._onFocus);

        this._onBlur = function() {
            component.buttonContainer.setAttribute('material','color', `${data.borderColor}`);
            if (!(data.toggle)) {
                component.buttonEntity.removeAttribute('animation__click');
                component.buttonEntity.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.backgroundColor}; dur:200; easing: easeOutQuad;`);
            }
            component.buttonEntity.removeAttribute('animation__enter');
        };

        el.addEventListener('blur', this._onBlur);




        this._onActivate = function(event) {
            if (!(data.toggle)) { // if not toggling flashing active state
                component.buttonEntity.setAttribute('animation__click', `property: material.color; from: ${data.activeColor}; to:${data.backgroundColor}; dur:400; easing: easeOutQuad;`);
            }else{
                component.setActiveState(!data.toggleState);
            }

            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(event);
        };

        el.addEventListener(data.on, this._onActivate);



        // focused keyboard operation: Enter/Space activate. When the widget's
        // own key/key-code shortcut already fired from the shared keydown
        // registry, skip the keyup path to prevent duplicate activation.
        this._onKeyUp = function (event){
          if (event.isComposing || event.keyCode === 229 || event.repeat) {
             return;
          }

          if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar'){
              const interactable = el.components['sxr-interactable'];
              if (interactable && interactable.matchesEvent && interactable.matchesEvent(event)) {
                  return;
              }
              event.preventDefault();
              el.emit(data.on);
            }

        };
        el.addEventListener("keyup", this._onKeyUp);

        // live sxr-item updates (dimensions) rebuild the geometry + label
        this._onItemChanged = SXR.watchGuiItem(el, function () {
            component._rebuild();
        });

          ////WAI ARIA Support
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex','0');
        el.setAttribute('aria-label',data.value);



    },
    _buildGeometry: function () {
        const data = this.data;
        const el = this.el;
        const guiItem = this.guiItem || SXR.getItem(el);

        el.setAttribute('geometry', `primitive: plane;
                                     height: ${guiItem.height};
                                     width: ${guiItem.width};
                                     `);
        el.setAttribute('material', `shader: flat;
                                     transparent: true;
                                     opacity: 0.5;
                                     side:double;
                                     color:${data.backgroundColor};
                                     `);

        const buttonContainer = document.createElement("a-entity");

        if(guiItem.bevel){
            const bevelsize_adjust = guiItem.bevelSize*1;
            const bevelthickness_adjust = guiItem.bevelThickness;
            buttonContainer.setAttribute('bevelbox', `width: ${guiItem.width - (guiItem.width*bevelsize_adjust)};
                                                      height: ${guiItem.height - (guiItem.height*bevelsize_adjust)};
                                                      depth: ${guiItem.baseDepth - (guiItem.baseDepth*bevelthickness_adjust)};
                                                      bevelThickness: 0;
                                                      bevelSize: ${guiItem.bevelSize};
                                                      `);
            buttonContainer.setAttribute('position', `0 0 0`);
        }
        else
        {
            buttonContainer.setAttribute('geometry', `primitive: box;
                                                      width: ${guiItem.width};
                                                      height: ${guiItem.height};
                                                      depth: ${guiItem.baseDepth};
                                                      `);
            buttonContainer.setAttribute('position', `0 0 ${guiItem.baseDepth/2}`);
        }
        buttonContainer.setAttribute('rotation', '0 0 0');
        buttonContainer.setAttribute('material', `shader: flat;
                                                  opacity: 1;
                                                  side:double;
                                                  color: ${data.borderColor}
                                                  `);
        el.appendChild(buttonContainer);
        this.buttonContainer = buttonContainer;

        const buttonEntity = document.createElement("a-entity");
        if(guiItem.bevel){
            const bevelsize_adjust = guiItem.bevelSize*1;
            const bevelthickness_adjust = guiItem.bevelThickness;
            buttonEntity.setAttribute('bevelbox', `width: ${(guiItem.width-guiItem.gap)-((guiItem.width-guiItem.gap)*bevelsize_adjust)};
                                                   height: ${(guiItem.height-guiItem.gap)-((guiItem.height-guiItem.gap)*bevelsize_adjust)};
                                                   depth: ${guiItem.depth-(guiItem.depth*bevelthickness_adjust)};
                                                   bevelThickness: ${guiItem.bevelThickness};
                                                   bevelSize: ${guiItem.bevelSize};
                                                   `);
            buttonEntity.setAttribute('position', `0 0 0`);
        }
        else
        {
            buttonEntity.setAttribute('geometry', `primitive: box;
                                               width: ${(guiItem.width-guiItem.gap)};
                                               height: ${(guiItem.height-guiItem.gap)};
                                               depth: ${guiItem.depth};`);
            buttonEntity.setAttribute('position', `0 0 ${guiItem.depth/2}`);
        }
        buttonEntity.setAttribute('material', `shader: flat;
                                               opacity: 1;
                                               side:double;
                                               color: ${data.toggleState ? data.activeColor : data.backgroundColor}
                                               `);
        buttonEntity.setAttribute('rotation', '0 0 0');
        el.appendChild(buttonEntity);
        this.buttonEntity = buttonEntity;
    },
    // dispose the owned geometry entities and rebuild from current sxr-item
    // data; invoked on live dimension changes
    _rebuild: function () {
        const el = this.el;
        const previousItemKey = this._itemKey;
        this.guiItem = SXR.getItem(el);
        const guiItem = this.guiItem;
        this._itemKey = [guiItem.width, guiItem.height, guiItem.baseDepth, guiItem.depth, guiItem.gap, guiItem.bevel, guiItem.bevelSize, guiItem.bevelThickness, guiItem.bevelSegments, guiItem.bevelOffset, guiItem.steps, guiItem.radius].join('|');
        if (previousItemKey !== undefined && previousItemKey === this._itemKey) { return; }

        if (this.buttonContainer) { SXR.removeEntity(this.buttonContainer); }
        if (this.buttonEntity) { SXR.removeEntity(this.buttonEntity); }
        this.buttonContainer = null;
        this.buttonEntity = null;
        this._buildGeometry();
        this.buttonEntity.setAttribute('material', `shader: flat;
                                                    opacity: 1;
                                                    side:double;
                                                    color: ${this.data.toggleState ? this.data.activeColor : this.data.backgroundColor}
                                                    `);
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
            this.setText(this.data.value);
        }
    },
    remove: function () {
        const el = this.el;
        el.removeEventListener('mouseenter', this._onMouseEnter);
        el.removeEventListener('mouseleave', this._onMouseLeave);
        el.removeEventListener('focus', this._onFocus);
        el.removeEventListener('blur', this._onBlur);
        el.removeEventListener(this.data.on, this._onActivate);
        el.removeEventListener('keyup', this._onKeyUp);
        el.removeEventListener('componentchanged', this._onItemChanged);
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
        if (this.buttonContainer) {
            SXR.removeEntity(this.buttonContainer);
            this.buttonContainer = null;
        }
        if (this.buttonEntity) {
            SXR.removeEntity(this.buttonEntity);
            this.buttonEntity = null;
        }
    },
    update: function (oldData) {

        const data = this.data;
        const el = this.el;
        this.guiItem = SXR.getItem(el);

        const hasOld = oldData && Object.keys(oldData).length > 0;

        // rebind the activation listener when the event name changes
        if (hasOld && data.on !== oldData.on) {
            el.removeEventListener(oldData.on, this._onActivate);
            el.addEventListener(data.on, this._onActivate);
        }

        // geometry depends only on sxr-item (handled via the item watcher);
        // resting colors and the label are the only schema-driven visuals
        this.buttonContainer.setAttribute('material', `shader: flat;
                                                     opacity: 1;
                                                     side:double;
                                                     color: ${data.borderColor}
                                                     `);
        this.buttonEntity.setAttribute('material', `shader: flat;
                                                    opacity: 1;
                                                    side:double;
                                                    color: ${data.toggleState ? data.activeColor : data.backgroundColor}
                                                    `);

        const textKey = [data.value, data.fontSize, data.fontFamily, data.fontColor].join('|');
        if (!hasOld || textKey !== this._lastTextKey) {
            this._lastTextKey = textKey;
            el.setAttribute('aria-label', data.value);
            if (this.textEntity) {
                this.setText(this.data.value);
            }
        }

    },
    setActiveState: function (activeState) {
        // drives update(), which re-renders with the correct resting color;
        // set here too so the color applies instantly without a full rebuild
        this.el.setAttribute('sxr-button', 'toggleState', String(activeState));
        this.buttonEntity.setAttribute('material', 'color', activeState ? this.data.activeColor : this.data.backgroundColor);
    },
    setText: function (newText) {
        this.normalizedFontSize = SXR.normalizeFontSize(this.data.fontSize);
        const data = this.data;
        const el = this.el;
        const guiItem = this.guiItem || SXR.getItem(el);
        const options = {
            value: newText,
            width: guiItem.width / 1.12,
            height: guiItem.height * 0.78,
            fontSize: this.normalizedFontSize,
            fontFamily: data.fontFamily,
            color: data.fontColor,
            align: 'center'
        };
        // redraw into the existing canvas when the box is unchanged
        if (this.textEntity && SXR.redrawTextEntity(this.textEntity, options)) { return; }
        if (this.textEntity) { SXR.removeEntity(this.textEntity); }

        const textEntity = SXR.createTextEntity(options);
        this.textEntity = textEntity;

        if(guiItem.bevel){
            textEntity.setAttribute('position', `0 0 ${guiItem.depth+(guiItem.bevelThickness/2)+0.05}`);
        }else{
            textEntity.setAttribute('position', `0 0 ${(guiItem.depth/2)+0.05}`);
        }
        this.buttonEntity.appendChild(textEntity);
    },
});


AFRAME.registerPrimitive( 'a-sxr-button', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'button' },
        'sxr-button': { }
    },
    mappings: {
        //gui interactable general
        'onclick': 'sxr-interactable.clickAction',
        'onhover': 'sxr-interactable.hoverAction',
        'key-code': 'sxr-interactable.keyCode',
        'key': 'sxr-interactable.key',
        //gui item general
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'depth': 'sxr-item.depth',
        'base-depth': 'sxr-item.baseDepth',
        'gap': 'sxr-item.gap',
        'radius': 'sxr-item.radius',
        'margin': 'sxr-item.margin',
        //gui item bevelbox
        'bevel': 'sxr-item.bevel',
        'bevel-segments': 'sxr-item.bevelSegments',
        'steps': 'sxr-item.steps',
        'bevel-size': 'sxr-item.bevelSize',
        'bevel-offset': 'sxr-item.bevelOffset',
        'bevel-thickness': 'sxr-item.bevelThickness',
        //gui button specific
        'on': 'sxr-button.on',
        'value': 'sxr-button.value',
        'font-size': 'sxr-button.fontSize',
        'font-family': 'sxr-button.fontFamily',
        'font-color': 'sxr-button.fontColor',
        'border-color': 'sxr-button.borderColor',
        'focus-color': 'sxr-button.focusColor',
        'background-color': 'sxr-button.backgroundColor',
        'hover-color': 'sxr-button.hoverColor',
        'active-color': 'sxr-button.activeColor',
        'toggle': 'sxr-button.toggle',
        'toggle-state': 'sxr-button.toggleState'
    }
});
