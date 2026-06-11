import type { Song } from '@/types/song';
import { melody } from './_util';

/**
 * Nocturne Op. 9 No. 2 — Frédéric Chopin, public domain (composer d. 1849).
 * Simplified right-hand statement of the opening theme (in Eb major).
 */
export const chopinNocturne: Song = {
  id: 'chopin-nocturne-op9-no2',
  title: 'Nocturne Op. 9 No. 2',
  composer: 'F. Chopin',
  license: 'public-domain',
  difficulty: 4,
  bpm: 66,
  beatsPerMeasure: 12,
  key: 'Eb major',
  attribution: {
    es: 'Tema de apertura simplificado · dominio público',
    en: 'Simplified opening theme · public domain',
  },
  notes: melody([
    [70, 1.5], [75, 0.5], [74, 1], [72, 1],
    [70, 1.5], [72, 0.5], [70, 1], [67, 1],
    [68, 1], [70, 1], [67, 1], [63, 1],
    [70, 1], [74, 1], [75, 2],
  ]),
};
