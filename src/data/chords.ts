import type { Finger } from '@/types/music';

export interface ChordDef {
  id: string;
  name: { es: string; en: string };
  /** Symbol shown as a badge, e.g. "C", "F", "G". */
  symbol: string;
  /** MIDI notes that make up the chord (root position). */
  midis: number[];
  /** Right-hand fingering parallel to `midis`. */
  fingersRH: Finger[];
}

/** Three basic major triads in root position around middle C. */
export const C_MAJOR_TRIAD: ChordDef = {
  id: 'c-major-triad',
  name: { es: 'Acorde de Do mayor', en: 'C major chord' },
  symbol: 'C',
  midis: [60, 64, 67],
  fingersRH: [1, 3, 5],
};

export const F_MAJOR_TRIAD: ChordDef = {
  id: 'f-major-triad',
  name: { es: 'Acorde de Fa mayor', en: 'F major chord' },
  symbol: 'F',
  midis: [65, 69, 72],
  fingersRH: [1, 3, 5],
};

export const G_MAJOR_TRIAD: ChordDef = {
  id: 'g-major-triad',
  name: { es: 'Acorde de Sol mayor', en: 'G major chord' },
  symbol: 'G',
  midis: [67, 71, 74],
  fingersRH: [1, 3, 5],
};

export const TRIADS: ChordDef[] = [C_MAJOR_TRIAD, F_MAJOR_TRIAD, G_MAJOR_TRIAD];
