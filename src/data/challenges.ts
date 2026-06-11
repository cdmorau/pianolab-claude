import type { Bilingual } from './lessons';
import { C_MAJOR, scaleNotes } from './scales';
import { TRIADS } from './chords';
import { isBlackKey } from '@/audio/notes';

export type ChallengeKind = 'note' | 'scale' | 'ear' | 'chord' | 'melody';

export interface ChallengeStep {
  mode: 'single' | 'sequence' | 'chord';
  /** Target MIDI notes. single=1 note, sequence=ordered, chord=set. */
  targets: number[];
  fingers?: (number | undefined)[];
  /** Hide the target (ear training): the app plays it, the user reproduces it. */
  hidden?: boolean;
  /** Short label, e.g. a chord symbol. */
  label?: string;
}

export interface Challenge {
  id: string;
  emoji: string;
  kind: ChallengeKind;
  difficulty: 1 | 2 | 3;
  xp: number;
  title: Bilingual;
  description: Bilingual;
  rangeStart: number;
  rangeEnd: number;
  /** Build (and randomize) the steps for a fresh attempt. */
  build: () => ChallengeStep[];
}

function randomWhiteNote(lo: number, hi: number): number {
  let n = 0;
  do {
    n = lo + Math.floor(Math.random() * (hi - lo + 1));
  } while (isBlackKey(n));
  return n;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'find-the-note',
    emoji: '🔎',
    kind: 'note',
    difficulty: 1,
    xp: 15,
    title: { es: 'Encuentra la nota', en: 'Find the note' },
    description: {
      es: 'Te mostramos el nombre de una nota y tú la tocas. 5 rondas.',
      en: 'We show a note name and you play it. 5 rounds.',
    },
    rangeStart: 60,
    rangeEnd: 72,
    build: () =>
      Array.from({ length: 5 }, () => ({
        mode: 'single' as const,
        targets: [randomWhiteNote(60, 71)],
      })),
  },
  {
    id: 'c-major-scale',
    emoji: '🎼',
    kind: 'scale',
    difficulty: 2,
    xp: 25,
    title: { es: 'Toca la escala de Do mayor', en: 'Play the C major scale' },
    description: {
      es: 'Toca la escala completa en orden, siguiendo la digitación 1-2-3-1-2-3-4-5.',
      en: 'Play the full scale in order, following the 1-2-3-1-2-3-4-5 fingering.',
    },
    rangeStart: 60,
    rangeEnd: 72,
    build: () => [
      {
        mode: 'sequence',
        targets: scaleNotes(C_MAJOR),
        fingers: C_MAJOR.fingersRH,
      },
    ],
  },
  {
    id: 'ear-training',
    emoji: '👂',
    kind: 'ear',
    difficulty: 2,
    xp: 20,
    title: { es: 'Entrenamiento auditivo', en: 'Ear training' },
    description: {
      es: 'Escucha una nota y tócala. Sin mirar: ¡confía en tu oído! 4 rondas.',
      en: 'Hear a note and play it. No peeking — trust your ear! 4 rounds.',
    },
    rangeStart: 60,
    rangeEnd: 72,
    build: () =>
      Array.from({ length: 4 }, () => ({
        mode: 'single' as const,
        targets: [randomWhiteNote(60, 71)],
        hidden: true,
      })),
  },
  {
    id: 'play-the-chords',
    emoji: '🎹',
    kind: 'chord',
    difficulty: 2,
    xp: 25,
    title: { es: 'Toca los acordes', en: 'Play the chords' },
    description: {
      es: 'Toca las tres notas de cada acorde mayor: Do, Fa y Sol.',
      en: 'Play the three notes of each major chord: C, F and G.',
    },
    rangeStart: 60,
    rangeEnd: 76,
    build: () =>
      TRIADS.map((c) => ({
        mode: 'chord' as const,
        targets: c.midis,
        fingers: c.fingersRH,
        label: c.symbol,
      })),
  },
  {
    id: 'twinkle-melody',
    emoji: '⭐',
    kind: 'melody',
    difficulty: 1,
    xp: 20,
    title: { es: 'Melodía: Estrellita / Twinkle', en: 'Melody: Twinkle Twinkle' },
    description: {
      es: 'Toca la melodía nota a nota con las notas que caen. Modo espera activado.',
      en: 'Play the melody note by note with the falling notes. Wait mode on.',
    },
    rangeStart: 60,
    rangeEnd: 72,
    build: () => {
      // "Twinkle Twinkle Little Star" (traditional, public domain), first phrases.
      const melody = [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60];
      return melody.map((midi) => ({ mode: 'single' as const, targets: [midi] }));
    },
  },
];

export function getChallenge(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
