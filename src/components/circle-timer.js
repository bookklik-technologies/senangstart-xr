'use strict';

AFRAME.registerComponent('sxr-circle-timer', {
    schema: {
        countDown: {type: 'number', default: 10 },
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.onSurface},
        borderColor: {type: 'string', default: SXR.colors.border},
        backgroundColor: {type: 'string', default: SXR.colors.surface},
        activeColor: {type: 'string', default: SXR.colors.primary},
    },
    init: function() {

        const data = this.data;
        const el = this.el;
        const guiItem = el.getAttribute("sxr-item");
        this.guiItem = guiItem;

        this.normalizedFontSize = SXR.normalizeFontSize(data.fontSize);
        
        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.height};`);
        el.setAttribute('material', `shader: flat; transparent: true; opacity: 1; side:back; color:${data.backgroundColor};`);

        const timerContainer = document.createElement("a-entity");
        timerContainer.setAttribute('geometry', `primitive: cylinder; radius: ${guiItem.height/2}; height: 0.02;`);
        timerContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.backgroundColor}`);
        timerContainer.setAttribute('rotation', '90 0 0');
        timerContainer.setAttribute('position', '0 0 0.01');
        el.appendChild(timerContainer);

        const timerIndicator1 = document.createElement("a-ring");
        timerIndicator1.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        timerIndicator1.setAttribute('radius-inner', `${guiItem.height/3}`);
        timerIndicator1.setAttribute('radius-outer', `${guiItem.height/2}`);
        timerIndicator1.setAttribute('theta-start', '-1');
        timerIndicator1.setAttribute('theta-length', '3');
        timerIndicator1.setAttribute('position', '0 0 0.04');
        el.appendChild(timerIndicator1);
        const timerIndicator2 = document.createElement("a-ring");
        timerIndicator2.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        timerIndicator2.setAttribute('radius-inner', `${guiItem.height/3}`);
        timerIndicator2.setAttribute('radius-outer', `${guiItem.height/2}`);
        timerIndicator2.setAttribute('theta-start', '89');
        timerIndicator2.setAttribute('theta-length', '3');
        timerIndicator2.setAttribute('position', '0 0 0.04');
        el.appendChild(timerIndicator2);
        const timerIndicator3 = document.createElement("a-ring");
        timerIndicator3.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        timerIndicator3.setAttribute('radius-inner', `${guiItem.height/3}`);
        timerIndicator3.setAttribute('radius-outer', `${guiItem.height/2}`);
        timerIndicator3.setAttribute('theta-start', '179');
        timerIndicator3.setAttribute('theta-length', '3');
        timerIndicator3.setAttribute('position', '0 0 0.04');
        el.appendChild(timerIndicator3);
        const timerIndicator4 = document.createElement("a-ring");
        timerIndicator4.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor}`);
        timerIndicator4.setAttribute('radius-inner', `${guiItem.height/3}`);
        timerIndicator4.setAttribute('radius-outer', `${guiItem.height/2}`);
        timerIndicator4.setAttribute('theta-start', '269');
        timerIndicator4.setAttribute('theta-length', '3');
        timerIndicator4.setAttribute('position', '0 0 0.04');
        el.appendChild(timerIndicator4);

        const timerRing = document.createElement("a-ring");
        timerRing.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor}`);
        timerRing.setAttribute('radius-inner', `${guiItem.height/3}`);
        timerRing.setAttribute('radius-outer', `${guiItem.height/2}`);
        timerRing.setAttribute('theta-start', '0');
        timerRing.setAttribute('theta-length', '0'); // this has to increase 0 to 360 when running the countdown
        timerRing.setAttribute('rotation', '0 180 90');
        timerRing.setAttribute('position', '0 0 0.03');
        el.appendChild(timerRing);
        this.timerRing = timerRing;

        this.initCount = data.countDown;
        this._started = false;
        this._startTime = 0;
        this._lastSecond = null;
        this._finished = false;
        this.setText(data.countDown);

    },
    tick: function (time) {
        const total = this.initCount;
        if (!total || total <= 0 || this._finished) { return; }

        if (!this._started) {
            this._started = true;
            this._startTime = time;
        }

        const elapsedSeconds = (time - this._startTime) / 1000;
        const left = Math.max(0, total - elapsedSeconds);
        const elapsedRatio = Math.min(1, elapsedSeconds / total);
        const seconds = Math.ceil(left);

        if (seconds !== this._lastSecond) {
            this._lastSecond = seconds;
            this.setText(seconds);
        }

        this.timerRing.setAttribute('theta-length', `${elapsedRatio * 360}`);

        if (left <= 0) {
            this._finished = true;
            this.callback();
        }
    },
    update: function (oldData) {
        const data = this.data;
        if (Object.keys(oldData).length === 0) { return; }
        if (data.countDown !== oldData.countDown) {
            // restart the countdown with the new duration
            this.initCount = data.countDown;
            this._started = false;
            this._startTime = 0;
            this._lastSecond = null;
            this._finished = false;
            if (this.textEntity) {
                this.setText(data.countDown);
            }
        }
    },
    remove: function () {
        if (this.textEntity) {
            SXR.removeEntity(this.textEntity);
            this.textEntity = null;
        }
    },
    setText: function (newTime) {
        const options = {
            value: newTime,
            width: this.guiItem.height * 0.7,
            height: this.guiItem.height * 0.38,
            fontSize: this.normalizedFontSize,
            fontFamily: this.data.fontFamily,
            color: this.data.fontColor,
            align: 'center'
        };
        // countdown ticks redraw the existing canvas instead of rebuilding
        if (this.textEntity && SXR.redrawTextEntity(this.textEntity, options)) { return; }
        if (this.textEntity) { SXR.removeEntity(this.textEntity); }
        const textEntity = SXR.createTextEntity(options);
        this.textEntity = textEntity;
        textEntity.setAttribute('position', '0 0 0.05');
        this.el.appendChild(textEntity);

    },
    callback: function () {
        const guiInteractable = this.el.getAttribute("sxr-interactable");
        const clickActionFunction = SXR.getActionFunction(guiInteractable && guiInteractable.clickAction);
        if (clickActionFunction) clickActionFunction();
    }
});

AFRAME.registerPrimitive( 'a-sxr-circle-timer', {
    defaultComponents: {
        'sxr-item': { type: 'circle-timer' },
        'sxr-circle-timer': { }
    },
    mappings: {
        //gui item general
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        //gui timer specific
        'count-down': 'sxr-circle-timer.countDown',
        'font-size': 'sxr-circle-timer.fontSize',
        'font-family': 'sxr-circle-timer.fontFamily',
        'font-color': 'sxr-circle-timer.fontColor',
        'border-color': 'sxr-circle-timer.borderColor',
        'background-color': 'sxr-circle-timer.backgroundColor',
        'active-color': 'sxr-circle-timer.activeColor',
        'callback': 'sxr-interactable.clickAction',
    }
});
