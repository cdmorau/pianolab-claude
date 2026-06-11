import type { Song } from '@/types/song';
import { melody, harmony } from './_util';

/** "Twinkle Twinkle Little Star" — traditional, public domain. Full melody + left-hand chords. */
export const twinkle: Song = {
  id: 'twinkle',
  title: 'Twinkle Twinkle Little Star',
  composer: 'Traditional',
  license: 'public-domain',
  difficulty: 1,
  bpm: 100,
  beatsPerMeasure: 4,
  key: 'C major',
  notes: [
    // Right hand — full A-B-A melody.
    ...melody([
      // A
      [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2],
      [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
      // B
      [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
      [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
      // A
      [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2],
      [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
    ], 'R'),
    // Left hand — one triad per measure.
    ...harmony(
      [
        [0, [36, 40, 43], 4], [4, [41, 45, 48], 4], [8, [36, 40, 43], 4], [12, [36, 40, 43], 4],
        [16, [36, 40, 43], 4], [20, [43, 47, 50], 4], [24, [36, 40, 43], 4], [28, [43, 47, 50], 4],
        [32, [36, 40, 43], 4], [36, [41, 45, 48], 4], [40, [36, 40, 43], 4], [44, [36, 40, 43], 4],
      ],
      'L',
    ),
  ],
};
