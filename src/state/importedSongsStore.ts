import { create } from 'zustand';
import type { Song } from '@/types/song';

/**
 * In-memory store for songs the user imports from local MIDI files.
 * Intentionally NOT persisted: imported files stay in the browser session and
 * are never uploaded or written to disk by the app.
 */
interface ImportedSongsState {
  songs: Song[];
  add: (song: Song) => void;
  remove: (id: string) => void;
}

export const useImportedSongs = create<ImportedSongsState>((set) => ({
  songs: [],
  add: (song) => set((s) => ({ songs: [...s.songs.filter((x) => x.id !== song.id), song] })),
  remove: (id) => set((s) => ({ songs: s.songs.filter((x) => x.id !== id) })),
}));
