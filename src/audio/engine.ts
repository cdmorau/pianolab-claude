import * as Tone from 'tone';
import { midiToFreq } from './notes';
import type { NoteEvent } from '@/types/song';

/**
 * Audio engine wrapper around Tone.js.
 *
 * Uses the freely-licensed Salamander Grand Piano samples (CC-BY 3.0) hosted on
 * the Tone.js CDN, with a synth fallback if the samples cannot be loaded
 * (e.g. offline). All playback happens locally in the browser.
 */

const SALAMANDER_BASE = 'https://tonejs.github.io/audio/salamander/';

// Every-minor-third sample map; Tone.Sampler interpolates the in-between notes.
const SALAMANDER_URLS: Record<string, string> = {
  A0: 'A0.mp3',
  C1: 'C1.mp3',
  'D#1': 'Ds1.mp3',
  'F#1': 'Fs1.mp3',
  A1: 'A1.mp3',
  C2: 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  A2: 'A2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
  C6: 'C6.mp3',
  'D#6': 'Ds6.mp3',
  'F#6': 'Fs6.mp3',
  A6: 'A6.mp3',
  C7: 'C7.mp3',
  'D#7': 'Ds7.mp3',
  'F#7': 'Fs7.mp3',
  A7: 'A7.mp3',
  C8: 'C8.mp3',
};

let sampler: Tone.Sampler | null = null;
let fallbackSynth: Tone.PolySynth | null = null;
let samplerLoaded = false;
let startPromise: Promise<void> | null = null;
const masterVolume = new Tone.Volume(-6).toDestination();

function getFallback(): Tone.PolySynth {
  if (!fallbackSynth) {
    fallbackSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.2, release: 1 },
    }).connect(masterVolume);
  }
  return fallbackSynth;
}

/**
 * Resume the audio context (must be called from a user gesture) and kick off
 * loading the piano samples. Safe to call multiple times.
 */
export function ensureAudio(): Promise<void> {
  if (!startPromise) {
    startPromise = (async () => {
      await Tone.start();
      // Always have the fallback ready instantly.
      getFallback();
      try {
        sampler = new Tone.Sampler({
          urls: SALAMANDER_URLS,
          baseUrl: SALAMANDER_BASE,
          release: 1,
          onload: () => {
            samplerLoaded = true;
          },
        }).connect(masterVolume);
        await Tone.loaded();
        samplerLoaded = true;
      } catch {
        samplerLoaded = false;
      }
    })();
  }
  return startPromise;
}

function instrument(): Tone.Sampler | Tone.PolySynth {
  return samplerLoaded && sampler ? sampler : getFallback();
}

/** Play a single MIDI note for `duration` seconds. */
export function playNote(midi: number, duration = 0.7, velocity = 0.8): void {
  void ensureAudio().then(() => {
    instrument().triggerAttackRelease(midiToFreq(midi), duration, undefined, velocity);
  });
}

/** Play several MIDI notes at once (a chord). */
export function playChord(midis: number[], duration = 1.2, velocity = 0.8): void {
  void ensureAudio().then(() => {
    const freqs = midis.map(midiToFreq);
    instrument().triggerAttackRelease(freqs, duration, undefined, velocity);
  });
}

/**
 * Play a sequence of MIDI notes one after another at the given tempo.
 * Returns a function that cancels any still-pending notes.
 */
export function playSequence(midis: number[], bpm = 90): void {
  const secondsPerNote = 60 / bpm;
  void ensureAudio().then(() => {
    const inst = instrument();
    const t0 = Tone.now() + 0.1;
    midis.forEach((midi, i) => {
      inst.triggerAttackRelease(midiToFreq(midi), secondsPerNote * 0.9, t0 + i * secondsPerNote, 0.8);
    });
  });
}

/**
 * Play a list of timed NoteEvents (a song) with sample-accurate timing using
 * Tone's Transport (no setTimeout jitter). Returns a cancel function.
 * `playbackRate` < 1 slows the song down for practice.
 */
export function playNoteEvents(
  events: NoteEvent[],
  bpm: number,
  playbackRate = 1,
  onNote?: (event: NoteEvent) => void,
): () => void {
  let cancelled = false;
  const transport = Tone.getTransport();
  void ensureAudio().then(() => {
    if (cancelled) return;
    const beatSeconds = 60 / (bpm * playbackRate);
    transport.stop();
    transport.cancel();
    transport.bpm.value = bpm * playbackRate;
    const inst = instrument();
    for (const ev of events) {
      const when = ev.startBeat * beatSeconds;
      transport.schedule((time) => {
        inst.triggerAttackRelease(
          midiToFreq(ev.midi),
          Math.max(0.08, ev.durationBeats * beatSeconds * 0.95),
          time,
          ev.velocity ?? 0.8,
        );
        if (onNote) Tone.getDraw().schedule(() => onNote(ev), time);
      }, when);
    }
    transport.start();
  });
  return () => {
    cancelled = true;
    transport.stop();
    transport.cancel();
  };
}

/** Set the master output volume, 0..1. */
export function setVolume(level: number): void {
  // Map 0..1 to a gentle dB curve; 0 mutes.
  masterVolume.volume.value = level <= 0 ? -Infinity : 20 * Math.log10(level);
}

export function isSamplerLoaded(): boolean {
  return samplerLoaded;
}
