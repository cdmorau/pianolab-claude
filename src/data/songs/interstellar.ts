import type { Song } from '@/types/song';
import { melody } from './_util';

/**
 * "Interstellar" main theme — Hans Zimmer.
 * Simplified arrangement of the rising motif, for personal/educational use only.
 * © Hans Zimmer / WaterTower Music — all rights reserved by the copyright owners.
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
    es: 'Arreglo simplificado · uso personal/educativo · © Hans Zimmer',
    en: 'Simplified arrangement · personal/educational use · © Hans Zimmer',
  },
  notes: melody([
    [69, 1], [76, 1], [77, 2],
    [76, 1], [69, 1], [76, 2],
    [69, 1], [76, 1], [77, 1], [79, 1],
    [77, 2], [76, 2],
    [74, 1], [76, 1], [77, 4],
  ]),
};
