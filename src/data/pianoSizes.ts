/** Standard keyboard sizes with their real MIDI ranges. */
export interface PianoSize {
  keys: number;
  startMidi: number;
  endMidi: number;
  /** Short note describing the range, e.g. "A0–C8". */
  range: string;
}

export const PIANO_SIZES: PianoSize[] = [
  { keys: 88, startMidi: 21, endMidi: 108, range: 'A0–C8' }, // full piano
  { keys: 76, startMidi: 28, endMidi: 103, range: 'E1–G7' },
  { keys: 61, startMidi: 36, endMidi: 96, range: 'C2–C7' },
  { keys: 49, startMidi: 36, endMidi: 84, range: 'C2–C6' },
  { keys: 37, startMidi: 48, endMidi: 84, range: 'C3–C6' },
  { keys: 25, startMidi: 48, endMidi: 72, range: 'C3–C5' },
];

export const DEFAULT_PIANO_KEYS = 49;

export function getPianoSize(keys: number): PianoSize {
  return PIANO_SIZES.find((s) => s.keys === keys) ?? PIANO_SIZES[3];
}

/**
 * Range to display for a practice/song: the chosen keyboard size, expanded if
 * needed so the required notes always fit.
 */
export function displayRange(
  requiredStart: number,
  requiredEnd: number,
  keys: number,
): { start: number; end: number } {
  const size = getPianoSize(keys);
  return {
    start: Math.min(size.startMidi, requiredStart),
    end: Math.max(size.endMidi, requiredEnd),
  };
}
