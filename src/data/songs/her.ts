import type { Song } from '@/types/song';
import { melody, harmony } from './_util';

/**
 * "Photograph" — from the film "Her", composed by Arcade Fire (Will Butler /
 * Owen Pallett). Two-hand arrangement of the main motif.
 * For personal/educational use only — © the respective copyright owners.
 */
export const herPhotograph: Song = {
  id: 'her-photograph',
  title: 'Her — Photograph',
  composer: 'Arcade Fire',
  license: 'personal-use',
  difficulty: 2,
  bpm: 84,
  beatsPerMeasure: 4,
  key: 'C major',
  attribution: {
    es: 'Arreglo a dos manos · uso personal/educativo · © Arcade Fire',
    en: 'Two-hand arrangement · personal/educational use · © Arcade Fire',
  },
  notes: [
    ...melody([
      [72, 1], [76, 1], [74, 1], [72, 1],
      [71, 1], [74, 1], [72, 1], [71, 1],
      [69, 1], [72, 1], [71, 1], [69, 1],
      [67, 2], [72, 1], [76, 1],
      [72, 1], [76, 1], [74, 1], [72, 1],
      [71, 1], [74, 1], [72, 1], [71, 1],
      [69, 1], [71, 1], [72, 2],
      [76, 2], [72, 2],
    ], 'R'),
    ...harmony(
      [
        [0, [36, 43, 48], 4], // C
        [4, [43, 47, 50], 4], // G
        [8, [45, 52, 57], 4], // Am
        [12, [41, 45, 48], 4], // F
        [16, [36, 43, 48], 4], // C
        [20, [43, 47, 50], 4], // G
        [24, [41, 45, 48], 4], // F
        [28, [36, 43, 48], 4], // C
      ],
      'L',
    ),
  ],
};
