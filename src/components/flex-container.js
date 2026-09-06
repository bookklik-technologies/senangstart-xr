'use strict';

const onAppendChildToContainer = function(elem, f) {
  const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
          if (m.addedNodes.length) {
              f(m.target, m.addedNodes)
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

const applyInheritedStyles = function(childElement, childGuiItem, styles) {
    if (!styles) return;

    const componentName = `sxr-${childGuiItem.type}`;
    const component = AFRAME.components[componentName];
    if (!component || !component.schema) return;

    Object.keys(inheritedStyleAttributes).forEach(function(styleName) {
        if (!component.schema[styleName]) return;

        const attributeName = inheritedStyleAttributes[styleName];
        if (childElement.hasAttribute(attributeName)) return;

        const styleValue = styles[styleName];
        if (styleValue === undefined || styleValue === null || styleValue === '') return;

        childElement.setAttribute(attributeName, styleValue);
    });
};

AFRAME.registerComponent('sxr-flex-container', {
    schema: {
        flexDirection: { type: 'string', default: 'row' },
        justifyContent: { type: 'string', default: 'flexStart' },
        alignItems: { type: 'string', default: 'flexStart' },
        itemPadding: { type: 'number', default: 0.0 },
        opacity: { type: 'number', default: 0.0 },
        isTopContainer: {type: 'boolean', default: false},
        panelColor: {type: 'string', default: SXR.colors.surface},
        panelRounded: { type: 'number', default: 0.05 },

//global settings for GUI items
        styles: {
            fontFamily: {type: 'string', default: SXR.fonts.default},
            fontColor: {type: 'string', default: SXR.colors.onSurface},
            borderColor: {type: 'string', default: SXR.colors.border},
            backgroundColor: {type: 'string', default: SXR.colors.surface},
            hoverColor: {type: 'string', default: SXR.colors.secondary},
            activeColor: {type: 'string', default: SXR.colors.primary},
            handleColor: {type: 'string', default: SXR.colors.onSurface},
        }

    },
    init: function () {
        // one MutationObserver per component instance; appended children
        // trigger a debounced layout() instead of a full re-init
        if (!this._mutationObserver) {
            this._mutationObserver = onAppendChildToContainer(this.el, function (containerElement, addedNodes) {
                const flexContainer = containerElement.components['sxr-flex-container'];
                if (!flexContainer) { return; }
                const addedChildren = [];
                for (let i = 0; i < addedNodes.length; i++) {
                    if (addedNodes[i].nodeType === 1) { addedChildren.push(addedNodes[i]); }
                }
                if (!addedChildren.length) { return; }
                flexContainer._scheduleLayout(addedChildren);
            });
        }

        this.layout();
    },
    // coalesce bursts of appended children into a single re-layout
    _scheduleLayout: function (addedChildren) {
        const flexContainer = this;
        flexContainer._pendingChildren = (flexContainer._pendingChildren || []).concat(addedChildren);
        if (flexContainer._layoutScheduled) { return; }
        flexContainer._layoutScheduled = true;
        setTimeout(function () {
            flexContainer._layoutScheduled = false;
            const pending = flexContainer._pendingChildren || [];
            flexContainer._pendingChildren = [];
            let shouldLayout = false;
            pending.forEach(function (child) {
                if (child.hasLoaded) {
                    shouldLayout = true;
                } else {
                    child.addEventListener('loaded', function () { flexContainer.layout(); }, { once: true });
                }
            });
            if (shouldLayout) { flexContainer.layout(); }
        }, 0);
    },
    layout: function () {
        const containerGuiItem = this.el.getAttribute("sxr-item");

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

        // coordinate system is 0, 0 in the top left
        let cursorX = 0;
        let cursorY = 0;
        if (this.data.flexDirection === 'row') {
            // first figure out cursor position on main X axis
            if (this.data.justifyContent === 'flexStart') {
                cursorX = 0;
            } else if (this.data.justifyContent === 'center' || this.data.justifyContent === 'flexEnd') {
                let rowWidth = 0;
                for (let i = 0; i < this.children.length; i++) {
                    const childElement = this.children[i];
                    const childGuiItem = childElement.getAttribute("sxr-item");
                    if (!childGuiItem) { continue; }
                    rowWidth = rowWidth + childGuiItem.margin.w + childGuiItem.width + childGuiItem.margin.y;
                }
                if (this.data.justifyContent === 'center') {
                    cursorX = (containerGuiItem.width - rowWidth)*0.5;
                } else if (this.data.justifyContent === 'flexEnd') {
                    cursorX = containerGuiItem.width - rowWidth;
                }
            }
            // cross-axis (Y) alignment is applied per child in the layout loop below
        } else if (this.data.flexDirection === 'column') {
            // first figure out cursor position on main Y axis
            if (this.data.justifyContent === 'flexStart') {
                cursorY = 0;
            } else if (this.data.justifyContent === 'center' || this.data.justifyContent === 'flexEnd') {
                let columnHeight = 0;
                for (let i = 0; i < this.children.length; i++) {
                    const childElement = this.children[i];
                    const childGuiItem = childElement.getAttribute("sxr-item");
                    if (!childGuiItem) { continue; }
                    columnHeight = columnHeight + childGuiItem.margin.x + childGuiItem.height + childGuiItem.margin.z;
                }
                if (this.data.justifyContent === 'center') {
                    cursorY = (containerGuiItem.height - columnHeight)*0.5;
                } else if (this.data.justifyContent === 'flexEnd') {
                    cursorY = containerGuiItem.height - columnHeight;
                }
            }
            // cross-axis (X) alignment is applied per child in the layout loop below
        }

        // not that cursor positions are determined, loop through and lay out items
        for (let i = 0; i < this.children.length; i++) {
            const childElement = this.children[i];
            // TODO: change this to call gedWidth() and setWidth() of component
            let childPositionX = 0;
            let childPositionY = 0;
            const childPositionZ = 0.01;
            const childGuiItem = childElement.getAttribute("sxr-item");

            // now get object position in aframe container cordinates (0, 0 is center)
            if (childGuiItem) {
                applyInheritedStyles(childElement, childGuiItem, this.data.styles);

                if (this.data.flexDirection === 'row') {
                    if (this.data.alignItems === 'center') {
                        childPositionY = 0; // child position is always 0 for center vertical alignment
                    } else if (this.data.alignItems === 'flexStart') {
                        childPositionY = containerGuiItem.height * 0.5 - childGuiItem.margin.x - childGuiItem.height;
                    } else if (this.data.alignItems === 'flexEnd') {
                        childPositionY = -containerGuiItem.height * 0.5 + childGuiItem.margin.z + childGuiItem.height;
                    }
                    childPositionX = -containerGuiItem.width*0.5 + cursorX + childGuiItem.margin.w + childGuiItem.width * 0.5
                    cursorX = cursorX + childGuiItem.margin.w + childGuiItem.width + childGuiItem.margin.y;
                } else if (this.data.flexDirection === 'column') {
                    if (this.data.alignItems === 'center') {
                        childPositionX = 0; // child position is always 0 to center
                    } else if (this.data.alignItems === 'flexStart') {
                        childPositionX = -containerGuiItem.width*0.5 + childGuiItem.margin.w + childGuiItem.width * 0.5;
                    } else if (this.data.alignItems === 'flexEnd') {
                        childPositionX = containerGuiItem.width*0.5 - childGuiItem.margin.y - childGuiItem.width * 0.5;
                    }
                    childPositionY = containerGuiItem.height*0.5 - cursorY - childGuiItem.margin.x - childGuiItem.height * 0.5
                    cursorY = cursorY + childGuiItem.margin.x + childGuiItem.height + childGuiItem.margin.z;
                }
                childElement.setAttribute('position', `${childPositionX} ${childPositionY} ${childPositionZ}`)
                if (childGuiItem.type !== 'label') {
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
        if (this._mutationObserver) {
            this._mutationObserver.disconnect();
            this._mutationObserver = null;
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
            const guiItem = this.el.getAttribute("sxr-item");
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
        'font-family': 'sxr-flex-container.styles.fontFamily',
        'font-color': 'sxr-flex-container.styles.fontColor',
        'border-color': 'sxr-flex-container.styles.borderColor',
        'background-color': 'sxr-flex-container.styles.backgroundColor',
        'hover-color': 'sxr-flex-container.styles.hoverColor',
        'active-color': 'sxr-flex-container.styles.activeColor',
        'handle-color': 'sxr-flex-container.styles.handleColor',
    }
});
