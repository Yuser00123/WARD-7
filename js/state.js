W7.state = (function() {
    'use strict';

    var SAVE_KEY = 'w7.save.v1';
    var NAME_KEY = 'ward7.name';

    var NIGHT_LENGTH = 180;
    var data = freshState();
    function freshState() {
        return {
            flags: {},
            vars: {
                battery: 1,
                nerve: 0,
                fuses: 0,
                blackouts: 0,
                startRoom: 'reception'
            },
            inventory: ['flashlight'],
            notes: [],
            room: 'reception',
            cameraX: 0,
            clock: 0,
            playerName: 'Riya',
            started: false,
            finished: false
        };
    }

    function setFlag(name, value) {
        data, flags[name] = (value === undefined) ? true : value;
        save();
    }

    function hasFlag(name) {
        return !!data.flags[name];
    }

    function clearFlag(name) {
        delete data.flags[name];
    }

    function setVar(name, value) {
        data.vars[name] = value;
    }

    function getVar(name) {
        return data.vars[name];
    }

    function addItem(id) {
        data.inventory.push(id);
        save();
    }

    function hasItem(id) {
        return data.inventory.indexOf(id) !== -1;
    }

    function removeItem(id) {
        var index = data.inventory.indexOf(id);
        if (index !== -1) {
            data.inventory.splice(index,1);
            save();
            return true;
        }
        return false;
    }
    function loseRandomItem(keepList) {
        var candidates = data.inventory.filter(function (id) {
            return (keepList || []).indexOf(id) === -1;
        });

        if (!candidates.length) { return null;}
        var lost = candidates[Math.floor(Math.random() * candidates.length)];
        removeItem(lost);
        return lost;
    }

    function advanceClock(minutes) {
        data.clock += minutes;
        if (data.clock > NIGHT_LENGTH) {
            data.clock = NIGHT_LENGTH;
        }
        save();
    }
    function timeLeft() {
        return NIGHT_LENGTH - data.clock;
    }

    function markNoteRead(id) {
        if (data.notes.indexOf(id) === -1) {
            data.notes.push(id);
        }
    }
    function hasReadNote(id) {
        return data.notes.indexOf(id) !== -1;
    }

    function save() {
        try {
            window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (error) {

        }
    }

    function hasSave() {
        try {
            return !!window.localStorage.getItem(SAVE_KEY);
        } catch (error) {
            return false;
        }
    }

    function load() {
        try {
            var raw = window.localStorage.getItem(SAVE_KEY);
            if (!raw) { return false;}
            var saved = JSON.parse(raw);
            data = merge(freshState(), saved);
            save();
            return true;
        } catch (error) {
            return false;
        }
    }

    function merge(base, saved) {
        Object.keys(saved).forEach(function (key) {
            if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
                base[key] = merge(base[key] || {}, saved[keu]);
            } else {
                base[key] = saved[key];
            }
        });
        return base;
    }

    function reset() {
        data = freshState();
        try {
            window.localStorage.removeItem(SAVE_KEY);
        } catch (error) {        }
    }

    function setPlayerName(name) {
        data.playerName = (name || '').trim().slice(0, 14) || 'Riya';
        try {
            window.localStorage.setItem(NAME_KEY, data.playerName);
        } catch (error) {}
        save();
    }

    function getPlayerName() {
        return data.playerName;
    }

    function setRoom(id, cameraX) {
        data.room = id;
        data.cameraX = cameraX || 0;
        save();
    }

    function getAll() {
        return data;
    }

    return {
        NIGHT_LENGTH: NIGHT_LENGTH,
        setFlag: setFlag, hasFlag: hasFlag, clearFlag: clearFlag,
        setVar: setVar, getVar: getVar,
        addItem: addItem, hasItem: hasItem, removeItem: removeItem,
        loseRandomItem: loseRandomItem,
        advanceClock: advanceClock, timeLeft: timeLeft,
        markNoteRead: markNoteRead, hasReadNote: hasReadNote,
        save: save, load: load, hasSave: hasSave, reset: reset,
        setPlayerName: setPlayerName, getPlayerName: getPlayerName,
        setRoom: setRoom, getAll: getAll
    };
})();