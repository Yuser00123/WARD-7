W7.audio = (function () {
    'use strict';

    var ctx = null;
    var master = null;
    var buses = {};
    var muted = null;
    var ambSource = null;
    var ambGain = null;
    var ambName = '';
    var droneNodes = null;
    var heartTimer = null;
    var heartRate = 0;

    function init() {
        if (ctx) {return ctx;}
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {return null;}
        ctx = new AudioContextClass();
        master = ctx.createGain();
        master.gain.value = 0.9;
        master.connect(ctx.destination);

        ['amb', 'sfx', 'heart', 'music', 'voice'].forEach(function (name) {
            var gain = ctx.createGain();
            gain.gain.value = 1;
            gain.connect(master);
            buses[name] = gain;
        });

        buildDrone();
        return ctx;
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    function ready() {
        return !!ctx;
    }

    function now() {
        return ctx ? ctx.currentTime : 0;
    }

    function makePan(amount) {
        if (ctx.createStereoPanner) {
            var panner = ctx.createStereoPanner();
            panner.pan.value = Math.max(-1, Math.min(1, amount || 0));
            return panner;
        }
        return null;
    }

    function chain(node, busName, panAmount) {
        var panner = makePan(panAmount);
        if (panner) {
            node.connect(panner);
            panner.connect(buses[busName] || master);
        } else {
            node.connect(buses[busName] || master);
        }
    }

    function tone(frequency, duration, options) {
        if (!ctx) {return null;}
        options = options || {};
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = options.type || 'sine';
        osc.frequency.setValueAtTime(frequency, now());

        if (options.slideTo) {
            osc.frequency.exponentialRampToValueAtTime(options.slideTo, now() + duration);
        }

        var peak = options.volume === undefined ? 0.2 : options.volume;
        gain.gain.setValueAtTime(0.0001, now());
        gain.gain.exponentialRampToValueAtTime(peak, now() + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now() + duration);

        osc.connect(gain);
        chain(gain, options.bus || 'sfx', options.pan);

        osc.start();
        osc.stop(now() + duration + 0.02);
    }
});