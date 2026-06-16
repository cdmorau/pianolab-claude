import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Layout/Header';
import { HomePage } from '@/features/home/HomePage';
import { TheoryPage } from '@/features/theory/TheoryPage';
import { ChallengesPage } from '@/features/challenges/ChallengesPage';
import { RepertoirePage } from '@/features/repertoire/RepertoirePage';
import { MidiToolsPage } from '@/features/miditools/MidiToolsPage';
import { ProgressPage } from '@/features/progress/ProgressPage';
import { useUi } from '@/state/uiStore';

export default function App() {
  const { t } = useTranslation();
  const view = useUi((s) => s.view);

  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === 'home' && <HomePage />}
        {view === 'theory' && <TheoryPage />}
        {view === 'challenges' && <ChallengesPage />}
        {view === 'repertoire' && <RepertoirePage />}
        {view === 'miditools' && <MidiToolsPage />}
        {view === 'progress' && <ProgressPage />}
      </main>
      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-400">
        🎹 {t('common.appName')} · MIT · Tone.js · Pitchy · VexFlow · {t('home.privacyNote')}
      </footer>
    </div>
  );
}
