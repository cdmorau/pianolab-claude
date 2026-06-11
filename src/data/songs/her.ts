import type { Song } from '@/types/song';
import { melody } from './_util';

/**
 * "Photograph" — from the film "Her", composed by Arcade Fire (Will Butler /
 * Owen Pallett). Simplified arrangement of the main motif, for personal/
 * educational use only. © the respective copyright owners — all rights reserved.
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
    es: 'Arreglo simplificado · uso personal/educativo · © Arcade Fire',
    en: 'Simplified arrangement · personal/educational use · © Arcade Fire',
  },
  notes: melody([
    [72, 1], [76, 1], [74, 1], [72, 1],
    [71, 1], [74, 1], [72, 1], [71, 1],
    [69, 1], [72, 1], [71, 1], [69, 1],
    [67, 2], [72, 1], [76, 1],
  ]),
};
