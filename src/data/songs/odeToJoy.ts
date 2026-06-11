import type { Song } from '@/types/song';
import { melody } from './_util';

/**
 * "Ode to Joy" — Ludwig van Beethoven (Symphony No. 9), public domain.
 * Fits a single 5-finger right-hand position (C=1 … G=5), so fingering shown.
 */
export const odeToJoy: Song = {
  id: 'ode-to-joy',
  title: 'Ode to Joy',
  composer: 'L. van Beethoven',
  license: 'public-domain',
  difficulty: 1,
  bpm: 110,
  beatsPerMeasure: 4,
  key: 'C major',
  notes: melody([
    [64, 1, 3], [64, 1, 3], [65, 1, 4], [67, 1, 5],
    [67, 1, 5], [65, 1, 4], [64, 1, 3], [62, 1, 2],
    [60, 1, 1], [60, 1, 1], [62, 1, 2], [64, 1, 3],
    [64, 1.5, 3], [62, 0.5, 2], [62, 2, 2],
  ]),
};
