import type { Finger } from '@/types/music';

export interface ScaleDef {
  id: string;
  name: { es: string; en: string };
  /** MIDI note of the tonic (one octave starts here). */
  rootMidi: number;
  /** Ascending semitone offsets from the root, including the octave. */
  intervals: number[];
  /** Right-hand fingering, ascending (parallel to `intervals`). */
  fingersRH: Finger[];
  /** Left-hand fingering, ascending (parallel to `intervals`). */
  fingersLH: Finger[];
}

/** C major, one octave from middle C (C4). The canonical first scale. */
export const C_MAJOR: ScaleDef = {
  id: 'c-major',
  name: { es: 'Escala de Do mayor', en: 'C major scale' },
  rootMidi: 60,
  intervals: [0, 2, 4, 5, 7, 9, 11, 12],
  fingersRH: [1, 2, 3, 1, 2, 3, 4, 5],
  fingersLH: [5, 4, 3, 2, 1, 3, 2, 1],
};

export const G_MAJOR: ScaleDef = {
  id: 'g-major',
  name: { es: 'Escala de Sol mayor', en: 'G major scale' },
  rootMidi: 67,
  intervals: [0, 2, 4, 5, 7, 9, 11, 12],
  fingersRH: [1, 2, 3, 1, 2, 3, 4, 5],
  fingersLH: [5, 4, 3, 2, 1, 3, 2, 1],
};

export const SCALES: ScaleDef[] = [C_MAJOR, G_MAJOR];

/** Absolute MIDI notes of a scale, ascending. */
export function scaleNotes(scale: ScaleDef): number[] {
  return scale.intervals.map((semi) => scale.rootMidi + semi);
}
