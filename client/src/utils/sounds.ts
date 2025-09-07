// Simple sound utility for trade notifications
export const playTradeSound = (type: 'win' | 'lose' | 'place') => {
  try {
    // Create audio context for web audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (frequency: number, duration: number, volume: number = 0.1) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    switch (type) {
      case 'win':
        // Happy ascending tone
        playTone(523, 0.2); // C5
        setTimeout(() => playTone(659, 0.2), 100); // E5
        setTimeout(() => playTone(784, 0.3), 200); // G5
        break;

      case 'lose':
        // Sad descending tone
        playTone(523, 0.3); // C5
        setTimeout(() => playTone(466, 0.3), 150); // Bb4
        setTimeout(() => playTone(392, 0.4), 300); // G4
        break;

      case 'place':
        // Quick confirmation beep
        playTone(800, 0.1);
        break;
    }
  } catch (error) {
    console.log('Audio not available:', error);
  }
};