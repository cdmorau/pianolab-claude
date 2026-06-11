import { describe, it, expect } from 'vitest';
import {
  midiToFreq,
  freqToMidi,
  freqToMidiFloat,
  centsOff,
  pitchClass,
  octaveOf,
  isBlackKey,
  midiToNoteName,
  midiToVexKey,
  noteNameToMidi,
  notesMatch,
} from './notes';

describe('frequency <-> midi', () => {
  it('maps A4 to 440 Hz', () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 5);
  });

  it('maps middle C (C4 = 60) to ~261.63 Hz', () => {
    expect(midiToFreq(60)).toBeCloseTo(261.6256, 3);
  });

  it('round-trips frequency back to the nearest midi note', () => {
    expect(freqToMidi(440)).toBe(69);
    expect(freqToMidi(261.63)).toBe(60);
    expect(freqToMidi(880)).toBe(81);
  });

  it('returns a fractional midi for an out-of-tune frequency', () => {
    expect(freqToMidiFloat(445)).toBeGreaterThan(69);
    expect(freqToMidiFloat(445)).toBeLessThan(69.5);
  });
});

describe('centsOff', () => {
  it('is 0 for a perfectly tuned note', () => {
    expect(centsOff(440)).toBe(0);
  });

  it('is positive when sharp and negative when flat', () => {
    expect(centsOff(444)).toBeGreaterThan(0);
    expect(centsOff(437)).toBeLessThan(0);
  });
});

describe('pitch class / octave / black keys', () => {
  it('computes pitch class', () => {
    expect(pitchClass(60)).toBe(0); // C
    expect(pitchClass(69)).toBe(9); // A
  });

  it('computes octave in scientific pitch notation', () => {
    expect(octaveOf(60)).toBe(4); // middle C is C4
    expect(octaveOf(21)).toBe(0); // A0
  });

  it('identifies black keys', () => {
    expect(isBlackKey(61)).toBe(true); // C#4
    expect(isBlackKey(60)).toBe(false); // C4
    expect(isBlackKey(66)).toBe(true); // F#4
  });
});

describe('note names', () => {
  it('renders English letter names with octave', () => {
    expect(midiToNoteName(60, { language: 'en' })).toBe('C4');
    expect(midiToNoteName(61, { language: 'en' })).toBe('C#4');
    expect(midiToNoteName(61, { language: 'en', flats: true })).toBe('Db4');
  });

  it('renders Spanish solfège names', () => {
    expect(midiToNoteName(60, { language: 'es' })).toBe('Do4');
    expect(midiToNoteName(67, { language: 'es' })).toBe('Sol4');
  });

  it('renders without octave when asked', () => {
    expect(midiToNoteName(60, { language: 'en', withOctave: false })).toBe('C');
  });

  it('produces VexFlow keys', () => {
    expect(midiToVexKey(60)).toBe('c/4');
    expect(midiToVexKey(61)).toBe('c#/4');
  });
});

describe('noteNameToMidi', () => {
  it('parses English names', () => {
    expect(noteNameToMidi('C4')).toBe(60);
    expect(noteNameToMidi('A4')).toBe(69);
    expect(noteNameToMidi('C#4')).toBe(61);
    expect(noteNameToMidi('Db4')).toBe(61);
  });

  it('parses solfège names', () => {
    expect(noteNameToMidi('Do4')).toBe(60);
    expect(noteNameToMidi('Sol4')).toBe(67);
  });

  it('returns null for garbage', () => {
    expect(noteNameToMidi('xyz')).toBeNull();
  });
});

describe('notesMatch', () => {
  it('matches exact notes', () => {
    expect(notesMatch(60, 60)).toBe(true);
    expect(notesMatch(60, 61)).toBe(false);
  });

  it('matches across octaves only when octave-tolerant', () => {
    expect(notesMatch(72, 60, true)).toBe(true); // C5 vs C4
    expect(notesMatch(72, 60, false)).toBe(false);
  });
});
