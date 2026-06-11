import type { Finger, Hand } from './music';

/** A single timed note within a song, measured in beats. */
export interface NoteEvent {
  /** MIDI note number (e.g. 60 = middle C / C4). */
  midi: number;
  /** Start time in beats from the beginning of the song. */
  startBeat: number;
  /** Duration in beats. */
  durationBeats: number;
  /** Which hand plays this note. */
  hand: Hand;
  /** Suggested finger, when known. */
  finger?: Finger;
}

/** License / provenance of a piece, used for badges and attribution. */
export type SongLicense = 'public-domain' | 'personal-use' | 'user-imported';

/** Difficulty grading from 1 (easiest) to 5 (hardest). */
export type SongDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Song {
  id: string;
  title: string;
  composer: string;
  license: SongLicense;
  difficulty: SongDifficulty;
  /** Tempo in beats per minute. */
  bpm: number;
  /** Beats per measure, used to draw bar lines in the falling-notes view. */
  beatsPerMeasure: number;
  /** Human-readable key, e.g. "C major" / "Eb major". */
  key: string;
  notes: NoteEvent[];
  /** Optional note shown under the title (e.g. attribution / arrangement note). */
  attribution?: { es: string; en: string };
}
