import { create } from 'zustand';

export type View = 'home' | 'theory' | 'challenges' | 'repertoire' | 'progress' | 'miditools';

interface UiState {
  view: View;
  /** Selected detail id (lesson id, challenge id, or song id) within a view. */
  detailId: string | null;
  navigate: (view: View, detailId?: string | null) => void;
  openDetail: (detailId: string) => void;
  closeDetail: () => void;
}

export const useUi = create<UiState>((set) => ({
  view: 'home',
  detailId: null,
  navigate: (view, detailId = null) => {
    set({ view, detailId });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  },
  openDetail: (detailId) => set({ detailId }),
  closeDetail: () => set({ detailId: null }),
}));
