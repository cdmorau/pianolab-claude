import { useTranslation } from 'react-i18next';
import { LESSONS, getLesson } from '@/data/lessons';
import { useSettings } from '@/state/settingsStore';
import { useProgress } from '@/state/progressStore';
import { useUi } from '@/state/uiStore';
import { LessonView } from './LessonView';

export function TheoryPage() {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const completedLessons = useProgress((s) => s.completedLessons);
  const { detailId, openDetail, closeDetail } = useUi();

  const lesson = detailId ? getLesson(detailId) : undefined;
  if (lesson) return <LessonView lesson={lesson} onExit={closeDetail} />;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl font-extrabold">{t('theory.title')}</h1>
        <p className="text-slate-500">{t('theory.subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LESSONS.map((l) => {
          const done = completedLessons.includes(l.id);
          return (
            <button
              key={l.id}
              onClick={() => openDetail(l.id)}
              className="card flex flex-col items-start gap-2 text-left transition-transform hover:-translate-y-1"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-3xl">{l.emoji}</span>
                {done && <span className="chip bg-correct/15 text-correct">✓ {t('common.completed')}</span>}
              </div>
              <h2 className="text-lg font-bold">{l.title[language]}</h2>
              <p className="text-sm text-slate-500">{l.summary[language]}</p>
              <span className="mt-2 text-xs font-semibold text-brand-400">{t('theory.startLesson')} →</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
