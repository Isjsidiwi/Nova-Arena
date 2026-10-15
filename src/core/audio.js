import { ASSETS } from '../config/assets.js';

// Efek suara sintetis (WebAudio). Jika ASSETS.sfx[kind] diisi, file itu yang diputar.
const SYNTH = {
  tap: [660, .06, 'square'],
  hit: [140, .12, 'sawtooth'],
  ult: [90, .5, 'sawtooth'],
  pull: [880, .4, 'triangle'],
  win: [988, .5, 'triangle'],
  lose: [110, .6, 'sine'],
};

let audioContext = null;

export function sfx(kind) {
  try {
    if (ASSETS.sfx[kind]) {
      new Audio(ASSETS.sfx[kind]).play();
      return;
    }
    audioContext = audioContext || new AudioContext();
    const [freq, duration, type] = SYNTH[kind];
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      freq * (kind === 'ult' ? 4 : 1.5),
      audioContext.currentTime + duration,
    );
    gain.gain.setValueAtTime(.07, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
  } catch {
    /* audio tidak tersedia: abaikan */
  }
}
