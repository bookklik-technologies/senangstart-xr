'use strict';

const onAppendChildToContainer = function(elem, f) {
  const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
          if (m.addedNodes.length) {
              f(m.target, m.addedNodes)
          }
          if (m.removedNodes.length) {
              f(m.target, [])
          }
      })
  })
  observer.observe(elem, {childList: true})
  return observer;
}

const inheritedStyleAttributes = {
    fontFamily: 'font-family',
    fontColor: 'font-color',
    borderColor: 'border-color',
    backgroundColor: 'background-color',
    hoverColor: 'hover-color',
    activeColor: 'active-color',
    handleColor: 'handle-color'
};

const inheritedStyles = new WeakMap();

const applyInheritedStyles = function(childElement, childGuiItem, styles) {
    if (!styles) return;

    const widgetNames = Object.keys(childElement.components || {}).filter(name => name.startsWith('sxr-') && name !== 'sxr-item' && name !== 'sxr-interactable');
    const declaredName = `sxr-${childGuiItem.type}`;
    const componentName = widgetNames.includes(declaredName) ? declaredName : widgetNames[0] || declaredName;
    const component = AFRAME.components[componentName];
    if (!component || !component.schema) return;

    Object.keys(inheritedStyleAttributes).forEach(function(styleName) {
        if (!component.schema[styleName]) return;

        const attributeName = inheritedStyleAttributes[styleName];
        const previous = inheritedStyles.get(childElement) || {};
        const current = childElement.getAttribute(attributeName);
        const domData = childElement.getDOMAttribute ? childElement.getDOMAttribute(componentName) : null;
        if (childElement.hasAttribute(attributeName) && current !== previous[styleName]) return;
        if (domData && Object.prototype.hasOwnProperty.call(domData, styleName) &&
            domData[styleName] !== previous[styleName]) return;

        const styleValue = styles[styleName];
        if (styleValue === undefined || styleValue === null || styleValue === '') return;

        if (previous[styleName] === styleValue) return;
        previous[styleName] = styleValue;
        inheritedStyles.set(childElement, previous);
        // Primitive mappings are public; ordinary entities need component data.
        if (childElement.tagName && childElement.tagName.toLowerCase() === 'a-entity') {
            childElement.setAttribute(componentName, styleName, styleValue);
        } else {
            childElement.setAttribute(attributeName, styleValue);
        }
    });
};

// Normalize style values: documented camelCase values plus the CSS kebab
// aliases map onto the supported set; anything else falls back to the
// default. Keeps the layout robust against free-form author input.
const normalizeFlexValue = function (value, aliases, fallback) {
    const normalized = String(value || '').trim();
    if (!normalized) { return fallback; }
    const key = normalized.replace(/[-_]/g, '').toLowerCase();
    return aliases[key] || fallback;
};

const DIRECTION_ALIASES = {
    row: 'row',
    column: 'column',
};
const JUSTIFY_ALIASES = {
    flexstart: 'flexStart',
    start: 'flexStart',
    center: 'center',
    flexend: 'flexEnd',
    end: 'flexEnd',
};
const ALIGN_ALIASES = {
    flexstart: 'flexStart',
    start: 'flexStart',
    center: 'center',
    flexend: 'flexEnd',
    end: 'flexEnd',
};

