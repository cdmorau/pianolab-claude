import type { Finger } from '@/types/music';

export interface Bilingual {
  es: string;
  en: string;
}

export type LessonBlock =
  | { type: 'text'; content: Bilingual }
  | { type: 'heading'; content: Bilingual }
  | {
      type: 'demo';
      content: Bilingual;
      /** Notes to highlight + play (in order). */
      notes: number[];
      fingers?: Finger[];
      /** Render notes simultaneously (chord) instead of as a sequence. */
      chord?: boolean;
      showStaff?: boolean;
    }
  | {
      type: 'quiz';
      question: Bilingual;
      options: Bilingual[];
      correctIndex: number;
      explanation?: Bilingual;
    };

export interface Lesson {
  id: string;
  title: Bilingual;
  summary: Bilingual;
  emoji: string;
  difficulty: 1 | 2 | 3;
  xp: number;
  blocks: LessonBlock[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'keyboard-and-notes',
    emoji: '🎹',
    difficulty: 1,
    xp: 20,
    title: { es: 'El teclado y los nombres de las notas', en: 'The keyboard and note names' },
    summary: {
      es: 'Conoce las teclas blancas, las negras y cómo se llaman las notas.',
      en: 'Meet the white keys, the black keys and what the notes are called.',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'El piano repite un patrón de 12 teclas: 7 blancas y 5 negras. Ese patrón es una "octava" y se repite a lo largo de todo el teclado.',
          en: 'The piano repeats a pattern of 12 keys: 7 white and 5 black. That pattern is one "octave" and repeats across the whole keyboard.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'Las 7 teclas blancas se llaman Do, Re, Mi, Fa, Sol, La, Si (C, D, E, F, G, A, B). Escúchalas y pruébalas.',
          en: 'The 7 white keys are C, D, E, F, G, A, B. Listen and try them.',
        },
        notes: [60, 62, 64, 65, 67, 69, 71, 72],
        showStaff: true,
      },
      {
        type: 'text',
        content: {
          es: 'Para ubicarte: el grupo de DOS teclas negras tiene a "Do" (C) justo a su izquierda. El grupo de TRES teclas negras tiene a "Fa" (F) a su izquierda.',
          en: 'A landmark: the group of TWO black keys has "C" right to its left. The group of THREE black keys has "F" to its left.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'Las teclas negras son los sostenidos (♯) y bemoles (♭). Por ejemplo, entre Do y Re está Do♯ / Re♭.',
          en: 'The black keys are the sharps (♯) and flats (♭). For example, between C and D sits C♯ / D♭.',
        },
        notes: [60, 61, 62],
      },
      {
        type: 'quiz',
        question: {
          es: '¿Cuántas teclas blancas hay en una octava?',
          en: 'How many white keys are there in one octave?',
        },
        options: [
          { es: '5', en: '5' },
          { es: '7', en: '7' },
          { es: '8', en: '8' },
          { es: '12', en: '12' },
        ],
        correctIndex: 1,
        explanation: {
          es: '7 blancas (Do Re Mi Fa Sol La Si) + 5 negras = 12 teclas por octava.',
          en: '7 white (C D E F G A B) + 5 black = 12 keys per octave.',
        },
      },
      {
        type: 'quiz',
        question: {
          es: 'La tecla blanca justo a la izquierda de las DOS teclas negras es…',
          en: 'The white key just to the left of the group of TWO black keys is…',
        },
        options: [
          { es: 'Do (C)', en: 'C' },
          { es: 'Fa (F)', en: 'F' },
          { es: 'Sol (G)', en: 'G' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'c-major-scale',
    emoji: '🎵',
    difficulty: 2,
    xp: 25,
    title: { es: 'La escala de Do mayor y la digitación', en: 'The C major scale and fingering' },
    summary: {
      es: 'Tu primera escala, con el patrón de tonos y el famoso "paso del pulgar".',
      en: 'Your first scale, with the tone pattern and the famous "thumb-under".',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'Una escala mayor sigue el patrón Tono-Tono-Semitono-Tono-Tono-Tono-Semitono. En Do mayor son todas las teclas blancas: Do Re Mi Fa Sol La Si Do.',
          en: 'A major scale follows the pattern Whole-Whole-Half-Whole-Whole-Whole-Half. In C major those are all the white keys: C D E F G A B C.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'Mano derecha: usa los dedos 1-2-3-1-2-3-4-5. Fíjate cómo el pulgar (1) pasa por debajo después del Mi.',
          en: 'Right hand: use fingers 1-2-3-1-2-3-4-5. Notice how the thumb (1) tucks under after E.',
        },
        notes: [60, 62, 64, 65, 67, 69, 71, 72],
        fingers: [1, 2, 3, 1, 2, 3, 4, 5],
        showStaff: true,
      },
      {
        type: 'text',
        content: {
          es: 'El "paso del pulgar" es la técnica clave: tras tocar Mi con el dedo 3, el pulgar cruza por debajo para tocar Fa y seguir la escala con fluidez.',
          en: 'The "thumb-under" is the key technique: after playing E with finger 3, the thumb crosses under to play F and continue the scale smoothly.',
        },
      },
      {
        type: 'quiz',
        question: {
          es: 'En la escala de Do mayor (mano derecha), ¿con qué dedo empiezas en Do?',
          en: 'In the C major scale (right hand), which finger starts on C?',
        },
        options: [
          { es: 'Pulgar (1)', en: 'Thumb (1)' },
          { es: 'Medio (3)', en: 'Middle (3)' },
          { es: 'Meñique (5)', en: 'Pinky (5)' },
        ],
        correctIndex: 0,
      },
      {
        type: 'quiz',
        question: {
          es: '¿Qué patrón de pasos define una escala mayor?',
          en: 'Which step pattern defines a major scale?',
        },
        options: [
          { es: 'T-T-S-T-T-T-S', en: 'W-W-H-W-W-W-H' },
          { es: 'T-S-T-T-S-T-T', en: 'W-H-W-W-H-W-W' },
          { es: 'Todos tonos', en: 'All whole steps' },
        ],
        correctIndex: 0,
        explanation: {
          es: 'Tono-Tono-Semitono-Tono-Tono-Tono-Semitono (T=tono, S=semitono).',
          en: 'Whole-Whole-Half-Whole-Whole-Whole-Half (W=whole, H=half).',
        },
      },
    ],
  },
  {
    id: 'basic-triads',
    emoji: '🎶',
    difficulty: 2,
    xp: 25,
    title: { es: 'Acordes tríada básicos', en: 'Basic triads' },
    summary: {
      es: 'Construye los acordes de Do, Fa y Sol mayor: la base de miles de canciones.',
      en: 'Build the C, F and G major chords: the foundation of thousands of songs.',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'Un acorde mayor (tríada) se forma con tres notas: la tónica, una tercera mayor encima y una quinta justa. Suenan a la vez.',
          en: 'A major chord (triad) is built from three notes: the root, a major third above, and a perfect fifth. They sound together.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'Acorde de Do mayor: Do-Mi-Sol, con los dedos 1-3-5 de la mano derecha.',
          en: 'C major chord: C-E-G, with right-hand fingers 1-3-5.',
        },
        notes: [60, 64, 67],
        fingers: [1, 3, 5],
        chord: true,
        showStaff: true,
      },
      {
        type: 'demo',
        content: {
          es: 'Acorde de Fa mayor: Fa-La-Do (mismos dedos 1-3-5).',
          en: 'F major chord: F-A-C (same fingers 1-3-5).',
        },
        notes: [65, 69, 72],
        fingers: [1, 3, 5],
        chord: true,
      },
      {
        type: 'demo',
        content: {
          es: 'Acorde de Sol mayor: Sol-Si-Re. Con Do, Fa y Sol ya puedes acompañar muchísimas canciones.',
          en: 'G major chord: G-B-D. With C, F and G you can already accompany tons of songs.',
        },
        notes: [67, 71, 74],
        fingers: [1, 3, 5],
        chord: true,
      },
      {
        type: 'quiz',
        question: {
          es: 'Un acorde mayor se forma con…',
          en: 'A major chord is built from…',
        },
        options: [
          { es: 'Tónica, tercera mayor y quinta justa', en: 'Root, major third and perfect fifth' },
          { es: 'Dos notas seguidas', en: 'Two adjacent notes' },
          { es: 'Todas las teclas negras', en: 'All the black keys' },
        ],
        correctIndex: 0,
      },
    ],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
