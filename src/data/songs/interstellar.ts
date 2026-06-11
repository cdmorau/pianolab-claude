import type { Song } from '@/types/song';
import { melody, harmony } from './_util';

/**
 * "Interstellar" main theme — Hans Zimmer.
 * Two-hand arrangement of the rising theme over an Am–F–C–G bass.
 * For personal/educational use only — © Hans Zimmer / WaterTower Music.
 */
export const interstellar: Song = {
  id: 'interstellar-main-theme',
  title: 'Interstellar — Main Theme',
  composer: 'Hans Zimmer',
  license: 'personal-use',
  difficulty: 3,
  bpm: 72,
  beatsPerMeasure: 4,
  key: 'A minor',
  attribution: {
    es: 'Arreglo a dos manos · uso personal/educativo · © Hans Zimmer',
    en: 'Two-hand arrangement · personal/educational use · © Hans Zimmer',
  },
  notes: [
    ...melody([
      [69, 1], [76, 1], [77, 2],
      [76, 1], [69, 1], [76, 2],
      [77, 1], [79, 1], [81, 2],
      [79, 1], [77, 1], [76, 2],
      [69, 1], [76, 1], [77, 2],
      [76, 1], [69, 1], [76, 2],
      [77, 1], [79, 1], [81, 1], [83, 1],
      [81, 2], [79, 1], [77, 1],
    ], 'R'),
    ...harmony(
      [
        [0, [45, 52, 57], 4], // Am
        [4, [41, 45, 48], 4], // F
        [8, [36, 43, 48], 4], // C
        [12, [43, 47, 50], 4], // G
        [16, [45, 52, 57], 4], // Am
        [20, [41, 45, 48], 4], // F
        [24, [36, 43, 48], 4], // C
        [28, [43, 47, 50], 4], // G
      ],
      'L',
    ),
  ],
};
