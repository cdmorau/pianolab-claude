/** Finger numbers used in standard piano fingering (both hands). */
export type Finger = 1 | 2 | 3 | 4 | 5;

/** Which hand plays a note. */
export type Hand = 'L' | 'R';

/** A choice of hand(s) to practice. */
export type HandChoice = 'L' | 'R' | 'both';

/** Sharp-based note names for the 12 pitch classes (index = semitone within octave). */
export const PITCH_CLASS_NAMES_SHARP = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

/** Flat-based equivalents, for display when a flat spelling is preferred. */
export const PITCH_CLASS_NAMES_FLAT = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const;

/** Solfège (movable-do style fixed names) used for the Spanish UI. */
export const SOLFEGE_NAMES = [
  'Do',
  'Do#',
  'Re',
  'Re#',
  'Mi',
  'Fa',
  'Fa#',
  'Sol',
  'Sol#',
  'La',
  'La#',
  'Si',
] as const;
