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
      es: 'Conoce las teclas blancas, las negras y cómo se llaman las notas en un piano de 88 teclas.',
      en: 'Meet the white keys, the black keys and the note names on an 88-key piano.',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'Un piano completo tiene 88 teclas, pero solo necesitas aprender un patrón de 12 que se repite: 7 teclas blancas y 5 negras. Ese patrón es una "octava".',
          en: 'A full piano has 88 keys, but you only need to learn one repeating pattern of 12: 7 white keys and 5 black keys. That pattern is one "octave".',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'Las 7 teclas blancas se llaman Do, Re, Mi, Fa, Sol, La, Si (C, D, E, F, G, A, B). Escúchalas.',
          en: 'The 7 white keys are C, D, E, F, G, A, B. Listen to them.',
        },
        notes: [60, 62, 64, 65, 67, 69, 71, 72],
        showStaff: true,
      },
      {
        type: 'text',
        content: {
          es: 'Para orientarte en todo el teclado: el grupo de DOS teclas negras tiene a "Do" (C) justo a su izquierda; el grupo de TRES tiene a "Fa" (F) a su izquierda. Ese truco funciona en cualquier octava.',
          en: 'To orient yourself across the whole keyboard: the group of TWO black keys has "C" right to its left; the group of THREE has "F" to its left. This trick works in every octave.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'El mismo "Do" aparece muchas veces a lo largo del piano. Aquí suenan los Do de varias octavas (Do2 a Do6): la misma nota, más grave o más aguda.',
          en: 'The same "C" appears many times across the piano. Here are the C\'s from several octaves (C2 to C6): the same note, lower or higher.',
        },
        notes: [36, 48, 60, 72, 84],
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
          es: '¿Cuántas teclas tiene un piano completo?',
          en: 'How many keys does a full piano have?',
        },
        options: [
          { es: '61', en: '61' },
          { es: '76', en: '76' },
          { es: '88', en: '88' },
          { es: '100', en: '100' },
        ],
        correctIndex: 2,
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
    id: 'octaves-registers',
    emoji: '🪜',
    difficulty: 1,
    xp: 20,
    title: { es: 'Octavas y registros', en: 'Octaves and registers' },
    summary: {
      es: 'Por qué la misma nota se repite y cómo se reparten los graves y agudos en el teclado.',
      en: 'Why the same note repeats and how low and high registers spread across the keyboard.',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'Una octava es la distancia entre una nota y la siguiente con el mismo nombre (por ejemplo, de Do a Do). Al subir una octava, la frecuencia se duplica: suena "igual" pero más aguda.',
          en: 'An octave is the distance between a note and the next note with the same name (for example, C to C). Going up an octave doubles the frequency: it sounds "the same" but higher.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'Escucha Do4 (el Do central) y luego Do5, una octava más arriba.',
          en: 'Hear C4 (middle C) and then C5, one octave higher.',
        },
        notes: [60, 72],
      },
      {
        type: 'text',
        content: {
          es: 'La mano izquierda suele tocar los graves (parte baja del teclado) y la derecha los agudos (parte alta). El Do central (Do4) es el punto de referencia entre ambas.',
          en: 'The left hand usually plays the low register (left side of the keyboard) and the right hand the high register (right side). Middle C (C4) is the reference point between them.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'Un grave (Do2), el Do central (Do4) y un agudo (Do6): el mismo nombre en tres registros.',
          en: 'A low note (C2), middle C (C4) and a high note (C6): the same name in three registers.',
        },
        notes: [36, 60, 84],
      },
      {
        type: 'quiz',
        question: {
          es: 'Si subes una octava, la frecuencia de la nota…',
          en: 'If you go up one octave, the note\'s frequency…',
        },
        options: [
          { es: 'se duplica', en: 'doubles' },
          { es: 'se reduce a la mitad', en: 'halves' },
          { es: 'no cambia', en: 'stays the same' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'tones-semitones',
    emoji: '📏',
    difficulty: 1,
    xp: 20,
    title: { es: 'Tonos y semitonos', en: 'Whole steps and half steps' },
    summary: {
      es: 'La unidad básica de distancia entre notas, la base de escalas y acordes.',
      en: 'The basic unit of distance between notes — the foundation of scales and chords.',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'Un semitono es la distancia más pequeña: de una tecla a la inmediatamente siguiente (blanca o negra). Un tono equivale a dos semitonos.',
          en: 'A half step (semitone) is the smallest distance: from one key to the very next one (white or black). A whole step (tone) equals two half steps.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'Semitono: Do → Do♯ (teclas contiguas).',
          en: 'Half step: C → C♯ (adjacent keys).',
        },
        notes: [60, 61],
      },
      {
        type: 'demo',
        content: {
          es: 'Tono: Do → Re (saltando la tecla negra del medio).',
          en: 'Whole step: C → D (skipping the black key in between).',
        },
        notes: [60, 62],
      },
      {
        type: 'text',
        content: {
          es: 'Ojo: entre Mi–Fa y entre Si–Do NO hay tecla negra; esos pares de teclas blancas están a solo un semitono.',
          en: 'Watch out: there is NO black key between E–F or between B–C; those white-key pairs are only a half step apart.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'Mi → Fa: dos teclas blancas seguidas, pero a un semitono.',
          en: 'E → F: two adjacent white keys, but only a half step apart.',
        },
        notes: [64, 65],
      },
      {
        type: 'quiz',
        question: {
          es: '¿Cuántos semitonos hay en un tono?',
          en: 'How many half steps are in a whole step?',
        },
        options: [
          { es: '1', en: '1' },
          { es: '2', en: '2' },
          { es: '3', en: '3' },
        ],
        correctIndex: 1,
      },
      {
        type: 'quiz',
        question: {
          es: 'Entre Mi y Fa hay…',
          en: 'Between E and F there is…',
        },
        options: [
          { es: 'un semitono', en: 'a half step' },
          { es: 'un tono', en: 'a whole step' },
          { es: 'una tecla negra', en: 'a black key' },
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
    id: 'major-scales-others',
    emoji: '🔑',
    difficulty: 2,
    xp: 25,
    title: { es: 'Escalas mayores en otras tónicas', en: 'Major scales in other keys' },
    summary: {
      es: 'El mismo patrón mayor desde Sol obliga a usar Fa♯: así nacen las tonalidades.',
      en: 'The same major pattern from G forces an F♯ — that\'s how keys are born.',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'La escala mayor siempre usa el patrón T-T-S-T-T-T-S. Si empiezas en otra nota, necesitarás teclas negras para mantener ese patrón.',
          en: 'A major scale always uses the W-W-H-W-W-W-H pattern. Start on a different note and you\'ll need black keys to keep that pattern.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'Escala de Sol mayor: Sol La Si Do Re Mi Fa♯ Sol. El Fa♯ (tecla negra) es necesario para que el patrón cuadre. Digitación 1-2-3-1-2-3-4-5.',
          en: 'G major scale: G A B C D E F♯ G. The F♯ (a black key) is needed to make the pattern fit. Fingering 1-2-3-1-2-3-4-5.',
        },
        notes: [67, 69, 71, 72, 74, 76, 78, 79],
        fingers: [1, 2, 3, 1, 2, 3, 4, 5],
        showStaff: true,
      },
      {
        type: 'text',
        content: {
          es: 'Por eso decimos que "Sol mayor tiene un sostenido (Fa♯)". Cada tonalidad mayor tiene su propia colección de sostenidos o bemoles, llamada armadura.',
          en: 'That\'s why we say "G major has one sharp (F♯)". Each major key has its own set of sharps or flats, called the key signature.',
        },
      },
      {
        type: 'quiz',
        question: {
          es: '¿Qué nota alterada necesita la escala de Sol mayor?',
          en: 'Which altered note does the G major scale need?',
        },
        options: [
          { es: 'Fa♯', en: 'F♯' },
          { es: 'Do♯', en: 'C♯' },
          { es: 'Si♭', en: 'B♭' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'intervals',
    emoji: '📐',
    difficulty: 2,
    xp: 25,
    title: { es: 'Intervalos', en: 'Intervals' },
    summary: {
      es: 'La distancia entre dos notas: terceras, quintas y octavas, los ladrillos de la armonía.',
      en: 'The distance between two notes: thirds, fifths and octaves — the bricks of harmony.',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'Un intervalo es la distancia entre dos notas. Se cuentan por grados: de Do a Mi hay una tercera (Do-Re-Mi), de Do a Sol una quinta, y de Do a Do una octava.',
          en: 'An interval is the distance between two notes, counted in steps: C to E is a third (C-D-E), C to G is a fifth, and C to C is an octave.',
        },
      },
      {
        type: 'demo',
        content: { es: 'Tercera mayor: Do + Mi.', en: 'Major third: C + E.' },
        notes: [60, 64],
        chord: true,
        showStaff: true,
      },
      {
        type: 'demo',
        content: { es: 'Quinta justa: Do + Sol. Suena estable y "abierta".', en: 'Perfect fifth: C + G. It sounds stable and "open".' },
        notes: [60, 67],
        chord: true,
        showStaff: true,
      },
      {
        type: 'demo',
        content: { es: 'Octava: Do + Do. La misma nota en dos registros.', en: 'Octave: C + C. The same note in two registers.' },
        notes: [60, 72],
        chord: true,
      },
      {
        type: 'quiz',
        question: { es: 'De Do a Sol, ¿qué intervalo hay?', en: 'From C to G, what interval is it?' },
        options: [
          { es: 'Tercera', en: 'Third' },
          { es: 'Quinta', en: 'Fifth' },
          { es: 'Octava', en: 'Octave' },
        ],
        correctIndex: 1,
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
        content: { es: 'Acorde de Fa mayor: Fa-La-Do (mismos dedos 1-3-5).', en: 'F major chord: F-A-C (same fingers 1-3-5).' },
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
        question: { es: 'Un acorde mayor se forma con…', en: 'A major chord is built from…' },
        options: [
          { es: 'Tónica, tercera mayor y quinta justa', en: 'Root, major third and perfect fifth' },
          { es: 'Dos notas seguidas', en: 'Two adjacent notes' },
          { es: 'Todas las teclas negras', en: 'All the black keys' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'chord-inversions',
    emoji: '🔄',
    difficulty: 3,
    xp: 30,
    title: { es: 'Inversiones de acordes', en: 'Chord inversions' },
    summary: {
      es: 'Las mismas notas en distinto orden para encadenar acordes con menos saltos.',
      en: 'The same notes in a different order, to link chords with smaller jumps.',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'Un acorde se puede tocar con cualquiera de sus notas en la parte baja. Eso son las inversiones, y sirven para moverte suavemente entre acordes.',
          en: 'A chord can be played with any of its notes on the bottom. Those are inversions, and they let you move smoothly between chords.',
        },
      },
      {
        type: 'demo',
        content: { es: 'Do mayor en estado fundamental: Do-Mi-Sol.', en: 'C major in root position: C-E-G.' },
        notes: [60, 64, 67],
        fingers: [1, 3, 5],
        chord: true,
        showStaff: true,
      },
      {
        type: 'demo',
        content: { es: 'Primera inversión: Mi-Sol-Do (la tercera abajo).', en: 'First inversion: E-G-C (the third on the bottom).' },
        notes: [64, 67, 72],
        fingers: [1, 2, 5],
        chord: true,
      },
      {
        type: 'demo',
        content: { es: 'Segunda inversión: Sol-Do-Mi (la quinta abajo).', en: 'Second inversion: G-C-E (the fifth on the bottom).' },
        notes: [67, 72, 76],
        fingers: [1, 3, 5],
        chord: true,
      },
      {
        type: 'quiz',
        question: {
          es: 'Las tres notas Mi-Sol-Do son…',
          en: 'The three notes E-G-C are…',
        },
        options: [
          { es: 'Do mayor en primera inversión', en: 'C major in first inversion' },
          { es: 'un acorde de Mi', en: 'an E chord' },
          { es: 'una escala', en: 'a scale' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'chord-progressions',
    emoji: '🔗',
    difficulty: 3,
    xp: 30,
    title: { es: 'Progresiones de acordes', en: 'Chord progressions' },
    summary: {
      es: 'I-IV-V y I-V-vi-IV: las secuencias que sostienen casi todo el pop.',
      en: 'I-IV-V and I-V-vi-IV: the sequences behind almost all of pop.',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'Los acordes de una tonalidad se numeran con romanos. En Do mayor: I=Do, IV=Fa, V=Sol, vi=La menor. Encadenarlos crea progresiones.',
          en: 'The chords of a key are numbered with Roman numerals. In C major: I=C, IV=F, V=G, vi=A minor. Linking them creates progressions.',
        },
      },
      {
        type: 'demo',
        content: { es: 'Progresión I–IV–V–I en Do: Do, Fa, Sol, Do.', en: 'I–IV–V–I progression in C: C, F, G, C.' },
        notes: [60, 65, 67, 60],
      },
      {
        type: 'text',
        content: {
          es: 'La progresión I–V–vi–IV (Do–Sol–Lam–Fa) aparece en cientos de éxitos. Pruébala tocando cada acorde completo.',
          en: 'The I–V–vi–IV progression (C–G–Am–F) shows up in hundreds of hits. Try it by playing each full chord.',
        },
      },
      {
        type: 'demo',
        content: { es: 'La menor (Lam): La-Do-Mi. Es el vi de Do mayor.', en: 'A minor (Am): A-C-E. It is the vi of C major.' },
        notes: [57, 60, 64],
        chord: true,
        showStaff: true,
      },
      {
        type: 'quiz',
        question: { es: 'En Do mayor, el acorde V es…', en: 'In C major, the V chord is…' },
        options: [
          { es: 'Sol', en: 'G' },
          { es: 'Fa', en: 'F' },
          { es: 'La menor', en: 'A minor' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'reading-staff',
    emoji: '📜',
    difficulty: 3,
    xp: 30,
    title: { es: 'Leer el pentagrama', en: 'Reading the staff' },
    summary: {
      es: 'Las claves de Sol y Fa, el Do central y cómo se ubican las notas en las líneas.',
      en: 'The treble and bass clefs, middle C, and how notes sit on the lines.',
    },
    blocks: [
      {
        type: 'text',
        content: {
          es: 'La música se escribe en un pentagrama (5 líneas). La clave de Sol (𝄞) se usa para los agudos —típicamente la mano derecha— y la clave de Fa (𝄢) para los graves —la mano izquierda—.',
          en: 'Music is written on a staff (5 lines). The treble clef (𝄞) is used for high notes —usually the right hand— and the bass clef (𝄢) for low notes —the left hand—.',
        },
      },
      {
        type: 'demo',
        content: {
          es: 'En clave de Sol, estas son las notas Do Re Mi Fa Sol La Si Do (desde el Do central). Observa cómo suben por líneas y espacios.',
          en: 'In treble clef these are C D E F G A B C (from middle C). Watch how they climb through lines and spaces.',
        },
        notes: [60, 62, 64, 65, 67, 69, 71, 72],
        showStaff: true,
      },
      {
        type: 'text',
        content: {
          es: 'El Do central (Do4) está justo entre las dos claves: se escribe con una pequeña línea adicional (línea suplementaria) debajo de la clave de Sol o encima de la de Fa.',
          en: 'Middle C (C4) sits right between the two clefs: it is written with a small extra line (a ledger line) below the treble clef or above the bass clef.',
        },
      },
      {
        type: 'quiz',
        question: { es: '¿Para qué mano se usa normalmente la clave de Fa?', en: 'Which hand normally uses the bass clef?' },
        options: [
          { es: 'La izquierda (graves)', en: 'The left hand (low notes)' },
          { es: 'La derecha (agudos)', en: 'The right hand (high notes)' },
        ],
        correctIndex: 0,
      },
    ],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
