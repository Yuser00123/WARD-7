window.W7 = window.W7 || {};

W7.util = (function() {
    'use strict';

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $$(selector, root) {
        return Array.prototype.slice.call((root || documnet).querySelectorAll(selector));
    }

    function el(tag, props, children) {
        var node = document.createElement(tag);
        if (props) {
            Object.keys(props).forEach(function(key) {
                var value = props[key];
                if (key === 'class') {
                    node.className = value;
                } else if (key === 'text') {
                    node.textContent = value;
                } else if (key === 'html') {
                    node.innerHTML = value;
                } else if (key.slice(0, 2) === 'on' && typeof value === 'function') {
                    node.addEventListener(key.slice(2).toLowerCase(), value);
                } else {
                    node.setAttribute(key, value);
                }
            });
        }

        (children || []).forEach(function(child) {
            if (typeof child === 'string') {
                node.appendChild(document.createTextNode(child));
            } else {
                node.appendChild(child);
            }
        });

        return node;
    }

    function clear(node) {
        while (node && node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    function clamp(value, low, high) {
        return value < low ? low : (value > high ? high : value);
    }    
});