import * as Tone from 'tone';
import { ensureAudio } from './engine';

// Tone.Clock is independent of Tone.Transport — it won't be cancelled when
// playNoteEvents calls transport.cancel() / transport.stop().
let clock: Tone.Clock | null = null;
let tickSynth: Tone.Synth | null = null;
let beatIndex = 0;
let beatsPerBar = 4;

function getSynth(): Tone.Synth {
  if (!tickSynth) {
    tickSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.04 },
      volume: -10,
    }).toDestination();
  }
  return tickSynth;
}

/**
 * Start a click-track metronome at the given BPM. Returns a stop function.
 * Safe to call while song playback is running (uses its own Tone.Clock, not Transport).
 */
export function startMetronome(bpm: number, beatsPerMeasure = 4): () => void {
  stopMetronome();
  beatIndex = 0;
  beatsPerBar = beatsPerMeasure;

  void ensureAudio().then(() => {
    const synth = getSynth();
    // Tone.Clock frequency is in Hz: beats/second = bpm / 60
    clock = new Tone.Clock((time) => {
      const isDownbeat = beatIndex % beatsPerBar === 0;
      synth.triggerAttackRelease(
        isDownbeat ? 'C6' : 'G5',
        '32n',
        time,
        isDownbeat ? 0.8 : 0.4,
      );
      beatIndex++;
    }, bpm / 60);
    clock.start();
  });

  return stopMetronome;
}

export function stopMetronome(): void {
  if (clock) {
    clock.stop();
    clock.dispose();
    clock = null;
  }
}
