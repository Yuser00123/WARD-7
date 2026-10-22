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
    function lerp(from, to, amount) {
        return from + (to - from) * amount;
    }
    function rand(low, high) {
        return low + Math.random() * (high - low);
    }
    function randInt(low, high) {
        return Math.floor(rand(low, high+1));
    }
    function pick(list) {
        return list[Maths.floor(Math.random() * list.length)];
    }
    function chance(probability) {
        return Math.random() < probability;
    }

    function now() {
        return (window.performance && performance.now) ? performance.now() : Date.now();
    }

    function wait(milliseconds) {
        return new Promise(function (resolve) {
            setTimeout(resolve, milliseconds);
        });
    }

    function tween(from, to, duration, onUpdate, onDone) {
        var start = now();
        var cancelled = false;
        function step() {
            if (cancelled) {return;}
            var t = clamp((now() - start) / duration, 0, 1);
            var eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            onUpdate(lerp(from, to, eased), eased);
            if (t < 1) {
                requestAnimationFrame(step);
            } else if (onDone) {
                onDone();
            }
        }

        requestAnimationFrame(step);
        return function cancel() {cancelled = true;};
    }

    function clock(minutes) {
        var total = 180 + minutes;
        var hour = Math.floor(total / 60) % 24;
        var minute = Math.floor(total % 60);
        var suffix = hour < 12 ? 'AM' : 'PM';
        var display = hour % 12;
        if (display === 0) {display = 12;}
        return display + ':' + (minute < 10 ? '0' : '') + minute + ' ' + suffix;
    }

    function escapeHtml(text) {
        return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    return {
        $: $, $$: $$, el: el, clear: clear,
        clamp: clamp, lerp: lerp, 
        rand: rand, randInt: randInt, pick: pick, chance: chance,
        now: now, wait: wait, tween: tween,
        clock: clock, escapeHtml: escapeHtml
    };
})();