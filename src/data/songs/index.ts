import type { Song } from '@/types/song';
import { twinkle } from './twinkle';
import { odeToJoy } from './odeToJoy';
import { furElise } from './furElise';
import { chopinNocturne } from './chopinNocturne';
import { interstellar } from './interstellar';
import { herPhotograph } from './her';

/** Bundled repertoire, ordered by difficulty. */
export const SONGS: Song[] = [
  twinkle,
  odeToJoy,
  herPhotograph,
  interstellar,
  furElise,
  chopinNocturne,
];

export function getSong(id: string): Song | undefined {
  return SONGS.find((s) => s.id === id);
}

/** Lowest/highest MIDI used by a song, padded to whole octaves for display. */
export function songRange(song: Song): { start: number; end: number } {
  if (song.notes.length === 0) return { start: 60, end: 72 };
  const lo = Math.min(...song.notes.map((n) => n.midi));
  const hi = Math.max(...song.notes.map((n) => n.midi));
  return { start: Math.max(36, lo - 2), end: Math.min(96, hi + 2) };
}
