import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PianoKeyboard } from '@/components/Piano/PianoKeyboard';
import type { KeyDecorations } from '@/components/Piano/types';
import { Staff, type StaffItem } from '@/components/Notation/Staff';
import { playChord, playSequence } from '@/audio/engine';
import { useSettings } from '@/state/settingsStore';
import { useProgress } from '@/state/progressStore';
import { displayRange } from '@/data/pianoSizes';
import type { Lesson, LessonBlock } from '@/data/lessons';
import type { Finger } from '@/types/music';

function DemoBlock({ block }: { block: Extract<LessonBlock, { type: 'demo' }> }) {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const pianoKeys = useSettings((s) => s.pianoKeys);
  const reqLo = Math.min(...block.notes);
  const reqHi = Math.max(...block.notes);
  const range = displayRange(reqLo, reqHi, pianoKeys);
  const focusMidi = Math.round((reqLo + reqHi) / 2);

  const decorations: KeyDecorations = {};
  block.notes.forEach((n, i) => {
    decorations[n] = { highlight: 'target', finger: block.fingers?.[i] as Finger | undefined };
  });

  const staffItems: StaffItem[] = block.showStaff
    ? block.chord
      ? [block.notes]
      : block.notes
    : [];

  return (
    <div className="card flex flex-col gap-3">
      <p>{block.content[language]}</p>
      {staffItems.length > 0 && (
        <div className="flex justify-center">
          <Staff items={staffItems} fingers={block.fingers} />
        </div>
      )}
      <PianoKeyboard
        startMidi={range.start}
        endMidi={range.end}
        focusMidi={focusMidi}
        decorations={decorations}
        forceShowFingers={!!block.fingers}
        sound
      />
      <button
        className="btn-primary w-fit"
        onClick={() => (block.chord ? playChord(block.notes) : playSequence(block.notes, 130))}
      >
        ▶ {t('theory.playDemo')}
      </button>
    </div>
  );
}

function QuizBlock({
  block,
  onAnswered,
}: {
  block: Extract<LessonBlock, { type: 'quiz' }>;
  onAnswered: (correct: boolean) => void;
}) {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === block.correctIndex;

  return (
    <div className="card flex flex-col gap-3">
      <div className="chip w-fit bg-brand-500/15 text-brand-300">{t('theory.quizTitle')}</div>
      <p className="font-semibold">{block.question[language]}</p>
      <div className="flex flex-col gap-2">
        {block.options.map((opt, i) => {
          const state =
            !answered ? 'idle' : i === block.correctIndex ? 'correct' : i === selected ? 'wrong' : 'idle';
          const cls =
            state === 'correct'
              ? 'border-correct bg-correct/10 text-correct'
              : state === 'wrong'
                ? 'border-wrong bg-wrong/10 text-wrong'
                : 'border-slate-200 hover:border-brand-400 dark:border-slate-700';
          return (
            <button
              key={i}
              disabled={answered}
              className={`rounded-xl border px-4 py-2 text-left text-sm font-medium transition-colors disabled:cursor-default ${cls}`}
              onClick={() => {
                setSelected(i);
                onAnswered(i === block.correctIndex);
              }}
            >
              {opt[language]}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={`text-sm ${isCorrect ? 'text-correct' : 'text-wrong'}`}>
          {isCorrect ? t('common.correct') : t('common.incorrect')}
          {block.explanation ? ` — ${block.explanation[language]}` : ''}
        </p>
      )}
    </div>
  );
}

export function LessonView({ lesson, onExit }: { lesson: Lesson; onExit: () => void }) {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const completeLesson = useProgress((s) => s.completeLesson);
  const alreadyDone = useProgress((s) => s.completedLessons.includes(lesson.id));
  const [correctQuizzes, setCorrectQuizzes] = useState<Set<number>>(new Set());

  const quizCount = useMemo(() => lesson.blocks.filter((b) => b.type === 'quiz').length, [lesson]);
  const allQuizzesDone = correctQuizzes.size >= quizCount;
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    completeLesson(lesson.id, lesson.xp);
    setCompleted(true);
  };

  let quizIndex = -1;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <button className="w-fit text-sm text-slate-500 hover:text-slate-300" onClick={onExit}>
        ← {t('common.back')}
      </button>

      <header className="flex items-center gap-3">
        <span className="text-4xl">{lesson.emoji}</span>
        <div>
          <h1 className="text-2xl font-extrabold">{lesson.title[language]}</h1>
          <p className="text-slate-500">{lesson.summary[language]}</p>
        </div>
      </header>

      {lesson.blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={i} className="mt-2 text-xl font-bold">
                {block.content[language]}
              </h2>
            );
          case 'text':
            return (
              <p key={i} className="leading-relaxed text-slate-600 dark:text-slate-300">
                {block.content[language]}
              </p>
            );
          case 'demo':
            return <DemoBlock key={i} block={block} />;
          case 'quiz': {
            quizIndex += 1;
            const qi = quizIndex;
            return (
              <QuizBlock
                key={i}
                block={block}
                onAnswered={(correct) => {
                  if (correct) setCorrectQuizzes((prev) => new Set(prev).add(qi));
                }}
              />
            );
          }
        }
      })}

      <div className="card flex flex-col items-center gap-3 text-center">
        {completed || alreadyDone ? (
          <>
            <p className="text-lg font-bold text-correct">🎉 {t('theory.lessonComplete')}</p>
            <button className="btn-ghost" onClick={onExit}>
              {t('common.back')}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              {t('theory.quizPrompt')} ({correctQuizzes.size}/{quizCount})
            </p>
            <button className="btn-primary" disabled={!allQuizzesDone} onClick={handleComplete}>
              ✓ {t('theory.lessonComplete')} (+{lesson.xp} XP)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
