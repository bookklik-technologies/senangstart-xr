'use strict';

AFRAME.registerComponent('sxr-cursor', {
    dependencies: ['cursor', 'raycaster'],
    schema: {
        color: {type: 'string', default: SXR.colors.onSurface},
        hoverColor: {type: 'string', default: SXR.colors.secondary},
        activeColor: {type: 'string', default: SXR.colors.primary},
        distance: {type: 'number', default: -1},
        design: {type: 'string', default: 'dot'},
    },
    init: function () {
        const cursor = this.cursor = this.el.getAttribute('cursor');
        const fuse = this.fuse = cursor.fuse; // true if cursor fuse is enabled.
        const fuseTimeout = cursor.fuseTimeout; // animation lenght should be based on this value

        const el = this.el;
        const data = this.data;
        const component = this;
        const defaultHoverAnimationDuration = 200;
        const fuseAnimationDuration = Math.max(0, fuseTimeout - defaultHoverAnimationDuration);

        // the fuse loader is an appended child whose animation component may
        // not be initialized yet; walk the chain defensively
        const getFuseAnimation = function () {
            const fuseLoader = component.fuseLoader;
            if (!fuseLoader || !fuseLoader.object3D || !fuseLoader.object3D.el) { return null; }
            const animationComponent = fuseLoader.object3D.el.components && fuseLoader.object3D.el.components.animation;
            return (animationComponent && animationComponent.animation) ? animationComponent.animation : null;
        };
        const pauseFuseAnimation = function () {
            const animation = getFuseAnimation();
            if (animation) {
                animation.pause();
                animation.seek(0);
            }
        };

        if(data.design === 'dot'){    

            el.setAttribute('geometry', 'primitive: ring; radiusInner:0.000001; radiusOuter:0.025');
            el.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            el.setAttribute('position', `0 0 ${data.distance}`);
            el.setAttribute('animation__radiusInnerIn', `property: geometry.radiusInner; from: 0.000001; to:0.0225; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            el.setAttribute('animation__radiusOuterIn', `property: geometry.radiusOuter; from: 0.025; to:0.0275; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            el.setAttribute('animation__colorIn', `property: material.color; from: ${data.color}; to:${data.hoverColor}; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            el.setAttribute('animation__radiusInnerOut', `property: geometry.radiusInner; from: 0.0225; to:0.000001; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.setAttribute('animation__radiusOuterOut', `property: geometry.radiusOuter; from: 0.0275; to:0.025; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.setAttribute('animation__colorOut', `property: material.color; from: ${data.hoverColor}; to:${data.color}; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.setAttribute('animation__scale', `property: scale; from: 1 1 1; to:1.25 1.25 1.25; dur:200; easing:easeInQuad; startEvents: click`);

            const cursorShadow = document.createElement("a-entity");
            cursorShadow.setAttribute('geometry', 'primitive: ring; radiusInner:0.0275; radiusOuter:0.03; thetaLength:360');
            cursorShadow.setAttribute('material', 'color: #000000; shader: flat; opacity:0.25;');
            cursorShadow.setAttribute('position', '0 0 0');
            cursorShadow.setAttribute('animation__radiusInnerIn', `property: geometry.radiusInner; from: 0.0275; to:0.03; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorShadow.setAttribute('animation__radiusOuterIn', `property: geometry.radiusOuter; from: 0.03; to:0.0325; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorShadow.setAttribute('animation__radiusInnerOut', `property: geometry.radiusInner; from: 0.03; to:0.0275; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            cursorShadow.setAttribute('animation__radiusOuterOut', `property: geometry.radiusOuter; from: 0.0325; to:0.03; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.appendChild(cursorShadow);
            this.cursorShadow = cursorShadow;

            if(fuse){
                const fuseLoader = document.createElement("a-entity");
                fuseLoader.setAttribute('geometry', 'primitive: ring; radiusInner:0.03; radiusOuter:0.0375; thetaLength:0');
                fuseLoader.setAttribute('material', `color: ${data.activeColor}; shader: flat; opacity:1;`);
                fuseLoader.setAttribute('position', `0 0 0`);
                fuseLoader.setAttribute('animation', `property: geometry.thetaLength; from: 0; to:360; dur:${fuseAnimationDuration}; delay: ${defaultHoverAnimationDuration}; easing:linear; autoplay:false;`);
                el.appendChild(fuseLoader);
                this.fuseLoader = fuseLoader;
            }
            //end dot design

        }else if(data.design === 'ring'){    
            el.setAttribute('geometry', 'primitive: ring; radiusInner:0.0225; radiusOuter:0.0275');
            el.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            el.setAttribute('position', `0 0 ${data.distance}`);
            el.setAttribute('animation__radiusInnerIn', `property: geometry.radiusInner; from: 0.0225; to:0.025; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            el.setAttribute('animation__radiusOuterIn', `property: geometry.radiusOuter; from: 0.0275; to:0.0325; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            el.setAttribute('animation__colorIn', `property: material.color; from: ${data.color}; to:${data.hoverColor}; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            el.setAttribute('animation__radiusInnerOut', `property: geometry.radiusInner; from: 0.025; to:0.0225; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.setAttribute('animation__radiusOuterOut', `property: geometry.radiusOuter; from: 0.0325; to:0.0275; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.setAttribute('animation__colorOut', `property: material.color; from: ${data.hoverColor}; to:${data.color}; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.setAttribute('animation__scale', `property: scale; from: 1 1 1; to:1.25 1.25 1.25; dur:200; easing:easeInQuad; startEvents: click`);

            const cursorShadow = document.createElement("a-entity");
            cursorShadow.setAttribute('geometry', 'primitive: ring; radiusInner:0.03; radiusOuter:0.0325; thetaLength:360');
            cursorShadow.setAttribute('material', 'color: #000000; shader: flat; opacity:0.25;');
            cursorShadow.setAttribute('position', '0 0 0');
            cursorShadow.setAttribute('animation__radiusInnerIn', `property: geometry.radiusInner; from: 0.03; to:0.0325; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorShadow.setAttribute('animation__radiusOuterIn', `property: geometry.radiusOuter; from: 0.0325; to:0.0375; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorShadow.setAttribute('animation__radiusInnerOut', `property: geometry.radiusInner; from: 0.0325; to:0.03; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            cursorShadow.setAttribute('animation__radiusOuterOut', `property: geometry.radiusOuter; from: 0.0375; to:0.0325; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.appendChild(cursorShadow);
            this.cursorShadow = cursorShadow;

            if(fuse){
                const fuseLoader = document.createElement("a-entity");
                fuseLoader.setAttribute('geometry', 'primitive: ring; radiusInner:0.035; radiusOuter:0.0425; thetaLength:0');
                fuseLoader.setAttribute('material', `color: ${data.activeColor}; shader: flat; opacity:1;`);
                fuseLoader.setAttribute('position', `0 0 0`);
                fuseLoader.setAttribute('animation', `property: geometry.thetaLength; from: 0; to:360; dur:${fuseAnimationDuration}; delay: ${defaultHoverAnimationDuration}; easing:linear; autoplay:false;`);
                el.appendChild(fuseLoader);
                this.fuseLoader = fuseLoader;
            }
            //end ring design

        }else if(data.design === 'reticle'){    
            el.setAttribute('geometry', 'primitive: ring; radiusInner:0.000001; radiusOuter:0.0125; thetaLength:180;');
            el.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            el.setAttribute('position', `0 0 ${data.distance}`);
            el.setAttribute('animation__opacityIn', `property: material.opacity; from: 1; to: 0; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            el.setAttribute('animation__opacityOut', `property: material.opacity; from: 0; to: 1; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);

            const cursorCenter = document.createElement("a-entity");
            cursorCenter.setAttribute('geometry', 'primitive: ring; radiusInner:0.000001; radiusOuter:0.0125; thetaLength:180; thetaStart:180;');
            cursorCenter.setAttribute('material', 'color: #000000; shader: flat; opacity:0.25;');
            cursorCenter.setAttribute('position', '0 0 0');
            cursorCenter.setAttribute('animation__opacityIn', `property: material.opacity; from: 0.25; to: 0; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorCenter.setAttribute('animation__opacityOut', `property: material.opacity; from: 0; to: 0.25; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.appendChild(cursorCenter);
            this.cursorCenter = cursorCenter;

            const cursorShadow = document.createElement("a-entity");
            cursorShadow.setAttribute('geometry', 'primitive: ring; radiusInner:0.0125; radiusOuter:0.0145');
            cursorShadow.setAttribute('material', 'color: #000000; shader: flat; opacity:0.25;');
            cursorShadow.setAttribute('position', '0 0 0');
            cursorShadow.setAttribute('animation__colorIn', `property: material.color; from: #000000; to: ${data.color}; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorShadow.setAttribute('animation__opacityIn', `property: material.opacity; from: 0.25; to: 1; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorShadow.setAttribute('animation__colorOut', `property: material.color; from: ${data.color}; to: #000000; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            cursorShadow.setAttribute('animation__opacityOut', `property: material.opacity; from: 1; to: 0.25; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.appendChild(cursorShadow);
            this.cursorShadow = cursorShadow;

            const cursorShadowTL = document.createElement("a-entity");
            cursorShadowTL.setAttribute('geometry', 'primitive: plane; width:0.005; height:0.005;');
            cursorShadowTL.setAttribute('material', 'color: #000000; shader: flat; opacity:0.25;');
            cursorShadowTL.setAttribute('position', '-0.0325 0.0325 0');
            el.appendChild(cursorShadowTL);
            this.cursorShadowTL = cursorShadowTL;
            const cursorShadowBL = document.createElement("a-entity");
            cursorShadowBL.setAttribute('geometry', 'primitive: plane; width:0.005; height:0.005;');
            cursorShadowBL.setAttribute('material', 'color: #000000; shader: flat; opacity:0.25;');
            cursorShadowBL.setAttribute('position', '-0.0325 -0.0325 0');
            el.appendChild(cursorShadowBL);
            this.cursorShadowBL = cursorShadowBL;
            const cursorShadowTR = document.createElement("a-entity");
            cursorShadowTR.setAttribute('geometry', 'primitive: plane; width:0.005; height:0.005;');
            cursorShadowTR.setAttribute('material', 'color: #000000; shader: flat; opacity:0.25;');
            cursorShadowTR.setAttribute('position', '0.0325 0.0325 0');
            el.appendChild(cursorShadowTR);
            this.cursorShadowTR = cursorShadowTR;
            const cursorShadowBR = document.createElement("a-entity");
            cursorShadowBR.setAttribute('geometry', 'primitive: plane; width:0.005; height:0.005;');
            cursorShadowBR.setAttribute('material', 'color: #000000; shader: flat; opacity:0.25;');
            cursorShadowBR.setAttribute('position', '0.0325 -0.0325 0');
            el.appendChild(cursorShadowBR);
            this.cursorShadowBR = cursorShadowBR;

            const cursorBoundTL = document.createElement("a-entity");
            cursorBoundTL.setAttribute('geometry', 'primitive: plane; width:0.015; height:0.0035;');
            cursorBoundTL.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorBoundTL.setAttribute('position', '-0.03 0.0375 0');
            el.appendChild(cursorBoundTL);
            this.cursorBoundTL = cursorBoundTL;
            const cursorBoundTL2 = document.createElement("a-entity");
            cursorBoundTL2.setAttribute('geometry', 'primitive: plane; width:0.0035; height:0.015;');
            cursorBoundTL2.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorBoundTL2.setAttribute('position', '-0.0375 0.03 0');
            el.appendChild(cursorBoundTL2);
            this.cursorBoundTL2 = cursorBoundTL2;

            const cursorBoundTR = document.createElement("a-entity");
            cursorBoundTR.setAttribute('geometry', 'primitive: plane; width:0.015; height:0.0035;');
            cursorBoundTR.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorBoundTR.setAttribute('position', '0.03 0.0375 0');
            el.appendChild(cursorBoundTR);
            this.cursorBoundTR = cursorBoundTR;
            const cursorBoundTR2 = document.createElement("a-entity");
            cursorBoundTR2.setAttribute('geometry', 'primitive: plane; width:0.0035; height:0.015;');
            cursorBoundTR2.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorBoundTR2.setAttribute('position', '0.0375 0.03 0');
            el.appendChild(cursorBoundTR2);
            this.cursorBoundTR2 = cursorBoundTR2;

            const cursorBoundBL = document.createElement("a-entity");
            cursorBoundBL.setAttribute('geometry', 'primitive: plane; width:0.015; height:0.0035;');
            cursorBoundBL.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorBoundBL.setAttribute('position', '-0.03 -0.0375 0');
            el.appendChild(cursorBoundBL);
            this.cursorBoundBL = cursorBoundBL;
            const cursorBoundBL2 = document.createElement("a-entity");
            cursorBoundBL2.setAttribute('geometry', 'primitive: plane; width:0.0035; height:0.015;');
            cursorBoundBL2.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorBoundBL2.setAttribute('position', '-0.0375 -0.03 0');
            el.appendChild(cursorBoundBL2);
            this.cursorBoundBL2 = cursorBoundBL2;

            const cursorBoundBR = document.createElement("a-entity");
            cursorBoundBR.setAttribute('geometry', 'primitive: plane; width:0.015; height:0.0035;');
            cursorBoundBR.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorBoundBR.setAttribute('position', '0.03 -0.0375 0');
            el.appendChild(cursorBoundBR);
            this.cursorBoundBR = cursorBoundBR;
            const cursorBoundBR2 = document.createElement("a-entity");
            cursorBoundBR2.setAttribute('geometry', 'primitive: plane; width:0.0035; height:0.015;');
            cursorBoundBR2.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorBoundBR2.setAttribute('position', '0.0375 -0.03 0');
            el.appendChild(cursorBoundBR2);
            this.cursorBoundBR2 = cursorBoundBR2;

            if(fuse){
                const fuseLoader = document.createElement("a-entity");
                fuseLoader.setAttribute('geometry', 'primitive: plane; width:0.000001; height:0.01;');
                fuseLoader.setAttribute('material', `color: ${data.activeColor}; shader: flat; opacity:1;`);
                fuseLoader.setAttribute('position', '0 -0.05 0');
                fuseLoader.setAttribute('animation', `property: geometry.width; from: 0; to: 0.075; dur:${fuseAnimationDuration}; delay:${defaultHoverAnimationDuration}; easing:linear; autoplay:false;`);
                el.appendChild(fuseLoader);
                this.fuseLoader = fuseLoader;
            }
            //end reticle design

        }else if(data.design === 'cross'){    
            el.setAttribute('geometry', 'primitive: ring; radiusInner:0.035; radiusOuter:0.0375');
            el.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            el.setAttribute('position', `0 0 ${data.distance}`);
            el.setAttribute('animation__radiusInnerIn', `property: geometry.radiusInner; from: 0.035; to: 0.0315; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: hovergui`);
            el.setAttribute('animation__radiusInnerOut', `property: geometry.radiusInner; from: 0.0315; to: 0.035; dur:${defaultHoverAnimationDuration}; easing:linear; startEvents: leavegui`);

            const cursorShadow = document.createElement("a-entity");
            cursorShadow.setAttribute('geometry', 'primitive: ring; radiusInner:0.0375; radiusOuter:0.04; thetaLength:360');
            cursorShadow.setAttribute('material', 'color: #000000; shader: flat; opacity:0.25;');
            cursorShadow.setAttribute('position', '0 0 0');
            el.appendChild(cursorShadow);
            this.cursorShadow = cursorShadow;

            const cursorVerticalTop = document.createElement("a-entity");
            cursorVerticalTop.setAttribute('geometry', 'primitive: plane; width:0.0035; height:0.01875');
            cursorVerticalTop.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorVerticalTop.setAttribute('position', '0 0.028125 0');
            cursorVerticalTop.setAttribute('animation__widthIn', `property: geometry.width; from: 0.0035; to: 0.007; dur:${fuseAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorVerticalTop.setAttribute('animation__widthOut', `property: geometry.width; from: 0.007; to: 0.0035; dur:${fuseAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.appendChild(cursorVerticalTop);
            this.cursorVerticalTop = cursorVerticalTop;

            const cursorVerticalBottom = document.createElement("a-entity");
            cursorVerticalBottom.setAttribute('geometry', 'primitive: plane; width:0.0035; height:0.01875');
            cursorVerticalBottom.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorVerticalBottom.setAttribute('position', '0 -0.028125 0');
            cursorVerticalBottom.setAttribute('animation__widthIn', `property: geometry.width; from: 0.0035; to: 0.007; dur:${fuseAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorVerticalBottom.setAttribute('animation__widthOut', `property: geometry.width; from: 0.007; to: 0.0035; dur:${fuseAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.appendChild(cursorVerticalBottom);
            this.cursorVerticalBottom = cursorVerticalBottom;

            const cursorHorizontalLeft = document.createElement("a-entity");
            cursorHorizontalLeft.setAttribute('geometry', 'primitive: plane; width:0.01875; height:0.0035');
            cursorHorizontalLeft.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorHorizontalLeft.setAttribute('position', '-0.028125 0 0');
            cursorHorizontalLeft.setAttribute('animation__heightIn', `property: geometry.height; from: 0.0035; to: 0.007; dur:${fuseAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorHorizontalLeft.setAttribute('animation__heightOut', `property: geometry.height; from: 0.007; to: 0.0035; dur:${fuseAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.appendChild(cursorHorizontalLeft);
            this.cursorHorizontalLeft = cursorHorizontalLeft;

            const cursorHorizontalRight = document.createElement("a-entity");
            cursorHorizontalRight.setAttribute('geometry', 'primitive: plane; width:0.01875; height:0.0035');
            cursorHorizontalRight.setAttribute('material', `color: ${data.color}; shader: flat; opacity:1;`);
            cursorHorizontalRight.setAttribute('position', '0.028125 0 0');
            cursorHorizontalRight.setAttribute('animation__heightIn', `property: geometry.height; from: 0.0035; to: 0.007; dur:${fuseAnimationDuration}; easing:linear; startEvents: hovergui`);
            cursorHorizontalRight.setAttribute('animation__heightOut', `property: geometry.height; from: 0.007; to: 0.0035; dur:${fuseAnimationDuration}; easing:linear; startEvents: leavegui`);
            el.appendChild(cursorHorizontalRight);
            this.cursorHorizontalRight = cursorHorizontalRight;

            if(fuse){
                const fuseLoader = document.createElement("a-entity");
                fuseLoader.setAttribute('geometry', 'primitive: ring; radiusInner:0.0415; radiusOuter:0.0485; thetaLength:0');
                fuseLoader.setAttribute('material', `color: ${data.activeColor}; shader: flat; opacity:1;`);
                fuseLoader.setAttribute('position', `0 0 0`);
                fuseLoader.setAttribute('animation', `property: geometry.thetaLength; from: 0; to: 360; dur:${fuseAnimationDuration}; delay:${defaultHoverAnimationDuration}; easing:linear; autoplay:false;`);
                el.appendChild(fuseLoader);
                this.fuseLoader = fuseLoader;
            }
            //end cross design        
        }

        this._onMouseEnter = function () {
            el.emit('hovergui');
            if (data.design === 'dot' || data.design === 'ring') {
                component.cursorShadow.emit('hovergui');
            }else if (data.design === 'cross') {
                component.cursorShadow.emit('hovergui');
                component.cursorVerticalTop.emit('hovergui');
                component.cursorVerticalBottom.emit('hovergui');
                component.cursorHorizontalLeft.emit('hovergui');
                component.cursorHorizontalRight.emit('hovergui');
            }else if (data.design === 'reticle') {
                component.cursorCenter.emit('hovergui');
                component.cursorShadow.emit('hovergui');
            }

        };

        el.addEventListener('mouseenter', this._onMouseEnter);

        this._onMouseLeave = function () {
            el.emit('leavegui');
            if (data.design === 'dot' || data.design === 'ring') {
                component.cursorShadow.emit('leavegui');
            }else if (data.design === 'cross') {
                component.cursorShadow.emit('leavegui');
                component.cursorVerticalTop.emit('leavegui');
                component.cursorVerticalBottom.emit('leavegui');
                component.cursorHorizontalLeft.emit('leavegui');
                component.cursorHorizontalRight.emit('leavegui');
            }else if (data.design === 'reticle') {
                component.cursorCenter.emit('leavegui');
                component.cursorShadow.emit('leavegui');
            }

            if(fuse){
                pauseFuseAnimation();
            }

            el.setAttribute('scale', '1 1 1');
        };

        el.addEventListener('mouseleave', this._onMouseLeave);

        if(fuse){
            this._onFusing = function () {
                const animation = getFuseAnimation();
                if (animation) { animation.play(); }
            };
            el.addEventListener('fusing', this._onFusing);
        }

        this._onStateRemoved = function (evt) {
            if (evt.detail.state === 'cursor-fusing' || evt.detail === 'cursor-fusing') {
                if(data.design === 'dot' || data.design === 'ring' || data.design === 'cross' ){  
                    if(fuse){
                        pauseFuseAnimation();
                        AFRAME.utils.entity.setComponentProperty(component.fuseLoader, 'geometry.thetaLength', '0');
                    }
                }else if(data.design === 'reticle'){
                    if(fuse){
                        pauseFuseAnimation();
                        AFRAME.utils.entity.setComponentProperty(component.fuseLoader, 'geometry.width', '0.000001');
                    }                    
                }
            }else if(evt.detail.state === 'cursor-hovering' || evt.detail === 'cursor-hovering') {
                if(data.design === 'dot' || data.design === 'ring' ){  
                    AFRAME.utils.entity.setComponentProperty(this, 'scale', '1 1 1');
                    if(fuse){
                        AFRAME.utils.entity.setComponentProperty(component.fuseLoader, 'geometry.thetaLength', '0');
                    }
                }else if(data.design === 'cross' ){  
                    if(fuse){
                        AFRAME.utils.entity.setComponentProperty(component.fuseLoader, 'geometry.thetaLength', '0');
                    }
                }else if(data.design === 'reticle' ){  
                    if(fuse){
                        AFRAME.utils.entity.setComponentProperty(component.fuseLoader, 'geometry.width', '0.000001');
                    }
                }
            }
        };

        el.addEventListener("stateremoved", this._onStateRemoved);


    },
    remove: function () {
        const el = this.el;
        el.removeEventListener('mouseenter', this._onMouseEnter);
        el.removeEventListener('mouseleave', this._onMouseLeave);
        el.removeEventListener('stateremoved', this._onStateRemoved);
        if (this._onFusing) {
            el.removeEventListener('fusing', this._onFusing);
        }
        // dispose the component-owned child entities
        const self = this;
        ['cursorShadow', 'cursorCenter', 'fuseLoader', 'cursorVerticalTop', 'cursorVerticalBottom',
         'cursorHorizontalLeft', 'cursorHorizontalRight', 'cursorShadowTL', 'cursorShadowBL',
         'cursorShadowTR', 'cursorShadowBR', 'cursorBoundTL', 'cursorBoundTL2', 'cursorBoundTR',
         'cursorBoundTR2', 'cursorBoundBL', 'cursorBoundBL2', 'cursorBoundBR', 'cursorBoundBR2'
        ].forEach(function (key) {
            if (self[key]) {
                SXR.removeEntity(self[key]);
                self[key] = null;
            }
        });
    },
});

AFRAME.registerPrimitive( 'a-sxr-cursor', {
    defaultComponents: {
        'cursor': {},
        // scoped raycaster: only sxr-interactable entities are tested,
        // keeping raycasts cheap in widget-heavy scenes. Scene authors can
        // still override via a raycaster attribute on the element.
        'raycaster': {objects: '[sxr-interactable]', interval: 100},
        'sxr-cursor': { }
    },
    mappings: {
        'fuse': 'cursor.fuse',
        'fuse-timeout': 'cursor.fuseTimeout',
        'color': 'sxr-cursor.color',
        'hover-color': 'sxr-cursor.hoverColor',
        'active-color': 'sxr-cursor.activeColor',
        'distance': 'sxr-cursor.distance',
        'design': 'sxr-cursor.design'
    }
});
