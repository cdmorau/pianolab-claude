import type { Song } from '@/types/song';
import { melody, harmony } from './_util';

/**
 * "Interstellar" main theme — Hans Zimmer.
 * Built on the signature E–C ostinato that rises through the theme, over low
 * pedal octaves. For personal/educational use only — © Hans Zimmer / WaterTower.
 */
export const interstellar: Song = {
  id: 'interstellar-main-theme',
  title: 'Interstellar — Main Theme',
  composer: 'Hans Zimmer',
  license: 'personal-use',
  difficulty: 3,
  bpm: 90,
  beatsPerMeasure: 4,
  key: 'A minor',
  attribution: {
    es: 'Ostinato Mi–Do + tema · arreglo · uso personal/educativo · © Hans Zimmer',
    en: 'E–C ostinato + theme · arrangement · personal/educational use · © Hans Zimmer',
  },
  notes: [
    ...melody([
      // E–C ostinato, gradually rising
      [64, 0.5], [60, 0.5], [64, 0.5], [60, 0.5], [64, 0.5], [60, 0.5], [64, 0.5], [60, 0.5],
      [64, 0.5], [60, 0.5], [64, 0.5], [60, 0.5], [64, 0.5], [60, 0.5], [64, 0.5], [60, 0.5],
      [64, 0.5], [60, 0.5], [64, 0.5], [60, 0.5], [65, 0.5], [60, 0.5], [65, 0.5], [60, 0.5],
      [67, 0.5], [60, 0.5], [67, 0.5], [60, 0.5], [67, 0.5], [60, 0.5], [67, 0.5], [60, 0.5],
      [69, 0.5], [64, 0.5], [69, 0.5], [64, 0.5], [69, 0.5], [64, 0.5], [69, 0.5], [64, 0.5],
      [69, 0.5], [64, 0.5], [69, 0.5], [64, 0.5], [71, 0.5], [64, 0.5], [71, 0.5], [64, 0.5],
      [72, 0.5], [67, 0.5], [72, 0.5], [67, 0.5], [72, 0.5], [67, 0.5], [72, 0.5], [67, 0.5],
      [76, 2], [72, 2],
    ], 'R'),
    ...harmony(
      [
        [0, [33, 45], 4], // A pedal octave
        [4, [33, 45], 4], // A
        [8, [29, 41], 4], // F
        [12, [36, 48], 4], // C
        [16, [33, 45], 4], // A
        [20, [33, 45], 4], // A
        [24, [31, 43], 4], // G
        [28, [36, 48], 4], // C
      ],
      'L',
    ),
  ],
};
