import type { Song } from '@/types/song';
import { melody, harmony } from './_util';

/**
 * "Ode to Joy" — Ludwig van Beethoven (Symphony No. 9), public domain.
 * Full 8-bar theme (both phrases), right-hand fingering + left-hand chords.
 */
export const odeToJoy: Song = {
  id: 'ode-to-joy',
  title: 'Ode to Joy',
  composer: 'L. van Beethoven',
  license: 'public-domain',
  difficulty: 2,
  bpm: 112,
  beatsPerMeasure: 4,
  key: 'C major',
  notes: [
    ...melody([
      // Phrase 1
      [64, 1, 3], [64, 1, 3], [65, 1, 4], [67, 1, 5],
      [67, 1, 5], [65, 1, 4], [64, 1, 3], [62, 1, 2],
      [60, 1, 1], [60, 1, 1], [62, 1, 2], [64, 1, 3],
      [64, 1.5, 3], [62, 0.5, 2], [62, 2, 2],
      // Phrase 2
      [64, 1, 3], [64, 1, 3], [65, 1, 4], [67, 1, 5],
      [67, 1, 5], [65, 1, 4], [64, 1, 3], [62, 1, 2],
      [60, 1, 1], [60, 1, 1], [62, 1, 2], [64, 1, 3],
      [62, 1.5, 2], [60, 0.5, 1], [60, 2, 1],
    ], 'R'),
    ...harmony(
      [
        [0, [36, 40, 43], 4], [4, [43, 47, 50], 4], [8, [36, 40, 43], 4], [12, [43, 47, 50], 4],
        [16, [36, 40, 43], 4], [20, [43, 47, 50], 4], [24, [36, 40, 43], 4], [28, [36, 40, 43], 4],
      ],
      'L',
    ),
  ],
};
