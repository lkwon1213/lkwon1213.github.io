import { Navigation } from './navigation.js';

export class Nav {
    constructor() {

        //this.bg = new BG();
        //window.requestAnimationFrame(this.animate.bind(this));

        this.navToggle = document.getElementById('main-nav-toggle');
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        this.navToggle.addEventListener('change', this.onNavChange.bind(this), false);

        WebFont.load({
            google: {
                families: ['Fraunces']
            },
            fontactive: () => {
                this.nav = new Navigation(document.querySelector('.main-nav'));
                window.navigation = this.nav;

                var event = document.createEvent('HTMLEvents');
                event.initEvent('change', true, false);
                this.navToggle.dispatchEvent(event);
            }
        });
    }
    /*
    resize() {
        this.bg.resize()
    }
    
    animate(t) {
        this.bg.animate(t);
    }
    */
    onKeyUp(e) {
        if (e.target.className.indexOf('nav-toggle') && (e.keyCode === 13 || e.keyCode === 32)) {
            this.navToggle.checked = !this.navToggle.checked;
            e.preventDefault();
        }
    }

    onNavChange(e) {
        let eventName;
        if (e.target.checked) {
            eventName = 'navOpen';
        } else {
            eventName = 'navClose';
        }

        if (window.CustomEvent) {
            var event = new CustomEvent(eventName);
            event.initCustomEvent(eventName, true, true);
        }
        window.dispatchEvent(event);
    }
}