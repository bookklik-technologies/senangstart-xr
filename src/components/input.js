'use strict';

AFRAME.registerComponent('sxr-input', {
    dependencies: ['sxr-item', 'sxr-interactable'],
    schema: {
        on: {default: 'click'},
        value: {type: 'string', default: ''},
        nativeEditing: {type: 'boolean', default: false},
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.background},
        borderColor: {type: 'string', default: SXR.colors.border},
        borderHoverColor: {type: 'string', default: SXR.colors.secondary},
        backgroundColor: {type: 'string', default: SXR.colors.onSurface},
        hoverColor: {type: 'string', default: SXR.colors.onSurface},
    },
    init: function() {

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

        ////WAI ARIA Support
        el.setAttribute('role', 'textbox');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', data.value);

        this._onMouseEnter = function () {
            el.setAttribute('material', 'color', data.hoverColor);
            component.borderTopEntity.setAttribute('material', 'color', data.borderHoverColor);
            component.borderBottomEntity.setAttribute('material', 'color', data.borderHoverColor);
            component.borderLeftEntity.setAttribute('material', 'color', data.borderHoverColor);
            component.borderRightEntity.setAttribute('material', 'color', data.borderHoverColor);
        };
        el.addEventListener('mouseenter', this._onMouseEnter);

        this._onMouseLeave = function () {
            el.setAttribute('material', 'color', data.backgroundColor);
            component.borderTopEntity.setAttribute('material', 'color', data.borderColor);
            component.borderBottomEntity.setAttribute('material', 'color', data.borderColor);
            component.borderLeftEntity.setAttribute('material', 'color', data.borderColor);
            component.borderRightEntity.setAttribute('material', 'color', data.borderColor);
        };
        el.addEventListener('mouseleave', this._onMouseLeave);

        this._onClick = function (evt) {
            if (data.nativeEditing) {
                component.focusNativeField();
            }
            const guiInteractable = el.getAttribute("sxr-interactable");
            const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
            if (clickActionFunction) clickActionFunction(evt);
        };
        el.addEventListener(data.on, this._onClick);
        this._onKeyUp = function (event) {
            if (!SXR.keyboard.isActivationPress(event)) return;
            const shortcut = el.components['sxr-interactable'];
            if (shortcut && shortcut.matchesEvent(event)) return;
            event.preventDefault();
            el.emit(data.on, {source: 'keyboard'});
        };
        el.addEventListener('keyup', this._onKeyUp);
        this._onFocus = () => this._onMouseEnter();
        this._onBlur = () => this._onMouseLeave();
        el.addEventListener('focus', this._onFocus);
        el.addEventListener('blur', this._onBlur);

        // rebind the activation listener when the event name changes
        this._updateActivationBinding = function (oldEventName) {
            if (oldEventName && oldEventName !== data.on) {
                el.removeEventListener(oldEventName, component._onClick);
                el.addEventListener(data.on, component._onClick);
            }
        };

        // live sxr-item updates (dimensions) rebuild the geometry
        this._onItemChanged = SXR.watchGuiItem(el, function () {
            component._rebuild();
        });

    },
    _buildGeometry: function () {
        const data = this.data;
        const el = this.el;
        const guiItem = this.guiItem || SXR.getItem(el);

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);
        el.setAttribute('material', `shader: flat; transparent: false; side:front; color:${data.backgroundColor};`);

        const borderTopEntity = document.createElement("a-entity");
        borderTopEntity.setAttribute('geometry', `primitive: box; width: ${(guiItem.width)}; height: 0.05; depth: 0.02;`);
        borderTopEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        borderTopEntity.setAttribute('position', `0 ${(guiItem.height/2)-0.025} 0.01`);
        el.appendChild(borderTopEntity);
        this.borderTopEntity = borderTopEntity;
        const borderBottomEntity = document.createElement("a-entity");
        borderBottomEntity.setAttribute('geometry', `primitive: box; width: ${(guiItem.width)}; height: 0.05; depth: 0.02;`);
        borderBottomEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        borderBottomEntity.setAttribute('position', `0 -${(guiItem.height/2)-0.025} 0.01`);
        el.appendChild(borderBottomEntity);
        this.borderBottomEntity = borderBottomEntity;
        const borderLeftEntity = document.createElement("a-entity");
        borderLeftEntity.setAttribute('geometry', `primitive: box; width: 0.05; height: ${(guiItem.height)}; depth: 0.02;`);
        borderLeftEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        borderLeftEntity.setAttribute('position', `-${(guiItem.width/2)-0.025} 0 0.01`);
        el.appendChild(borderLeftEntity);
        this.borderLeftEntity = borderLeftEntity;
        const borderRightEntity = document.createElement("a-entity");
        borderRightEntity.setAttribute('geometry', `primitive: box; width: 0.05; height: ${(guiItem.height)}; depth: 0.02;`);
        borderRightEntity.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        borderRightEntity.setAttribute('position', `${(guiItem.width/2)-0.025} 0 0.01`);
        el.appendChild(borderRightEntity);
        this.borderRightEntity = borderRightEntity;
    },
    // dispose owned geometry and rebuild from current sxr-item data
    _rebuild: function () {
        const el = this.el;
        const previousItemKey = this._itemKey;
        this.guiItem = SXR.getItem(el);
        const guiItem = this.guiItem;
        this._itemKey = [guiItem.width, guiItem.height].join('|');
        if (previousItemKey !== undefined && previousItemKey === this._itemKey) { return; }

        const self = this;
        ['borderTopEntity', 'borderBottomEntity', 'borderLeftEntity', 'borderRightEntity'].forEach(function (key) {
            if (self[key]) { SXR.removeEntity(self[key]); }
            self[key] = null;
        });
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
        this._buildGeometry();
        this.setText(this.data.value);
    },
    remove: function () {
        const el = this.el;
        el.removeEventListener('mouseenter', this._onMouseEnter);
        el.removeEventListener('mouseleave', this._onMouseLeave);
        el.removeEventListener(this.data.on, this._onClick);
        el.removeEventListener('keyup', this._onKeyUp);
        el.removeEventListener('focus', this._onFocus);
        el.removeEventListener('blur', this._onBlur);
        el.removeEventListener('componentchanged', this._onItemChanged);
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
        ['borderTopEntity', 'borderBottomEntity', 'borderLeftEntity', 'borderRightEntity'].forEach(function (key) {
            if (this[key]) {
                SXR.removeEntity(this[key]);
                this[key] = null;
            }
        }, this);
        this._teardownNativeField();
    },
    // ---- opt-in native text editing --------------------------------------
    // When nativeEditing is enabled, activation focuses a hidden <input>
    // kept in sync with the widget value. Typing, selection, paste and IME
    // composition all flow through the native field; the widget emits
    // 'input' on every value change and 'change' on commit (Enter/blur).
    focusNativeField: function () {
        if (!this.data.nativeEditing) { return; }
        const field = this._ensureNativeField();
        if (field.value !== this.data.value) field.value = this.data.value;
        this._committedValue = this.data.value;
        try { field.focus(); } catch { /* environments without focus */ }
    },
    _ensureNativeField: function () {
        if (this.nativeField) { return this.nativeField; }
        const component = this;
        const field = document.createElement('input');
        field.type = 'text';
        field.setAttribute('autocomplete', 'off');
        field.setAttribute('aria-label', this.el.getAttribute('aria-label') || 'Text input');
        field.setAttribute('tabindex', '-1');
        field.style.position = 'fixed';
        field.style.left = '0';
        field.style.top = '0';
        field.style.width = '1px';
        field.style.height = '1px';
        field.style.opacity = '0';
        field.style.border = 'none';
        field.style.padding = '0';
        field.style.margin = '0';
        field.style.pointerEvents = 'none';
        document.body.appendChild(field);
        this.nativeField = field;

        this._onNativeInput = function () {
            // typing/selection/paste/composition all land here; route through
            // setAttribute so the text re-renders and 'input' is emitted
            component.el.setAttribute('sxr-input', 'value', field.value);
        };
        this._onNativeKeyDown = function (event) {
            if (event.isComposing || event.keyCode === 229) { return; }
            if (event.key === 'Enter') {
                event.preventDefault();
                component._commitNativeValue();
            }
        };
        this._onNativeCommit = function () {
            component._commitNativeValue();
        };
        field.addEventListener('input', this._onNativeInput);
        field.addEventListener('compositionend', this._onNativeInput);
        field.addEventListener('keydown', this._onNativeKeyDown);
        field.addEventListener('blur', this._onNativeCommit);
        return field;
    },
    _commitNativeValue: function () {
        if (!this.nativeField) { return; }
        if (this.nativeField.value !== this.data.value) {
            this.el.setAttribute('sxr-input', 'value', this.nativeField.value);
        }
        if (this._committedValue !== this.data.value) {
            this._committedValue = this.data.value;
            this.el.emit('change', {value: this.data.value});
        }
    },
    _teardownNativeField: function () {
        const field = this.nativeField;
        if (!field) { return; }
        field.removeEventListener('input', this._onNativeInput);
        field.removeEventListener('compositionend', this._onNativeInput);
        field.removeEventListener('keydown', this._onNativeKeyDown);
        field.removeEventListener('blur', this._onNativeCommit);
        if (field.parentNode) { field.parentNode.removeChild(field); }
        this.nativeField = null;
    },
    setText: function (newText) {
        this.normalizedFontSize = SXR.normalizeFontSize(this.data.fontSize);
        const guiItem = this.guiItem || SXR.getItem(this.el);
        const options = {
            value: newText,
            width: guiItem.width * 0.9,
            height: guiItem.height * 0.72,
            fontSize: this.normalizedFontSize,
            fontFamily: this.data.fontFamily,
            color: this.data.fontColor,
            align: 'left'
        };
        // per-keystroke redraws reuse the existing canvas/texture
        if (this.textEntity && SXR.redrawTextEntity(this.textEntity, options)) { return; }
        if (this.textEntity) { SXR.removeEntity(this.textEntity); }
        const textEntity = SXR.createTextEntity(options);
        this.textEntity = textEntity;
        textEntity.setAttribute('position', `0 0 0.05`);
        this.el.appendChild(textEntity);
    },
    update: function (oldData) {
        const data = this.data;
        const el = this.el;
        const hasOld = oldData && Object.keys(oldData).length > 0;
        if (!hasOld) { return; }

        if (data.on !== oldData.on && this._updateActivationBinding) {
            this._updateActivationBinding(oldData.on);
        }

        if (!data.nativeEditing && this.nativeField) {
            this._commitNativeValue();
            this._teardownNativeField();
        }
        if (['fontSize', 'fontFamily', 'fontColor'].some(key => data[key] !== oldData[key]) && this.textEntity) {
            this.setText(data.value);
        }
        if (data.backgroundColor !== oldData.backgroundColor) el.setAttribute('material', 'color', data.backgroundColor);
        if (data.borderColor !== oldData.borderColor) {
            ['borderTopEntity', 'borderBottomEntity', 'borderLeftEntity', 'borderRightEntity'].forEach(key => {
                if (this[key]) this[key].setAttribute('material', 'color', data.borderColor);
            });
        }

        if (data.value !== oldData.value) {
            el.setAttribute('aria-label', data.value);
            if (this.textEntity) {
                this.setText(data.value);
            }
            if (this.nativeField && this.nativeField.value !== data.value) {
                this.nativeField.value = data.value;
            }
            el.emit('input', {value: data.value, previousValue: oldData.value});
        }
    },
    appendText(text) {
        const newText = this.data.value + text;
        this.el.setAttribute('sxr-input', 'value', newText);
    },
    delete() {
        if (this.data.value && this.data.value.length > 0) {
            const newText = this.data.value.slice(0, -1);
            this.el.setAttribute('sxr-input', 'value', newText);
        }
    }
});

AFRAME.registerPrimitive( 'a-sxr-input', {
    defaultComponents: {
        'sxr-interactable': { },
        'sxr-item': { type: 'input' },
        'sxr-input': { }
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
        'margin': 'sxr-item.margin',
        //gui input specific
        'value': 'sxr-input.value',
        'native-editing': 'sxr-input.nativeEditing',
        'font-size': 'sxr-input.fontSize',
        'font-family': 'sxr-input.fontFamily',
        'font-color': 'sxr-input.fontColor',
        'background-color': 'sxr-input.backgroundColor',
        'hover-color': 'sxr-input.hoverColor',
        'border-color': 'sxr-input.borderColor',
        'border-hover-color': 'sxr-input.borderHoverColor',
    }
});
