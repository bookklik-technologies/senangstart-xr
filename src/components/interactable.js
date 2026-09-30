'use strict';

// A single window-level keydown listener dispatches to all registered
// sxr-interactable instances, instead of one global capture listener per
// widget. Note: multiple widgets bound to the same key will all fire —
// bind distinct keys per widget. Shortcuts are ignored while the user is
// typing into an editable surface, during IME composition, and for
// auto-repeated keydown events.
const keyRegistry = {
    listener: null,
    instances: [],
};

const ensureKeyListener = function () {
    if (keyRegistry.listener) { return; }
    keyRegistry.listener = function (event) {
        if (event.repeat || event.isComposing || event.keyCode === 229) { return; }
        if (window.SXR.keyboard.isEditableTarget(event.target)) { return; }
        keyRegistry.instances.slice().forEach(function (instance) {
            if (instance.matchesEvent(event)) {
                event.preventDefault();
                instance.el.emit('click', {
                    source: 'keyboard',
                    key: event.key,
                    keyCode: event.keyCode
                });
            }
        });
    };
    window.addEventListener('keydown', keyRegistry.listener, true);
};

const releaseKeyListener = function () {
    if (keyRegistry.instances.length === 0 && keyRegistry.listener) {
        window.removeEventListener('keydown', keyRegistry.listener, true);
        keyRegistry.listener = null;
    }
};

AFRAME.registerComponent('sxr-interactable', {
    schema: {
        clickAction: {type: 'string'},
        hoverAction: {type: 'string'},
        keyCode: {type: 'number', default: -1},
        key: {type: 'string'},
    },
    init: function () {
        this._bound = false;
        this._syncRegistration();
    },
    update: function () {
        // re-sync when key/keyCode attributes change after init
        this._syncRegistration();
    },
    _syncRegistration: function () {
        // `key` works independently of the legacy numeric `key-code`
        const active = (this.data.key && this.data.key.length > 0) || this.data.keyCode > 0;
        if (active && !this._bound) {
            keyRegistry.instances.push(this);
            this._bound = true;
            ensureKeyListener();
        } else if (!active && this._bound) {
            this._unregister();
        }
    },
    _unregister: function () {
        const index = keyRegistry.instances.indexOf(this);
        if (index !== -1) {
            keyRegistry.instances.splice(index, 1);
        }
        this._bound = false;
        releaseKeyListener();
    },
    // True when this instance's `key` / legacy `key-code` matches the event.
    // Widgets use this to skip their own focused Enter/Space handling when
    // the same key is already bound as a shortcut, preventing duplicate
    // activation.
    matchesEvent: function (event) {
        const data = this.data;
        if (data.key && data.key.length > 0 && event.key === data.key) { return true; }
        if (data.keyCode > 0 && event.keyCode === data.keyCode) { return true; }
        return false;
    },
    setClickAction: function (action) {
        this.data.clickAction = action;
    },
    remove: function () {
        this._unregister();
    },
});
