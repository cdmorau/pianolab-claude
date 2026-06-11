import { useTranslation } from 'react-i18next';
import { PianoKeyboard } from '@/components/Piano/PianoKeyboard';
import { PianoControls } from '@/components/Piano/PianoControls';
import { useUi } from '@/state/uiStore';
import { useSettings } from '@/state/settingsStore';
import { getPianoSize } from '@/data/pianoSizes';

const FEATURES: { icon: string; titleKey: string; descKey: string }[] = [
  { icon: '📖', titleKey: 'home.feature.theoryTitle', descKey: 'home.feature.theoryDesc' },
  { icon: '🎤', titleKey: 'home.feature.micTitle', descKey: 'home.feature.micDesc' },
  { icon: '🖐️', titleKey: 'home.feature.fingersTitle', descKey: 'home.feature.fingersDesc' },
  { icon: '🎯', titleKey: 'home.feature.challengesTitle', descKey: 'home.feature.challengesDesc' },
  { icon: '⭐', titleKey: 'home.feature.fallingTitle', descKey: 'home.feature.fallingDesc' },
  { icon: '🎼', titleKey: 'home.feature.repertoireTitle', descKey: 'home.feature.repertoireDesc' },
];

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useUi((s) => s.navigate);
  const pianoKeys = useSettings((s) => s.pianoKeys);
  const size = getPianoSize(pianoKeys);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-4 pt-6 text-center">
        <span className="text-6xl">🎹</span>
        <h1 className="bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
          {t('home.tagline')}
        </h1>
        <p className="max-w-2xl text-lg text-slate-500">{t('home.subtitle')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button className="btn-primary text-base" onClick={() => navigate('theory')}>
            {t('home.ctaStart')}
          </button>
          <button className="btn-ghost text-base" onClick={() => navigate('repertoire')}>
            {t('home.ctaRepertoire')}
          </button>
        </div>
      </section>

      <section className="card flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">🎹 {t('piano.freePlay')}</h2>
          <PianoControls />
        </div>
        <PianoKeyboard
          startMidi={size.startMidi}
          endMidi={size.endMidi}
          enablePcKeyboard
          className="bg-slate-200/40 p-1 dark:bg-slate-900/40"
        />
        <p className="text-center text-xs text-slate-500">{t('challenges.useInput')}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-center text-2xl font-bold">{t('home.featuresTitle')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.titleKey} className="card flex flex-col gap-2">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold">{t(f.titleKey)}</h3>
              <p className="text-sm text-slate-500">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-slate-400">🔒 {t('home.privacyNote')}</p>
    </div>
  );
}
