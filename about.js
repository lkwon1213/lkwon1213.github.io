import {Mouse} from './js/mouse.js';
import {Nav} from './js/nav.js';


class Work {
    constructor() {
        new Mouse();
        new Nav();
    }

    onClick(){
        
    }

    resize() {
        
    }
}

window.onload = () => {
    new Work();
}