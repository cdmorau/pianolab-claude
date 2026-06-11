import type { Song } from '@/types/song';
import { melody } from './_util';

/** "Twinkle Twinkle Little Star" — traditional, public domain. */
export const twinkle: Song = {
  id: 'twinkle',
  title: 'Twinkle Twinkle Little Star',
  composer: 'Traditional',
  license: 'public-domain',
  difficulty: 1,
  bpm: 100,
  beatsPerMeasure: 4,
  key: 'C major',
  notes: melody([
    [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2],
    [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
  ]),
};
