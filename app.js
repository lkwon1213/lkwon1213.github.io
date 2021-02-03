import {Mouse} from './js/mouse.js';
import {Nav} from './js/nav.js';

class App {
    constructor() {
        //this.resize();
        //window.addEventListener('click', this.onClick.bind(this), false);
        //https://github.com/GeorgeHastings/emblem

        var RotatingCircle = {
            init: function(el, str) {
                var element = document.querySelector(el);
                var text = str ? str : element.innerHTML;
                element.innerHTML = '';
                for (var i = 0; i < text.length; i++) {
                    var letter = text[i];
                    var span = document.createElement('span');
                    var node = document.createTextNode(letter);
                    var r = (360/text.length)*(i);
                    var x = (Math.PI/text.length).toFixed(0) * (i);
                    var y = (Math.PI/text.length).toFixed(0) * (i);
                    span.appendChild(node);
                    span.style.webkitTransform = 'rotateZ('+r+'deg) translate3d('+x+'px,'+y+'px,0)';
                    span.style.transform = 'rotateZ('+r+'deg) translate3d('+x+'px,'+y+'px,0)';
                    element.appendChild(span);
                }
            }
        };
        
        RotatingCircle.init('.circular');

        new Mouse();
        new Nav();
    }

    onClick(){
        
    }

    resize() {
        
    }
}

window.onload = () => {
    new App();
}