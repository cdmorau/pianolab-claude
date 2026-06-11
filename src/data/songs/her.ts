import type { Song } from '@/types/song';
import { melody, harmony } from './_util';

/**
 * "Photograph" — from the film "Her", composed by Arcade Fire (Will Butler /
 * Owen Pallett). Two-hand arrangement in F major over the F–Bb–Gm–D / G chords
 * the song uses. For personal/educational use only — © the copyright owners.
 */
export const herPhotograph: Song = {
  id: 'her-photograph',
  title: 'Her — Photograph',
  composer: 'Arcade Fire',
  license: 'personal-use',
  difficulty: 2,
  bpm: 80,
  beatsPerMeasure: 4,
  key: 'F major',
  attribution: {
    es: 'Arreglo a dos manos (Fa mayor) · uso personal/educativo · © Arcade Fire',
    en: 'Two-hand arrangement (F major) · personal/educational use · © Arcade Fire',
  },
  notes: [
    ...melody([
      // F  (C F E C)
      [72, 1], [77, 1], [76, 1], [72, 1],
      // Bb (D F D Bb)
      [74, 1], [77, 1], [74, 1], [70, 1],
      // Gm (D Bb D G)
      [74, 1], [70, 1], [74, 1], [67, 1],
      // D  (A F# A D)
      [69, 1], [66, 1], [69, 1], [74, 1],
      // F
      [72, 1], [77, 1], [76, 1], [72, 1],
      // Bb
      [74, 1], [77, 1], [74, 1], [70, 1],
      // Gm
      [74, 1], [70, 1], [67, 1], [70, 1],
      // F (resolve)
      [72, 2], [77, 2],
    ], 'R'),
    ...harmony(
      [
        [0, [41, 45, 48], 4], // F
        [4, [46, 50, 53], 4], // Bb
        [8, [43, 46, 50], 4], // Gm
        [12, [38, 42, 45], 4], // D
        [16, [41, 45, 48], 4], // F
        [20, [46, 50, 53], 4], // Bb
        [24, [43, 46, 50], 4], // Gm
        [28, [41, 45, 48], 4], // F
      ],
      'L',
    ),
  ],
};
