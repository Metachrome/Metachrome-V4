// Simple sound utility for trade notifications
export var playTradeSound = function (type) {
    try {
        // Create audio context for web audio API
        var audioContext_1 = new (window.AudioContext || window.webkitAudioContext)();
        var playTone_1 = function (frequency, duration, volume) {
            if (volume === void 0) { volume = 0.1; }
            var oscillator = audioContext_1.createOscillator();
            var gainNode = audioContext_1.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext_1.destination);
            oscillator.frequency.setValueAtTime(frequency, audioContext_1.currentTime);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0, audioContext_1.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext_1.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext_1.currentTime + duration);
            oscillator.start(audioContext_1.currentTime);
            oscillator.stop(audioContext_1.currentTime + duration);
        };
        switch (type) {
            case 'win':
                // Happy ascending tone
                playTone_1(523, 0.2); // C5
                setTimeout(function () { return playTone_1(659, 0.2); }, 100); // E5
                setTimeout(function () { return playTone_1(784, 0.3); }, 200); // G5
                break;
            case 'lose':
                // Sad descending tone
                playTone_1(523, 0.3); // C5
                setTimeout(function () { return playTone_1(466, 0.3); }, 150); // Bb4
                setTimeout(function () { return playTone_1(392, 0.4); }, 300); // G4
                break;
            case 'place':
                // Quick confirmation beep
                playTone_1(800, 0.1);
                break;
        }
    }
    catch (error) {
        console.log('Audio not available:', error);
    }
};
