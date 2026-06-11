import type { Song } from '@/types/song';
import { melody, harmony } from './_util';

/**
 * "Für Elise" (WoO 59) — Ludwig van Beethoven, public domain.
 * Full A-section theme (right hand) with the left-hand broken-chord accompaniment.
 */
export const furElise: Song = {
  id: 'fur-elise',
  title: 'Für Elise',
  composer: 'L. van Beethoven',
  license: 'public-domain',
  difficulty: 3,
  bpm: 60,
  beatsPerMeasure: 3,
  key: 'A minor',
  notes: [
    ...melody([
      // Main motif → resolves on A
      [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5], [69, 1],
      [60, 0.5], [64, 0.5], [69, 0.5], [71, 1],
      [64, 0.5], [68, 0.5], [71, 0.5], [72, 1],
      // Repeat of the motif
      [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5], [69, 1],
      [60, 0.5], [64, 0.5], [69, 0.5], [71, 1],
      [64, 0.5], [72, 0.5], [71, 0.5], [69, 1.5],
    ], 'R'),
    ...harmony(
      [
        [5, [45, 52, 57], 2.5], // Am
        [7.5, [40, 47, 56], 2.5], // E
        [10, [45, 52, 57], 5], // Am (under the motif repeat)
        [15, [45, 52, 57], 2.5], // Am
        [17.5, [45, 52, 57], 3], // Am
      ],
      'L',
    ),
  ],
};
