'use strict';

AFRAME.registerComponent('sxr-interactable', {
    schema: {
        clickAction: {type: 'string'},
        hoverAction: {type: 'string'},
        keyCode: {type: 'number', default: -1},
        key: {type: 'string'},
    },
    init: function () {
        const data = this.data;
        const el = this.el;

        if (data.keyCode > 0) {
            this._keyHandler = function (event) {
                if (event.key === data.key || event.keyCode === data.keyCode) {
                    el.emit('click');
                    event.preventDefault();
                }
            };
            window.addEventListener("keydown", this._keyHandler, true);
        }
    },
    setClickAction: function (action) {
        this.data.clickAction = action;
    },
    remove: function () {
        if (this._keyHandler) {
            window.removeEventListener("keydown", this._keyHandler, true);
        }
    },
});
