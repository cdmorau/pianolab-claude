import { useTranslation } from 'react-i18next';
import { useUi, type View } from '@/state/uiStore';
import { useSettings } from '@/state/settingsStore';
import { useProgress, levelFromXp } from '@/state/progressStore';

const NAV: { view: View; key: string; icon: string }[] = [
  { view: 'home', key: 'nav.home', icon: '🏠' },
  { view: 'theory', key: 'nav.theory', icon: '📖' },
  { view: 'challenges', key: 'nav.challenges', icon: '🎯' },
  { view: 'repertoire', key: 'nav.repertoire', icon: '🎼' },
  { view: 'progress', key: 'nav.progress', icon: '📈' },
];

export function Header() {
  const { t } = useTranslation();
  const { view, navigate } = useUi();
  const language = useSettings((s) => s.language);
  const toggleLanguage = useSettings((s) => s.toggleLanguage);
  const theme = useSettings((s) => s.theme);
  const toggleTheme = useSettings((s) => s.toggleTheme);
  const level = useProgress((s) => levelFromXp(s.xp));

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <button className="flex items-center gap-2 font-extrabold" onClick={() => navigate('home')}>
          <span className="text-2xl">🎹</span>
          <span className="hidden sm:inline">{t('common.appName')}</span>
        </button>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                view === item.view
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              <span className="hidden md:inline">{t(item.key)}</span>
            </button>
          ))}
        </nav>

        <span className="chip hidden bg-brand-500/15 text-brand-300 sm:inline-flex">⚡ {t('progress.level')} {level}</span>

        <button
          onClick={toggleLanguage}
          className="rounded-lg px-2 py-1 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={t('common.language')}
        >
          {language.toUpperCase()}
        </button>
        <button
          onClick={toggleTheme}
          className="rounded-lg px-2 py-1 text-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          aria-label={t('common.theme')}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}
