import type { Song } from '@/types/song';
import { harmony, type HarmonyItem } from './_util';

/**
 * Interstellar — Main Theme
 * Music: Hans Zimmer  ·  Arr.: Patrik Pietschmann
 * 3/4  ·  BPM 100  ·  A minor (no key signature)
 * Personal/educational use  ·  © Hans Zimmer
 *
 * Encoding covers bars 1–39 from the PDF score (intro, main theme A × 2,
 * 8th-note development, and first climax).  Bars 40+ are virtuosic runs
 * not suited for a learning arrangement.
 */

// Beat number for bar n (3/4: each bar = 3 beats).
const b = (bar: number) => (bar - 1) * 3;

// RH broken-chord arpeggio per measure (6 eighth notes in 3/4).
// Pattern: lo – mid – hi – mid – lo – mid
function acc(beat: number, [lo, mid, hi]: readonly [number, number, number]): HarmonyItem[] {
  return [
    [beat,       [lo],  0.5],
    [beat + 0.5, [mid], 0.5],
    [beat + 1,   [hi],  0.5],
    [beat + 1.5, [mid], 0.5],
    [beat + 2,   [lo],  0.5],
    [beat + 2.5, [mid], 0.5],
  ];
}

// RH accompaniment chord tones  [lo, mid, hi]
const ACC_AM = [64, 69, 72] as const; // E4 – A4 – C5
const ACC_F  = [65, 69, 72] as const; // F4 – A4 – C5
const ACC_C  = [64, 67, 72] as const; // E4 – G4 – C5
const ACC_G  = [62, 67, 71] as const; // D4 – G4 – B4