AFRAME.registerComponent('sxr-flex-container', {
    dependencies: ['sxr-item'],
    schema: {
        flexDirection: { type: 'string', default: 'row' },
        justifyContent: { type: 'string', default: 'flexStart' },
        alignItems: { type: 'string', default: 'flexStart' },
        itemPadding: { type: 'number', default: 0.0 },
        opacity: { type: 'number', default: 0.0 },
        isTopContainer: {type: 'boolean', default: false},
        panelColor: {type: 'string', default: SXR.colors.surface},
        panelRounded: { type: 'number', default: 0.05 },

        fontFamily: {type: 'string', default: SXR.fonts.default},
        fontColor: {type: 'string', default: SXR.colors.onSurface},
        borderColor: {type: 'string', default: SXR.colors.border},
        backgroundColor: {type: 'string', default: SXR.colors.surface},
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        activeColor: {type: 'string', default: SXR.colors.primary},
        handleColor: {type: 'string', default: SXR.colors.onSurface},
        // Legacy programmatic style objects remain supported through a real
        // custom property parser, rather than an invalid nested schema.
        styles: {
            default: {},
            parse: function (value) {
                if (value && typeof value === 'object' && !Array.isArray(value)) return {...value};
                try {
                    const parsed = JSON.parse(value);
                    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
                } catch { return {}; }
            },
            stringify: JSON.stringify
        }

    },
    init: function () {
        const component = this;
        this._removed = false;
        this._loadingChildren = new Map();
        this._childWatchers = new Map();
        // one MutationObserver per component instance; appended AND removed
        // children trigger a debounced layout() instead of a full re-init
        if (!this._mutationObserver) {
            this._mutationObserver = onAppendChildToContainer(this.el, function (containerElement, addedNodes) {
                const flexContainer = containerElement.components['sxr-flex-container'];
                if (!flexContainer) { return; }
                const addedChildren = [];
                for (let i = 0; i < addedNodes.length; i++) {
                    if (addedNodes[i].nodeType === 1) { addedChildren.push(addedNodes[i]); }
                }
                // a removal batch has no added nodes: relayout unconditionally
                flexContainer._scheduleLayout(addedChildren, addedChildren.length === 0);
            });
        }

        // relayout when the container's or a child's dimensions change live
        this._onComponentChanged = function (evt) {
            if (!evt.detail || evt.detail.name !== 'sxr-item') { return; }
            component._scheduleLayout([], true);
        };
        this.el.addEventListener('componentchanged', this._onComponentChanged);

        this.layout();
    },
    update: function (oldData) {
        const hasOld = oldData && Object.keys(oldData).length > 0;
        if (!hasOld) { return; }
        const layoutKeys = ['flexDirection', 'justifyContent', 'alignItems', 'itemPadding', 'isTopContainer', 'panelColor', 'panelRounded', 'opacity', ...Object.keys(inheritedStyleAttributes)];
        const changed = layoutKeys.some(function (key) { return oldData[key] !== this.data[key]; }, this)
            || JSON.stringify(oldData.styles) !== JSON.stringify(this.data.styles);
        if (changed) {
            this.layout();
        }
    },
    // coalesce bursts of appended/removed children into a single re-layout;
    // force=true relayouts even when no pending child has loaded (removals)
    _scheduleLayout: function (addedChildren, force) {
        const flexContainer = this;
        if (this._removed) return;
        this._forceLayout = this._forceLayout || force === true;
        flexContainer._pendingChildren = (flexContainer._pendingChildren || []).concat(addedChildren);
        if (flexContainer._layoutScheduled) { return; }
        flexContainer._layoutScheduled = true;
        flexContainer._layoutTimer = setTimeout(function () {
            flexContainer._layoutTimer = null;
            flexContainer._layoutScheduled = false;
            const pending = flexContainer._pendingChildren || [];
            flexContainer._pendingChildren = [];
            if (flexContainer._removed) return;
            let shouldLayout = flexContainer._forceLayout;
            flexContainer._forceLayout = false;
            pending.forEach(function (child) {
                if (child.hasLoaded) {
                    shouldLayout = true;
                } else {
                    if (!flexContainer._loadingChildren.has(child)) {
                        const onLoaded = function () {
                            flexContainer._loadingChildren.delete(child);
                            if (!flexContainer._removed) flexContainer.layout();
                        };
                        flexContainer._loadingChildren.set(child, onLoaded);
                        child.addEventListener('loaded', onLoaded, { once: true });
                    }
                }
            });
            if (shouldLayout) { flexContainer.layout(); }
        }, 0);
    },
    layout: function () {
        if (this._removed) return;
        const containerGuiItem = SXR.getItem(this.el);
        const styles = {};
        const authored = this.el.getDOMAttribute ? this.el.getDOMAttribute('sxr-flex-container') || {} : {};
        Object.keys(inheritedStyleAttributes).forEach(key => {
            const legacy = this.data.styles || {};
            styles[key] = Object.prototype.hasOwnProperty.call(authored, key)
                ? this.data[key] : legacy[key] === undefined ? this.data[key] : legacy[key];
        });

        const flexDirection = normalizeFlexValue(this.data.flexDirection, DIRECTION_ALIASES, 'row');
        const justifyContent = normalizeFlexValue(this.data.justifyContent, JUSTIFY_ALIASES, 'flexStart');
        const alignItems = normalizeFlexValue(this.data.alignItems, ALIGN_ALIASES, 'flexStart');
        // itemPadding is spacing BETWEEN children (not around the group)
        const itemPadding = Math.max(0, Number(this.data.itemPadding) || 0);

        if (this.data.isTopContainer) {
            this.setBackground();
        }else{
            this.el.setAttribute('rounded', {
                height: containerGuiItem.height,
                width: containerGuiItem.width,
                opacity: this.data.opacity,
                color: this.data.panelColor,
                radius: this.data.panelRounded,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                renderOrder: -100
            });
        }

        this.children = this.el.getChildEntities();
        // A-Frame componentchanged events do not bubble. Subscribe to each
        // direct child, and release subscriptions when children leave.
        if (this._childWatchers) {
            this._childWatchers.forEach((handler, child) => {
                if (!this.children.includes(child)) {
                    child.removeEventListener('componentchanged', handler);
                    this._childWatchers.delete(child);
                }
            });
            this.children.forEach(child => {
                if (this._childWatchers.has(child)) return;
                const handler = evt => {
                    if (evt.detail && evt.detail.name === 'sxr-item') this._scheduleLayout([], true);
                };
                child.addEventListener('componentchanged', handler);
                this._childWatchers.set(child, handler);
            });
        }

        const isRow = flexDirection === 'row';
        // group extent along the main axis, including inter-child spacing
        let groupExtent = 0;
        let visibleChildren = 0;
        this.children.forEach(function (childElement) {
            const childGuiItem = childElement.getAttribute("sxr-item");
            if (!childGuiItem) { return; }
            const extent = isRow ? childGuiItem.width : childGuiItem.height;
            const marginStart = isRow ? childGuiItem.margin.w : childGuiItem.margin.x;
            const marginEnd = isRow ? childGuiItem.margin.y : childGuiItem.margin.z;
            groupExtent += marginStart + extent + marginEnd;
            visibleChildren += 1;
        });
        if (visibleChildren > 1) {
            groupExtent += itemPadding * (visibleChildren - 1);
        }

        // coordinate system is 0, 0 in the top left
        let cursorX = 0;
        let cursorY = 0;
        if (isRow) {
            // first figure out cursor position on main X axis
            if (justifyContent === 'flexStart') {
                cursorX = 0;
            } else if (justifyContent === 'center') {
                cursorX = (containerGuiItem.width - groupExtent)*0.5;
            } else if (justifyContent === 'flexEnd') {
                cursorX = containerGuiItem.width - groupExtent;
            }
            // cross-axis (Y) alignment is applied per child in the layout loop below
        } else {
            // first figure out cursor position on main Y axis
            if (justifyContent === 'flexStart') {
                cursorY = 0;
            } else if (justifyContent === 'center') {
                cursorY = (containerGuiItem.height - groupExtent)*0.5;
            } else if (justifyContent === 'flexEnd') {
                cursorY = containerGuiItem.height - groupExtent;
            }
            // cross-axis (X) alignment is applied per child in the layout loop below
        }

        // now that cursor positions are determined, loop through and lay out items
        let laidOutIndex = 0;
        for (let i = 0; i < this.children.length; i++) {
            const childElement = this.children[i];
            let childPositionX = 0;
            let childPositionY = 0;
            const childPositionZ = 0.01;
            const childGuiItem = childElement.getAttribute("sxr-item");

            // now get object position in aframe container cordinates (0, 0 is center)
            if (childGuiItem) {
                const childIndex = laidOutIndex;
                laidOutIndex += 1;
                applyInheritedStyles(childElement, childGuiItem, styles);

                const marginStart = isRow ? childGuiItem.margin.w : childGuiItem.margin.x;
                const marginEnd = isRow ? childGuiItem.margin.y : childGuiItem.margin.z;
                const childExtent = isRow ? childGuiItem.width : childGuiItem.height;

                if (isRow) {
                    if (alignItems === 'center') {
                        childPositionY = 0; // child position is always 0 for center vertical alignment
                    } else if (alignItems === 'flexStart') {
                        childPositionY = containerGuiItem.height * 0.5 - childGuiItem.margin.x - childGuiItem.height * 0.5;
                    } else if (alignItems === 'flexEnd') {
                        childPositionY = -containerGuiItem.height * 0.5 + childGuiItem.margin.z + childGuiItem.height * 0.5;
                    }
                    childPositionX = -containerGuiItem.width*0.5 + cursorX + childGuiItem.margin.w + childGuiItem.width * 0.5
                    // spacing after each child except the last
                    cursorX = cursorX + childGuiItem.margin.w + childGuiItem.width + childGuiItem.margin.y;
                    if (childIndex < visibleChildren - 1) {
                        cursorX += itemPadding;
                    }
                } else {
                    if (alignItems === 'center') {
                        childPositionX = 0; // child position is always 0 to center
                    } else if (alignItems === 'flexStart') {
                        childPositionX = -containerGuiItem.width*0.5 + childGuiItem.margin.w + childGuiItem.width * 0.5;
                    } else if (alignItems === 'flexEnd') {
                        childPositionX = containerGuiItem.width*0.5 - childGuiItem.margin.y - childGuiItem.width * 0.5;
                    }
                    childPositionY = containerGuiItem.height*0.5 - cursorY - childGuiItem.margin.x - childGuiItem.height * 0.5
                    cursorY = cursorY + marginStart + childExtent + marginEnd;
                    if (childIndex < visibleChildren - 1) {
                        cursorY += itemPadding;
                    }
                }
                childElement.setAttribute('position', `${childPositionX} ${childPositionY} ${childPositionZ}`)
                // only give anonymous children a hit-plane; widget-owned
                // geometry (button/toggle/... planes) must not be replaced
                if (childGuiItem.type !== 'label' && !childElement.getAttribute('geometry')) {
                    childElement.setAttribute('geometry', `primitive: plane; height: ${childGuiItem.height}; width: ${childGuiItem.width};`)
                }

                const childFlexContainer = childElement.components['sxr-flex-container']
                if (childFlexContainer) {
                    childFlexContainer.setBackground();
                }
            }
        }

    },
    remove: function () {
        this._removed = true;
        if (this._loadingChildren) {
            this._loadingChildren.forEach((handler, child) => child.removeEventListener('loaded', handler));
            this._loadingChildren.clear();
        }
        if (this._childWatchers) {
            this._childWatchers.forEach((handler, child) => child.removeEventListener('componentchanged', handler));
            this._childWatchers.clear();
        }
        if (this._mutationObserver) {
            this._mutationObserver.disconnect();
            this._mutationObserver = null;
        }
        if (this._onComponentChanged) {
            this.el.removeEventListener('componentchanged', this._onComponentChanged);
            this._onComponentChanged = null;
        }
        if (this._layoutTimer) {
            clearTimeout(this._layoutTimer);
            this._layoutTimer = null;
        }
        this._layoutScheduled = false;
        this._pendingChildren = [];
        if (this.panelBackground) {
            SXR.removeEntity(this.panelBackground);
            this.panelBackground = null;
        }
    },
    setBackground: function () {
        if (this.data.opacity > 0) {
            const guiItem = SXR.getItem(this.el);
            const panelBackground = this.panelBackground || document.createElement("a-entity");
            panelBackground.setAttribute('rounded', {
                height: guiItem.height,
                width: guiItem.width,
                opacity: this.data.opacity,
                color: this.data.panelColor,
                radius: this.data.panelRounded,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: 2,
                renderOrder: -100
            });
            panelBackground.setAttribute('position', this.el.getAttribute("position").x + ' ' + this.el.getAttribute("position").y + ' ' + (this.el.getAttribute("position").z - 0.0125));
            panelBackground.setAttribute('rotation', this.el.getAttribute("rotation").x + ' ' + this.el.getAttribute("rotation").y + ' ' + this.el.getAttribute("rotation").z);
            if (!this.panelBackground) {
                this.el.parentNode.insertBefore(panelBackground, this.el);
                this.panelBackground = panelBackground;
            }
        } else if (this.panelBackground) {
            SXR.removeEntity(this.panelBackground);
            this.panelBackground = null;
        }

    },

});

AFRAME.registerPrimitive( 'a-sxr-flex-container', {
    defaultComponents: {
        'sxr-item': { type: 'flex-container' },
        'sxr-flex-container': { }
    },
    mappings: {
        'width': 'sxr-item.width',
        'height': 'sxr-item.height',
        'margin': 'sxr-item.margin',
        'flex-direction': 'sxr-flex-container.flexDirection',
        'justify-content': 'sxr-flex-container.justifyContent',
        'align-items': 'sxr-flex-container.alignItems',
        'item-padding': 'sxr-flex-container.itemPadding',
        'opacity': 'sxr-flex-container.opacity',
        'is-top-container': 'sxr-flex-container.isTopContainer',
        'panel-color': 'sxr-flex-container.panelColor',
        'panel-rounded': 'sxr-flex-container.panelRounded',
        'font-family': 'sxr-flex-container.fontFamily',
        'font-color': 'sxr-flex-container.fontColor',
        'border-color': 'sxr-flex-container.borderColor',
        'background-color': 'sxr-flex-container.backgroundColor',
        'hover-color': 'sxr-flex-container.hoverColor',
        'active-color': 'sxr-flex-container.activeColor',
        'handle-color': 'sxr-flex-container.handleColor',
    }
});
