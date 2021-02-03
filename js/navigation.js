import { HoverFilter } from './hoverfilter.js';
import { ScreenFilter } from './screenfilter.js';

/**
 * Navigation class which gives an animated effect.
 * Implemented and altered from Liam Egan's Tutorial here: 
 * https://tympanus.net/codrops/2019/04/24/how-to-build-an-underwater-style-navigation-using-pixijs/
 * 
 * @class Navigation
 */

export class Navigation {

    /**
     * The constructor. Initiates the navigation menu and binds listener methods here.
     * @constructor
     * @param {HTMLElement} nav 
     */
    constructor(nav){
        this.nav = nav;             

        this.navItems = [];         
        this.app = null;            // PIXI application
        this.container = null;      // PIXI container
        this.screenFilter = null;   // Filter applied to container 
        this.navWidth = null;       // Full nav width
        this.background = null;     
        this.pointerdown = false;   
        this.dragging = false;   
        this.targetMousePos = [0,0];

        this.init();

        window.addEventListener('pointermove', this.onPointerMove.bind(this), false);
        window.addEventListener('pointerdown', this.onPointerDown.bind(this), false);
        window.addEventListener('pointerup', this.onPointerUp.bind(this), false);
        window.addEventListener('resize', this.onResize.bind(this), false);
        window.addEventListener('navOpen', this.onOpen.bind(this), false);
        window.addEventListener('navClose', this.onClose.bind(this), false);
        window.requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * Adds each nav element to navItems list, 
     * creates nav items, and sets up pixi application.
     * @return null
     */
    init() {        
        const els = this.nav.querySelectorAll('a');  // select all 'a's and put them into the list
        els.forEach((el) => {
            this.navItems.push({
                rootElement: el,        // element itself
                title: el.innerText,    // text
                element: null,          // canvas rep
                sprite: null,           // pixi.sprite element
                link: el.href           // href
            });
        });

        this.makeNavItems();            // set up nav items
        this.setupWebGLContext();       // set up pixi
    }

    /**
     * Sets up navigation item elements and their event listeners.
     * @return null
     */
    makeNavItems() {

        this.navItems.forEach((navItem, i) => {
            navItem.element = this.makeNavItem(navItem.title, navItem.link); //create canvas navigation item
            
            navItem.sprite = PIXI.Sprite.from(navItem.element);
            navItem.sprite.interactive = true;
            navItem.sprite.buttonMode = true;

            const filter = new HoverFilter();

            navItem.rootElement.addEventListener('focus', () => {
                this.focusNavItemByIndex(i);
                navItem.sprite.filters = [filter];
            });
            navItem.rootElement.addEventListener('blur', () => {
                navItem.sprite.filters = [];
            });

            navItem.sprite.on('pointerover', (e) => {
                navItem.sprite.filters = [filter];
            })
            navItem.sprite.on('pointerout', (e) => {
                navItem.sprite.filters = [];
            })

            navItem.sprite.on('pointerup', (e) => {
                if (this.dragging) return;
                navItem.rootElement.click();
            });
        });
    }

    /**
     * Creates canvas nav element and returns it. 
     * @param {String} title 
     * @return {Canvas}
     */
    makeNavItem(title) {
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');

        const font = 'Fraunces';
        const fontSize = 80;

        ctx.font = `${fontSize}px ${font}`;
        c.width = ctx.measureText(title).width + 50;
        c.height = fontSize * 1.5;
        
        ctx.font = `${fontSize}px ${font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        //ctx.fillStyle = "rgba(88, 109, 166, 1)"; ////change color here
        ctx.fillStyle = "rgba(186, 191, 204, 1)"; ////change color here
        ctx.fillText(title, c.width * 0.5, c.height - fontSize * 0.2);

        return c;
    }

    /**
     * Initialize PIXI Appication
     * @return null
     */
    setupWebGLContext() {
        this.app = new PIXI.Application({
            backgroundColor: this.backgroundColor,
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: 2
        });

        this.app.stage.x = window.innerWidth / 2;
        this.app.stage.y = window.innerHeight / 2;

        this.container = new PIXI.Container();
        this.screenFilter = new ScreenFilter(2); //// might be toggle-able
        this.app.stage.filters = [this.screenFilter];

        let pos = 0;                                        // position for each element
        this.navWidth = 0;                                  // total width of navigation
        this.navItems.forEach((item) => {
            this.navWidth += item.sprite.width;
        });
        this.navItems.forEach((item) => {
            item.sprite.x = this.navWidth * -0.5 + pos;    // calculate position of nav element relatively
            pos += item.sprite.width;                      // update pos
            this.container.addChild(item.sprite);          // add sprite
        });

        this.background = new PIXI.Graphics();
        this.setupBackground();

        this.app.stage.addChild(this.background);
        this.app.stage.addChild(this.container);

        this.app.view.setAttribute('aria-hidden', 'true');
        this.app.view.setAttribute('tab-index', '-1');
        this.app.view.className = 'main-nav__canvas';
        this.nav.appendChild(this.app.view);
    }

    /**
     * Creates the movement of the menu, using a simulated mouse move.
     * @param {Number} idx 
     * @return null 
     */
    focusNavItemByIndex(idx) {
        let c = 0;
        this.navItems.forEach((item, i) => {
            let perWidth = item.element.width / this.navWidth;
            if (i < idx) {
                c += perWidth;
            } else if (i === idx) {
                c += perWidth / 2;
            }
        });

        let mousepos = [window.innerWidth * .1 + (window.innerWidth*.8) * c, window.innerHeight * .5];
        this.mousepos = mousepos;
    }


    /**
     * Draws the graphic and container mask.
     * @return null
     */
    setupBackground() {
        this.background.clear();
        this.background.beginFill(this.backgroundColor, 0.);
        this.background.position.x = window.innerWidth * -0.5;
        this.background.position.y = window.innerHeight * -0.5;
        this.background.drawRect(-this.maskpadding, -this.maskpadding, window.innerWidth+this.maskpadding, window.innerHeight+this.maskpadding);
        this.background.endFill();
    
        const mask = new PIXI.Graphics();
        mask.beginFill(this.backgroundColour, .5);
        mask.position.x = window.innerWidth * -.5;
        mask.position.y = window.innerHeight * -.5;
        mask.drawRect(-this.maskpadding,-this.maskpadding, window.innerWidth+this.maskpadding, window.innerHeight+this.maskpadding);
        mask.endFill();
        this.container.mask = mask;
    }

    /**
     * Changes the mousepos to a vector with value between 0 - 1
     * @param {Array} mousepos_px 
     * @return {Array}
     */
    fixMousePos(mousepos_px) {
        let ratio = window.innerHeight / window.innerWidth;
        let mousepos = [];
        if (window.innerHeight > window.innerWidth) {
            mousepos[0] = (mousepos_px[0] - window.innerWidth / 2) / window.innerWidth;
            mousepos[1] = (mousepos_px[1] - window.innerHeight / 2) / window.innerHeight * -1 * ratio;
        } else {
            mousepos[0] = (mousepos_px[0] - window.innerWidth / 2) / window.innerWidth / ratio;
            mousepos[1] = (mousepos_px[1] - window.innerHeight / 2) / window.innerHeight * -1;
        }
        return mousepos;
    }    

    /**
     * Does the reverse of fixMousePos
     * @param {Array} mousepos 
     * @return {Array}
     */
    unfixMousePos(mousepos) {
        let ratio = window.innerHeight / window.innerWidth;
        let mousepos_px = [];
        if(window.innerHeight > window.innerWidth) {
            mousepos_px[0] = mousepos[0] * window.innerWidth + (window.innerWidth / 2);
            mousepos_px[1] = mousepos[1] * window.innerHeight / -1 / ratio + (window.innerHeight / 2);
        } else {
          mousepos_px[0] = mousepos[0] * window.innerWidth * ratio + (window.innerWidth / 2);
          mousepos_px[1] = mousepos[1] * window.innerHeight / -1 + (window.innerHeight / 2);
        }
        
        return mousepos_px;
    }

    /**
     * Responds to window resize event. Resize stage and redraw bg.
     * @param {Object} e
     * @return null
     */
    onResize(e) {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.app.stage.x = window.innerWidth * .5;
        this.app.stage.y = window.innerHeight * .5;
        
        this.setupBackground();
    }
  
    /**
     * Responds to pointer move event. Updates the mousepos.
     * @param {Object} e
     * @return null
     */
    onPointerMove(e) {
        if (this.animatingPointer === true) {
            if (this.dragging || e.pointerType === 'mouse') {
              this.targetMousePos = [e.pageX, e.pageY];
            }
            return;
        }
        if (this.dragging || e.pointerType === 'mouse') {
            this.mousepos = [e.pageX, e.pageY];
        }
    }

    /**
     * Responds to pointer down event. Checks for timeout and if true, 
     * sets dragging to true.
     * @param {Object} e
     * @return null
     */
    onPointerDown(e) {
        this.pointerdown = true;
        setTimeout(()=> {
          if(this.pointerdown === true) this.dragging = true;
        }, 100); //// modify this value as needed. test it out
    }

    /**
     * Responds to pointer up event. Reverse of onPointerDown.
     * @param {Object} e
     * @return null
     */
    onPointerUp(e) {
        this.pointerdown = false;
        setTimeout(()=> {
            this.dragging = false;
        }, 100);
    }

    /**
     * Responds to custom navOpen event. 
     * @param {Object} e 
     * @return null
     */
    onOpen(e) {
        this.animatingPointer = true;
        this.focusNavItemByIndex(0);
        this.targetMousePos = this.unfixMousePos(this.mousepos);
        this.mousepos = [3000, window.innerHeight * 0.5]; //// might need to change this mousepos!
    }

    /**
     * Responds to custom navClose event. 
     * @param {Object} e 
     * @return null
     */
    onClose() {
        this.animatingPointer = false;
    }

    /**
     * Render animation. 
     * @param {Number} t
     * @return null
     */
    animate(t) {
        if (this.animatingPointer === true) {
            window.requestAnimationFrame(this.animate.bind(this));
        }

        const pxMousePos = this.unfixMousePos(this.mousepos);
        const diff = [this.targetMousePos[0] - pxMousePos[0], this.targetMousePos[1] - pxMousePos[1]];
        pxMousePos[0] += (diff[0]) * 0.05;
        pxMousePos[1] += (diff[1]) * 0.05;
        this.mousepos = pxMousePos;
    }

    /**
     * Getters and setters
     */

    set backgroundColour(value) {
        const colourval = /^#([0-9ABCDEF]{6,6})/i.exec(value);
        if (typeof(value) == 'string' && colourval != null) {
          this._backgroundColour = `0x${colourval[1]}`*1;
        } else if (typeof(value) == 'number') {
          this._backgroundColour = value;
        }
        
        this.setupBackground();
    }

    get backgroundColour() {
        return this._backgroundColour || 0xF9F9F9;
    }

    set animatingPointer(value) {
        const wasAnimating = this.animatingPointer;
        this._animating = value === true;
        if (wasAnimating === false && this.animatingPointer === true) {
            window.requestAnimationFrame(this.animate.bind(this));        }
    }

    get animatingPointer() {
        return this._animating || false;
    }

    set dragging(value) {
        if (value === true) {
            this.old_animatingPointer = this.animatingPointer;
            this.animatingPointer = false;
            this._dragging = true;
        } else {
            this._dragging = false;
        }
    }

    get dragging() {
        return this._dragging || false;
    }

    set mousepos(value) {
        const p = value[0] / window.innerWidth;
        this.container.position.x = -(this.navWidth * .5) + (1. - p) * this.navWidth;
        
        value = this.fixMousePos(value);
        if (value instanceof Array && value.length === 2 && !isNaN(value[0]) && !isNaN(value[1])) {
          this._mousepos = value;
          if (this.screenFilter) this.screenFilter.mousepos = value;
        }
    }

    get mousepos() {
        return this._mousepos || [0,0];
    }

    set maskpadding(value) {
        if(!isNaN(value)) this._maskpadding = value;
    }

    get maskpadding() {
        if(!isNaN(this._maskpadding)) return this._maskpadding;
        return 100;
    }
}