export const interstellar: Song = {
  id: 'interstellar',
  title: 'Interstellar (Main Theme)',
  composer: 'Hans Zimmer',
  license: 'personal-use',
  difficulty: 4,
  bpm: 100,
  beatsPerMeasure: 3,
  key: 'A minor',
  attribution: {
    es: 'Arr. Patrik Pietschmann · uso personal/educativo · © Hans Zimmer',
    en: 'Arr. Patrik Pietschmann · personal/educational use · © Hans Zimmer',
  },
  notes: [
    // ─── RH MELODY (harmony() for absolute beat positioning) ──────────────

    ...harmony([
      // Intro  mm 2–7: sustained melody tones over the ostinato
      [b(2), [79], 3], [b(3), [79], 3],  // G5  (Am)
      [b(4), [77], 3], [b(5), [77], 3],  // F5  (F)
      [b(6), [76], 3],                    // E5  (C)
      [b(7), [74], 3],                    // D5  (G)

      // Main Theme A  mm 8–15  —  half + quarter pattern
      [b(8),    [76], 2], [b(8)  + 2, [74], 1], [b(9),  [72], 3],  // Am
      [b(10),   [74], 2], [b(10) + 2, [76], 1], [b(11), [79], 3],  // F
      [b(12),   [76], 2], [b(12) + 2, [74], 1], [b(13), [72], 3],  // C
      [b(14),   [74], 2], [b(14) + 2, [72], 1], [b(15), [69], 3],  // G → A4

      // Main Theme A2  mm 16–23  —  one step higher
      [b(16),   [79], 2], [b(16) + 2, [81], 1], [b(17), [79], 3],  // Am
      [b(18),   [77], 2], [b(18) + 2, [79], 1], [b(19), [81], 3],  // F
      [b(20),   [79], 2], [b(20) + 2, [77], 1], [b(21), [76], 3],  // C
      [b(22),   [77], 2], [b(22) + 2, [76], 1], [b(23), [74], 3],  // G

      // Development  mm 24–31  —  8th-note runs
      // Am  m.24
      [b(24),       [76], 0.5], [b(24) + 0.5, [74], 0.5], [b(24) + 1,   [72], 0.5],
      [b(24) + 1.5, [74], 0.5], [b(24) + 2,   [76], 0.5], [b(24) + 2.5, [72], 0.5],
      // Am  m.25
      [b(25),       [72], 0.5], [b(25) + 0.5, [74], 0.5], [b(25) + 1,   [76], 0.5],
      [b(25) + 1.5, [79], 0.5], [b(25) + 2,   [76], 0.5], [b(25) + 2.5, [74], 0.5],
      // F   m.26
      [b(26),       [77], 0.5], [b(26) + 0.5, [76], 0.5], [b(26) + 1,   [74], 0.5],
      [b(26) + 1.5, [72], 0.5], [b(26) + 2,   [69], 0.5], [b(26) + 2.5, [71], 0.5],
      // F   m.27
      [b(27),       [72], 0.5], [b(27) + 0.5, [74], 0.5], [b(27) + 1,   [76], 0.5],
      [b(27) + 1.5, [74], 0.5], [b(27) + 2,   [72], 0.5], [b(27) + 2.5, [71], 0.5],
      // C   m.28
      [b(28),       [72], 0.5], [b(28) + 0.5, [71], 0.5], [b(28) + 1,   [69], 0.5],
      [b(28) + 1.5, [71], 0.5], [b(28) + 2,   [72], 0.5], [b(28) + 2.5, [69], 0.5],
      // C   m.29
      [b(29),       [67], 0.5], [b(29) + 0.5, [69], 0.5], [b(29) + 1,   [71], 0.5],
      [b(29) + 1.5, [72], 0.5], [b(29) + 2,   [71], 0.5], [b(29) + 2.5, [69], 0.5],
      // G   m.30
      [b(30),       [71], 0.5], [b(30) + 0.5, [72], 0.5], [b(30) + 1,   [74], 0.5],
      [b(30) + 1.5, [71], 0.5], [b(30) + 2,   [67], 0.5], [b(30) + 2.5, [69], 0.5],
      // G   m.31  — resolution before climax
      [b(31), [79], 3],

      // Climax  mm 32–39  —  peak of the piece
      [b(32),   [81], 2], [b(32) + 2, [79], 1], [b(33), [76], 3],  // Am  A5-G5-E5
      [b(34),   [79], 2], [b(34) + 2, [81], 1], [b(35), [83], 3],  // F   G5-A5-B5
      [b(36),   [81], 2], [b(36) + 2, [79], 1], [b(37), [76], 3],  // C   A5-G5-E5
      [b(38),   [77], 2], [b(38) + 2, [79], 1], [b(39), [76], 3],  // G   F5-G5-E5
    ], 'R', 0.85),

    // ─── RH ACCOMPANIMENT — broken-chord arpeggio, lower voice ───────────

    ...harmony([
      // Bar 1: ostinato only (no melody yet)
      ...acc(b(1), ACC_AM),
      // Intro mm 2–7
      ...acc(b(2), ACC_AM), ...acc(b(3), ACC_AM),
      ...acc(b(4), ACC_F),  ...acc(b(5), ACC_F),
      ...acc(b(6), ACC_C),
      ...acc(b(7), ACC_G),
      // Main Theme A  mm 8–15
      ...acc(b(8),  ACC_AM), ...acc(b(9),  ACC_AM),
      ...acc(b(10), ACC_F),  ...acc(b(11), ACC_F),
      ...acc(b(12), ACC_C),  ...acc(b(13), ACC_C),
      ...acc(b(14), ACC_G),  ...acc(b(15), ACC_G),
      // Main Theme A2  mm 16–23
      ...acc(b(16), ACC_AM), ...acc(b(17), ACC_AM),
      ...acc(b(18), ACC_F),  ...acc(b(19), ACC_F),
      ...acc(b(20), ACC_C),  ...acc(b(21), ACC_C),
      ...acc(b(22), ACC_G),  ...acc(b(23), ACC_G),
      // Development  mm 24–31
      ...acc(b(24), ACC_AM), ...acc(b(25), ACC_AM),
      ...acc(b(26), ACC_F),  ...acc(b(27), ACC_F),
      ...acc(b(28), ACC_C),  ...acc(b(29), ACC_C),
      ...acc(b(30), ACC_G),  ...acc(b(31), ACC_G),
      // Climax  mm 32–39
      ...acc(b(32), ACC_AM), ...acc(b(33), ACC_AM),
      ...acc(b(34), ACC_F),  ...acc(b(35), ACC_F),
      ...acc(b(36), ACC_C),  ...acc(b(37), ACC_C),
      ...acc(b(38), ACC_G),  ...acc(b(39), ACC_G),
    ], 'R', 0.55),

    // ─── LH BASS — dotted-half root chords (2 bars each) ─────────────────

    ...harmony([
      // Intro mm 2–7
      [b(2), [45, 52, 57], 6],  // Am  A2-E3-A3
      [b(4), [41, 48, 53], 6],  // F   F2-C3-F3
      [b(6), [48, 55, 60], 3],  // C   C3-G3-C4
      [b(7), [43, 50, 55], 3],  // G   G2-D3-G3
      // Main Theme A  mm 8–15
      [b(8),  [45, 52, 57], 6], [b(10), [41, 48, 53], 6],
      [b(12), [48, 55, 60], 6], [b(14), [43, 50, 55], 6],
      // Main Theme A2  mm 16–23
      [b(16), [45, 52, 57], 6], [b(18), [41, 48, 53], 6],
      [b(20), [48, 55, 60], 6], [b(22), [43, 50, 55], 6],
      // Development  mm 24–31
      [b(24), [45, 52, 57], 6], [b(26), [41, 48, 53], 6],
      [b(28), [48, 55, 60], 6], [b(30), [43, 50, 55], 6],
      // Climax  mm 32–39
      [b(32), [45, 52, 57], 6], [b(34), [41, 48, 53], 6],
      [b(36), [48, 55, 60], 6], [b(38), [43, 50, 55], 6],
    ], 'L', 0.65),
  ],
};
