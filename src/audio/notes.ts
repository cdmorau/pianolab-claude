import {
  PITCH_CLASS_NAMES_SHARP,
  PITCH_CLASS_NAMES_FLAT,
  SOLFEGE_NAMES,
} from '@/types/music';
import type { Language } from '@/i18n';

/** Reference: A4 = MIDI 69 = 440 Hz. */
export const A4_MIDI = 69;
export const A4_FREQ = 440;

/** Full 88-key piano range: A0 (21) to C8 (108). */
export const MIN_MIDI = 21;
export const MAX_MIDI = 108;

/** Convert a MIDI note number to its frequency in Hz (equal temperament). */
export function midiToFreq(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}

/** Convert a frequency in Hz to the nearest (fractional) MIDI note number. */
export function freqToMidiFloat(freq: number): number {
  return A4_MIDI + 12 * Math.log2(freq / A4_FREQ);
}

/** Convert a frequency in Hz to the nearest integer MIDI note number. */
export function freqToMidi(freq: number): number {
  return Math.round(freqToMidiFloat(freq));
}

/**
 * How far (in cents, -50..50) a frequency is from the nearest equal-tempered
 * note. 0 means perfectly in tune.
 */
export function centsOff(freq: number): number {
  const exact = freqToMidiFloat(freq);
  const nearest = Math.round(exact);
  return Math.round((exact - nearest) * 100);
}

/** The pitch class (0..11) of a MIDI note, where 0 = C. */
export function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

/** The octave number of a MIDI note (scientific pitch notation; C4 = middle C). */
export function octaveOf(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

/** True if the MIDI note maps to a black key. */
export function isBlackKey(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(pitchClass(midi));
}

export interface NoteNameOptions {
  /** Prefer flats over sharps for accidentals. Default false (sharps). */
  flats?: boolean;
  /** Append the octave number (e.g. "C4"). Default true. */
  withOctave?: boolean;
  /** Display language: "es" uses solfège (Do, Re, Mi…), "en" uses letters. */
  language?: Language;
}

/** Human-readable name for a MIDI note, honoring language/spelling options. */
export function midiToNoteName(midi: number, options: NoteNameOptions = {}): string {
  const { flats = false, withOctave = true, language = 'en' } = options;
  const pc = pitchClass(midi);
  let name: string;
  if (language === 'es') {
    name = SOLFEGE_NAMES[pc];
  } else {
    name = (flats ? PITCH_CLASS_NAMES_FLAT : PITCH_CLASS_NAMES_SHARP)[pc];
  }
  return withOctave ? `${name}${octaveOf(midi)}` : name;
}

/** VexFlow-style key string for a MIDI note, e.g. 60 -> "c/4", 61 -> "c#/4". */
export function midiToVexKey(midi: number): string {
  const pc = pitchClass(midi);
  const name = PITCH_CLASS_NAMES_SHARP[pc].toLowerCase();
  return `${name}/${octaveOf(midi)}`;
}

const NAME_TO_PC: Record<string, number> = {
  c: 0,
  d: 2,
  e: 4,
  f: 5,
  g: 7,
  a: 9,
  b: 11,
  do: 0,
  re: 2,
  mi: 4,
  fa: 5,
  sol: 7,
  la: 9,
  si: 11,
};

/**
 * Parse a note name like "C4", "C#4", "Db4", "Do4", "Fa#3" into a MIDI number.
 * Returns null if it cannot be parsed.
 */
export function noteNameToMidi(name: string): number | null {
  const match = name.trim().match(/^([A-Ga-g]|do|re|mi|fa|sol|la|si)([#b]?)(-?\d+)$/i);
  if (!match) return null;
  const [, letterRaw, accidental, octaveRaw] = match;
  const base = NAME_TO_PC[letterRaw.toLowerCase()];
  if (base === undefined) return null;
  let pc = base;
  if (accidental === '#') pc += 1;
  else if (accidental === 'b') pc -= 1;
  const octave = parseInt(octaveRaw, 10);
  return (octave + 1) * 12 + pc;
}

/**
 * Whether a detected MIDI note matches a target.
 * `octaveTolerant` accepts any octave of the same pitch class (useful when a
 * microphone picks up an overtone an octave away from the played note).
 */
export function notesMatch(detected: number, target: number, octaveTolerant = false): boolean {
  if (detected === target) return true;
  return octaveTolerant && pitchClass(detected) === pitchClass(target);
}
