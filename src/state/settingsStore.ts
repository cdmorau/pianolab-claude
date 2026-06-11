import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n, { type Language } from '@/i18n';
import { setVolume } from '@/audio/engine';

export type Theme = 'light' | 'dark';

interface SettingsState {
  language: Language;
  theme: Theme;
  volume: number; // 0..1
  showFingers: boolean;
  showNoteNames: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setVolume: (volume: number) => void;
  setShowFingers: (show: boolean) => void;
  setShowNoteNames: (show: boolean) => void;
}

/** Apply side-effects of settings to the document / libraries. */
export function applySettings(state: Pick<SettingsState, 'language' | 'theme' | 'volume'>): void {
  void i18n.changeLanguage(state.language);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = state.language;
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }
  setVolume(state.volume);
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'es',
      theme: 'dark',
      volume: 0.8,
      showFingers: true,
      showNoteNames: true,
      setLanguage: (language) => {
        set({ language });
        void i18n.changeLanguage(language);
        if (typeof document !== 'undefined') document.documentElement.lang = language;
      },
      toggleLanguage: () => get().setLanguage(get().language === 'es' ? 'en' : 'es'),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
      setVolume: (volume) => {
        set({ volume });
        setVolume(volume);
      },
      setShowFingers: (showFingers) => set({ showFingers }),
      setShowNoteNames: (showNoteNames) => set({ showNoteNames }),
    }),
    {
      name: 'pianolab-settings',
      onRehydrateStorage: () => (state) => {
        if (state) applySettings(state);
      },
    },
  ),
);
