import { useTranslation } from 'react-i18next';
import { useProgress, levelFromXp, xpToNextLevel, levelProgress } from '@/state/progressStore';
import { LESSONS } from '@/data/lessons';
import { CHALLENGES } from '@/data/challenges';
import { SONGS } from '@/data/songs';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-3xl font-extrabold text-brand-300">{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}

export function ProgressPage() {
  const { t } = useTranslation();
  const progress = useProgress();
  const level = levelFromXp(progress.xp);
  const toNext = xpToNextLevel(progress.xp);
  const pct = Math.round(levelProgress(progress.xp) * 100);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl font-extrabold">{t('progress.title')}</h1>
        <p className="text-slate-500">{t('progress.subtitle')}</p>
      </header>

      <div className="card flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-500">{t('progress.level')}</span>
            <div className="text-5xl font-black text-brand-400">{level}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums">{progress.xp} XP</div>
            <div className="text-xs text-slate-500">
              {toNext} {t('progress.xpToNext')}
            </div>
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('progress.streak')} value={`🔥 ${progress.streakDays}`} sub={progress.streakDays === 1 ? t('progress.day') : t('progress.days')} />
        <StatCard label={t('progress.stars')} value={`⭐ ${progress.totalStars}`} />
        <StatCard
          label={t('progress.lessonsDone')}
          value={`${progress.completedLessons.length}/${LESSONS.length}`}
        />
        <StatCard
          label={t('progress.challengesDone')}
          value={`${progress.completedChallenges.length}/${CHALLENGES.length}`}
        />
      </div>

      <StatCard
        label={t('progress.songsPlayed')}
        value={`${progress.playedSongs.length}/${SONGS.length}+`}
      />

      <button
        className="btn-ghost w-fit text-wrong"
        onClick={() => {
          if (window.confirm(t('progress.resetConfirm'))) progress.reset();
        }}
      >
        {t('progress.resetProgress')}
      </button>
    </div>
  );
}
