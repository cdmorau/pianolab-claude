import type { Song } from '@/types/song';
import { melody } from './_util';

/**
 * "Für Elise" (WoO 59) — Ludwig van Beethoven, public domain.
 * Opening right-hand motif (excerpt) with the customary fingering.
 */
export const furElise: Song = {
  id: 'fur-elise',
  title: 'Für Elise (excerpt)',
  composer: 'L. van Beethoven',
  license: 'public-domain',
  difficulty: 3,
  bpm: 80,
  beatsPerMeasure: 3,
  key: 'A minor',
  notes: melody([
    [76, 0.5, 5], [75, 0.5, 4], [76, 0.5, 5], [75, 0.5, 4], [76, 0.5, 5],
    [71, 0.5, 1], [74, 0.5, 2], [72, 0.5, 1], [69, 1, 1],
    [60, 0.5, 1], [64, 0.5, 2], [69, 0.5, 5], [71, 1, 4],
    [64, 0.5, 1], [68, 0.5, 2], [71, 0.5, 4], [72, 1, 5],
  ]),
};
