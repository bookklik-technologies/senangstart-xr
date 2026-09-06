'use strict';

// A single window-level keydown listener dispatches to all registered
// sxr-interactable instances, instead of one global capture listener per
// widget. Note: multiple widgets bound to the same key will all fire —
// bind distinct keys per widget.
const keyRegistry = {
    listener: null,
    instances: [],
};

const ensureKeyListener = function () {
    if (keyRegistry.listener) { return; }
    keyRegistry.listener = function (event) {
        keyRegistry.instances.slice().forEach(function (instance) {
            const data = instance.data;
            if (event.key === data.key || event.keyCode === data.keyCode) {
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
        const active = this.data.keyCode > 0;
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
    setClickAction: function (action) {
        this.data.clickAction = action;
    },
    remove: function () {
        this._unregister();
    },
});
