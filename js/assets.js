W7.assets = (function () {
    'use strict';

    var IMAGES = {
        'room.reception': 'assets/img/rooms/reception.webp',
        'room.corridor': 'assets/img/rooms/corridor.webp',
        'room.waiting': 'assets/img/rooms/waiting.webp',
        'room.records': 'assets/img/rooms/records.webp',
        'room.ward7': 'assets/img/rooms/ward7.webp',
        'room.utility': 'assets/img/rooms/utility.webp',
        'room.breaker': 'assets/img/rooms/breaker.webp',
        'room.stair': 'assets/img/rooms/stair.webp',
        'room.morgue': 'assets/img/rooms/morgue.webp',
        'presence.away': 'assets/img/hot/matron_away.png',
        'presence.facing': 'assets/img/hot/matron_facing.png',
        'presence.face': 'assets/img/hot/matron_face.png',
        'ui.title': 'assets/img/ui/title.webp'
    };

    var AUDIO = {
        'amb.hvac': 'assets/audio/amb/hvac.mp3',
        'amb.rain': 'assets/audio/amb/rain.mp3',
        'amb.drip': 'assets/audio/amb/drip.mp3',
        'amb.ward': 'assets/audio/amb/ward.mp3',
        'amb.morgue': 'assets/audio/amb/morgue.mp3',
        'step.carpet': 'assets/audio/sfx/step_carpet.mp3',
        'step.tile': 'assets/audio/sfx/step_tile.mp3',
        'step.concrete': 'assets/audio/sfx/step_concrete.mp3',
        'step.metal': 'assets/audio/sfx/step_metal.mp3',
        'step.water': 'assets/audio/sfx/step_water.mp3',
        'sfx.drawer_open': 'assets/audio/sfx/drawer_open.mp3',
        'sfx.drawer_close': 'assets/audio/sfx/drawer_close.mp3',
        'sfx.door_creak': 'assets/audio/sfx/door_creak.mp3',
        'sfx.door_lock': 'assets/audio/sfx/door_lock.mp3',
        'sfx.key': 'assets/audio/sfx/key.mp3',
        'sfx.paper': 'assets/audio/sfx/paper.mp3',
        'sfx.pickup': 'assets/audio/sfx/pickup.mp3',
        'sfx.static': 'assets/audio/sfx/static.mp3',
        'sfx.intercom': 'assets/audio/sfx/intercom.mp3',
        'sfx.metal': 'assets/audio/sfx/metal.mp3',
        'sfx.breath': 'assets/audio/sfx/breath.mp3',
        'sfx.sting': 'assets/audio/sfx/sting.mp3',
        'sfx.jumpscare': 'assets/audio/sfx/jumpscare.mp3',
        'sfx.footstep': 'assets/audio/sfx/footstep.mp3',
        'voice.whisper1': 'assets/audio/voice/whisper1.mp3',
        'voice.whisper2': 'assets/audio/voice/whisper2.mp3',
        'voice.whisper3': 'assets/audio/voice/whisper3.mp3',
        'voice.matron': 'assets/audio/voice/matron.mp3',
        'music.tension': 'assets/audio/music/tension.mp3',
        'music.ending': 'assets/audio/music/ending.mp3'
    };

    var VIDEOS = {
        'video.tv': 'assets/vid/tv_loop.mp4',
        'video.cctv_a': 'assets/vid/cctv_a.mp4',
        'video.cctv_b': 'assets/vid/cctv_b.mp4',
        'video.cctv_c': 'assets/vid/cctv_c.mp4',
        'video.tape': 'assets/vid/tape_1998.mp4'
    };

    var images = {};
    var audioBuffers = {};
    var missing = [];
    var loaded = 0;
    var total = 0;

    function loadImages(onProgress) {
        var keys = Object.keys(IMAGES);
        var roomKeys = keys.filter(function (key) { return key.indexOf('room.') === 0;});
        var queue = roomKeys.concat(['presence.away', 'presence.facing']);
        total = queue.length;
        loaded = 0;
        
        function tick() {
            loaded += 1;
            if (onProgress) { onProgress(loaded/total);}

            queue.forEach(function (key) {
                var image = new Image();
                image.onload = function () {
                    images[key] = image;
                    tick();
                };
                image.onerror = function () {
                    missing.push(key);
                    tick();
                }

                image.src = IMAGES[key]
            });

            keys.forEach(function (key) {
                if (queue.indexOf(key) !== -1) { return;}
                var image = new Image();
                image.onload = function () { images[key] = image;};
                image.onerror = function () { missing.push(key); };
                image.src = IMAGES[key];
            });

            if (W7.rooms && W7.rooms.itemList()) {
                Object.keys(W7.rooms.itemList()).forEach(function (id) {
                    var def = W7.rooms.item(id);
                    var image = new Image();
                    image.onload = function () { images['item.' + id] = image; };
                    image.onerror = function () { missing.push('item.' + id); };
                    image.src = def.icon;
                });
            }
        }

        function image(key) {
            return images[key] || null;
        }

        function loadAudio(ctx, onProgress) {
            var keys = Object.keys(AUDIO);
            total = keys.length;
            loaded = 0;

            keys.forEach(function (key) {
                fetch (AUDIO[key])
                    .then(function (response) {
                        if (!response.ok) { throw new Error('bad status'); }
                        return response.arrayBuffer();
                    })
                    .then(function (data) {
                        return ctx.decodeAudioData(data);
                    })
                    .then(function (buffer) {
                        audioBuffers[key] = buffer;
                        loaded += 1;
                        if (onProgress) { onProgress(loaded / total); }
                    })
                    .catch(function () {
                        missing.push(key);
                        loaded += 1;
                        if (onProgress) { onProgress(loaded / total); }
                    });
            });
        }

        function buffer(key) {
            return audioBuffers[key] || null;
        }

        function video(key) {
            var element = document.createElement('video');
            element.src = VIDEOS[key];
            element.muted = true;
            element.loop = true;
            element.playsInline = true;
            element.preload = 'auto';
            return element;
        }

        function isMissing(key) {
            return missing.indexOf(key) !== -1;
        }

        function missingList() {
            return missing.slice();
        }

        return {
            loadImages: loadImages,
            loadAudio: loadAudio,
            image: image,
            buffer: buffer,
            video: video,
            isMissing: isMissing,
            missingList: missingList,
            paths: { images: IMAGES, audio: AUDIO, videos: VIDEOS }
        };
    
    }
})();