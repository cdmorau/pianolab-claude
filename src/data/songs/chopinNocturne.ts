import type { Song } from '@/types/song';
import { melody, harmony } from './_util';

/**
 * Nocturne Op. 9 No. 2 — Frédéric Chopin, public domain (composer d. 1849).
 * Two-handed statement of the opening theme in Eb major (right-hand melody over
 * the characteristic left-hand broken-chord bass).
 */
export const chopinNocturne: Song = {
  id: 'chopin-nocturne-op9-no2',
  title: 'Nocturne Op. 9 No. 2',
  composer: 'F. Chopin',
  license: 'public-domain',
  difficulty: 4,
  bpm: 60,
  beatsPerMeasure: 4,
  key: 'Eb major',
  attribution: {
    es: 'Tema principal (arreglo a dos manos) · dominio público',
    en: 'Main theme (two-hand arrangement) · public domain',
  },
  notes: [
    ...melody([
      [70, 1.5], [75, 0.5], [74, 1], [72, 1],
      [70, 1.5], [72, 0.5], [70, 1], [67, 1],
      [68, 1], [70, 1], [75, 1], [74, 1],
      [72, 2], [70, 1], [67, 1],
      [70, 1.5], [75, 0.5], [74, 1], [72, 1],
      [75, 1], [74, 1], [72, 1], [70, 1],
      [68, 2], [67, 2],
    ], 'R'),
    ...harmony(
      [
        [0, [39, 46, 51], 4], // Eb
        [4, [46, 50, 56], 4], // Bb7
        [8, [39, 46, 51], 4], // Eb
        [12, [46, 50, 56], 4], // Bb7
        [16, [39, 46, 51], 4], // Eb
        [20, [46, 50, 56], 4], // Bb7
        [24, [39, 46, 51], 4], // Eb
      ],
      'L',
    ),
  ],
};
