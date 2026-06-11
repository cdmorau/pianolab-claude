import { useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { PracticeStage } from '@/components/Piano/PracticeStage';
import { PianoControls } from '@/components/Piano/PianoControls';
import type { KeyDecorations } from '@/components/Piano/types';
import type { NoteGroup } from '@/components/FallingNotes/FallingNotes';
import { Staff, type StaffItem } from '@/components/Notation/Staff';
import { displayRange } from '@/data/pianoSizes';
import { FeedbackBanner } from '@/components/Feedback/FeedbackBanner';
import { MicMeter } from '@/components/MicMeter/MicMeter';
import { useMicNote } from '@/components/MicMeter/useMic';
import { playNote, playSequence } from '@/audio/engine';
import { notesMatch, midiToNoteName } from '@/audio/notes';
import { useProgress } from '@/state/progressStore';
import { useSettings } from '@/state/settingsStore';
import type { Challenge, ChallengeStep } from '@/data/challenges';
import type { Finger } from '@/types/music';
import type { FeedbackStatus } from '@/components/Feedback/FeedbackBanner';

interface State {
  steps: ChallengeStep[];
  stepIndex: number;
  seqPos: number;
  playedSet: number[];
  mistakes: number;
  mistakesOnTarget: number;
  revealed: boolean;
  wrongNote: number | null;
  feedback: FeedbackStatus;
  finished: boolean;
  stars: number;
}

type Action =
  | { type: 'input'; midi: number; fromMic: boolean }
  | { type: 'clearWrong' }
  | { type: 'reveal' }
  | { type: 'retry'; steps: ChallengeStep[] };

function init(steps: ChallengeStep[]): State {
  return {
    steps,
    stepIndex: 0,
    seqPos: 0,
    playedSet: [],
    mistakes: 0,
    mistakesOnTarget: 0,
    revealed: false,
    wrongNote: null,
    feedback: null,
    finished: false,
    stars: 0,
  };
}

function advance(state: State, feedback: FeedbackStatus): State {
  const next = state.stepIndex + 1;
  if (next >= state.steps.length) {
    const stars = state.mistakes === 0 ? 3 : state.mistakes <= 2 ? 2 : 1;
    return { ...state, finished: true, stars, feedback };
  }
  return {
    ...state,
    stepIndex: next,
    seqPos: 0,
    playedSet: [],
    mistakesOnTarget: 0,
    revealed: false,
    feedback,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'clearWrong':
      return { ...state, wrongNote: null };
    case 'reveal':
      return { ...state, revealed: true };
    case 'retry':
      return init(action.steps);
    case 'input': {
      if (state.finished) return state;
      const step = state.steps[state.stepIndex];
      if (!step) return state;
      const octTol = action.fromMic;

      if (step.mode === 'chord') {
        const matched = step.targets.find((t) => notesMatch(action.midi, t, octTol));
        if (matched === undefined) {
          return { ...state, mistakes: state.mistakes + 1, wrongNote: action.midi, feedback: 'wrong' };
        }
        const played = state.playedSet.includes(matched) ? state.playedSet : [...state.playedSet, matched];
        const done = step.targets.every((t) => played.includes(t));
        if (done) return advance({ ...state, playedSet: played }, 'correct');
        return { ...state, playedSet: played, feedback: 'correct' };
      }

      // single / sequence
      const expected = step.targets[state.seqPos];
      if (notesMatch(action.midi, expected, octTol)) {
        const nextPos = state.seqPos + 1;
        if (nextPos >= step.targets.length) return advance({ ...state, seqPos: nextPos }, 'correct');
        return { ...state, seqPos: nextPos, mistakesOnTarget: 0, revealed: false, feedback: 'correct' };
      }
      const m = state.mistakesOnTarget + 1;
      return {
        ...state,
        mistakes: state.mistakes + 1,
        mistakesOnTarget: m,
        revealed: state.revealed || m >= 3,
        wrongNote: action.midi,
        feedback: 'wrong',
      };
    }
    default:
      return state;
  }
}

function buildDecorations(state: State): KeyDecorations {
  const deco: KeyDecorations = {};
  if (state.finished) return deco;
  const step = state.steps[state.stepIndex];
  if (!step) return deco;
  const showTargets = !step.hidden || state.revealed;

  if (step.mode === 'chord') {
    step.targets.forEach((t, i) => {
      if (showTargets) {
        deco[t] = {
          highlight: state.playedSet.includes(t) ? 'correct' : 'target',
          finger: step.fingers?.[i] as Finger | undefined,
        };
      }
    });
  } else {
    step.targets.forEach((t, i) => {
      if (!showTargets) return;
      if (i < state.seqPos) deco[t] = { highlight: 'correct', finger: step.fingers?.[i] as Finger | undefined };
      else if (i === state.seqPos)
        deco[t] = {
          highlight: state.revealed ? 'hint' : 'target',
          finger: step.fingers?.[i] as Finger | undefined,
        };
    });
  }
  if (state.wrongNote != null && !deco[state.wrongNote]) deco[state.wrongNote] = { highlight: 'wrong' };
  return deco;
}

export function ChallengeRunner({ challenge, onExit }: { challenge: Challenge; onExit: () => void }) {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const pianoKeys = useSettings((s) => s.pianoKeys);
  const completeChallenge = useProgress((s) => s.completeChallenge);
  const [state, dispatch] = useReducer(reducer, challenge.build(), init);

  const range = displayRange(challenge.rangeStart, challenge.rangeEnd, pianoKeys);
  const focusMidi = Math.round((challenge.rangeStart + challenge.rangeEnd) / 2);

  const step = state.steps[state.stepIndex];

  // Microphone note onsets feed the same reducer.
  useMicNote((midi) => dispatch({ type: 'input', midi, fromMic: true }));

  // Clear the transient "wrong key" highlight.
  useEffect(() => {
    if (state.wrongNote == null) return;
    const id = window.setTimeout(() => dispatch({ type: 'clearWrong' }), 450);
    return () => clearTimeout(id);
  }, [state.wrongNote]);

  // Ear-training: play the hidden target when a new step starts.
  useEffect(() => {
    if (state.finished || !step?.hidden) return;
    const id = window.setTimeout(() => {
      if (step.targets.length > 1) playSequence(step.targets, 100);
      else playNote(step.targets[0]);
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stepIndex, state.finished]);

  // Award progress once finished.
  useEffect(() => {
    if (state.finished) completeChallenge(challenge.id, state.stars, challenge.xp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.finished]);

  const decorations = buildDecorations(state);

  const replayEar = () => {
    if (!step) return;
    if (step.targets.length > 1) playSequence(step.targets, 100);
    else playNote(step.targets[0]);
  };

  const promptText = (): string => {
    if (!step) return '';
    switch (challenge.kind) {
      case 'note':
        return `${t('challenges.playTheNote')}: ${midiToNoteName(step.targets[0], { language })}`;
      case 'ear':
        return t('challenges.playWhatYouHear');
      case 'scale':
        return t('challenges.playTheScale');
      case 'chord':
        return `${t('challenges.playTheChord')}${step.label ? `: ${step.label}` : ''}`;
      case 'melody':
        return t('challenges.playTheMelody');
    }
  };

  if (state.finished) {
    return (
      <div className="card flex flex-col items-center gap-4 text-center">
        <div className="text-5xl">{challenge.emoji}</div>
        <h2 className="text-2xl font-extrabold">{t('challenges.challengeComplete')}</h2>
        <div className="flex gap-1 text-3xl" aria-label={`${state.stars} stars`}>
          {[1, 2, 3].map((s) => (
            <span key={s}>{s <= state.stars ? '⭐' : '☆'}</span>
          ))}
        </div>
        <p className="text-slate-500">+{challenge.xp} XP</p>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => dispatch({ type: 'retry', steps: challenge.build() })}>
            {t('common.retry')}
          </button>
          <button className="btn-ghost" onClick={onExit}>
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  const staffItems: StaffItem[] =
    challenge.kind === 'chord' && step ? [step.targets] : step && !step.hidden ? [step.targets[0]] : [];

  const melodyGroups: NoteGroup[] =
    challenge.kind === 'melody' ? state.steps.map((s) => ({ midis: s.targets, fingers: s.fingers })) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button className="text-sm text-slate-500 hover:text-slate-300" onClick={onExit}>
          ← {t('common.back')}
        </button>
        <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {challenge.emoji} {challenge.title[language]}
        </span>
      </div>

      <div className="card flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{promptText()}</h2>
          <span className="text-sm text-slate-500">
            {t('challenges.round')} {Math.min(state.stepIndex + 1, state.steps.length)} {t('common.of')}{' '}
            {state.steps.length}
          </span>
        </div>

        {challenge.kind === 'ear' && (
          <button className="btn-ghost w-fit" onClick={replayEar}>
            🔊 {t('common.listen')}
          </button>
        )}

        {staffItems.length > 0 && (
          <div className="flex justify-center">
            <Staff items={staffItems} fingers={step?.fingers} />
          </div>
        )}

        <FeedbackBanner status={state.feedback} message={state.revealed ? t('challenges.tooManyTries') : undefined} />
      </div>

      <div className="flex justify-end">
        <PianoControls compact />
      </div>

      <PracticeStage
        start={range.start}
        end={range.end}
        focusMidi={focusMidi}
        decorations={decorations}
        groups={melodyGroups.length > 0 ? melodyGroups : undefined}
        currentIndex={state.stepIndex}
        forceShowFingers
        onKeyDown={(midi) => dispatch({ type: 'input', midi, fromMic: false })}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <MicMeter />
        <div className="card flex flex-col justify-center gap-1 text-sm text-slate-500">
          <p>{t('challenges.useInput')}</p>
          <p className="text-xs">{t('home.privacyNote')}</p>
        </div>
      </div>
    </div>
  );
}
