import { useTranslation } from 'react-i18next';
import { CHALLENGES, getChallenge } from '@/data/challenges';
import { useSettings } from '@/state/settingsStore';
import { useProgress } from '@/state/progressStore';
import { useUi } from '@/state/uiStore';
import { ChallengeRunner } from './ChallengeRunner';

export function ChallengesPage() {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const challengeStars = useProgress((s) => s.challengeStars);
  const { detailId, openDetail, closeDetail } = useUi();

  const challenge = detailId ? getChallenge(detailId) : undefined;
  if (challenge) return <ChallengeRunner challenge={challenge} onExit={closeDetail} />;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl font-extrabold">{t('challenges.title')}</h1>
        <p className="text-slate-500">{t('challenges.subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHALLENGES.map((c) => {
          const stars = challengeStars[c.id] ?? 0;
          return (
            <button
              key={c.id}
              onClick={() => openDetail(c.id)}
              className="card flex flex-col items-start gap-2 text-left transition-transform hover:-translate-y-1"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-sm" aria-label={`${stars} stars`}>
                  {[1, 2, 3].map((s) => (
                    <span key={s}>{s <= stars ? '⭐' : '☆'}</span>
                  ))}
                </span>
              </div>
              <h2 className="text-lg font-bold">{c.title[language]}</h2>
              <p className="text-sm text-slate-500">{c.description[language]}</p>
              <span className="mt-2 text-xs font-semibold text-brand-400">
                {t('challenges.startChallenge')} →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
