import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PracticeStage } from '@/components/Piano/PracticeStage';
import { PianoControls } from '@/components/Piano/PianoControls';
import type { KeyDecorations } from '@/components/Piano/types';
import { displayRange } from '@/data/pianoSizes';
import { MicMeter } from '@/components/MicMeter/MicMeter';
import { useMicNote } from '@/components/MicMeter/useMic';
import { playNoteEvents } from '@/audio/engine';
import { notesMatch } from '@/audio/notes';
import { groupByBeat, type PlayGroup } from '@/utils/groups';
import { songRange } from '@/data/songs';
import { useProgress } from '@/state/progressStore';
import { useSettings } from '@/state/settingsStore';
import type { Song } from '@/types/song';
import type { Finger, HandChoice } from '@/types/music';

interface PState {
  groups: PlayGroup[];
  index: number;
  played: number[];
  finished: boolean;
}
type PAction =
  | { type: 'input'; midi: number; fromMic: boolean }
  | { type: 'reset'; groups: PlayGroup[] }
  | { type: 'jump'; index: number };

function initP(groups: PlayGroup[]): PState {
  return { groups, index: 0, played: [], finished: false };
}

function reducerP(state: PState, action: PAction): PState {
  switch (action.type) {
    case 'reset':
      return initP(action.groups);
    case 'jump':
      return { ...state, index: action.index, played: [], finished: false };
    case 'input': {
      if (state.finished) return state;
      const g = state.groups[state.index];
      if (!g) return state;
      const matched = g.midis.find((m) => !state.played.includes(m) && notesMatch(action.midi, m, action.fromMic));
      if (matched === undefined) return state;
      const played = [...state.played, matched];
      if (g.midis.every((m) => played.includes(m))) {
        const next = state.index + 1;
        const finished = next >= state.groups.length;
        return { ...state, index: finished ? state.index : next, played: [], finished };
      }
      return { ...state, played };
    }
    default:
      return state;
  }
}

const SPEEDS = [0.5, 0.75, 1];

export function SongPlayer({ song, onExit }: { song: Song; onExit: () => void }) {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const recordSong = useProgress((s) => s.recordSong);

  const [hand, setHand] = useState<HandChoice>('both');
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [listening, setListening] = useState(false);
  const [playheadBeat, setPlayheadBeat] = useState(0);
  const listenCancel = useRef<(() => void) | null>(null);
  const listenRaf = useRef<number | null>(null);

  const pianoKeys = useSettings((s) => s.pianoKeys);
  const groups = useMemo(() => groupByBeat(song.notes, hand), [song, hand]);
  const handNotes = useMemo(
    () => (hand === 'both' ? song.notes : song.notes.filter((n) => n.hand === hand)),
    [song, hand],
  );
  const reqRange = useMemo(() => songRange(song), [song]);
  const range = useMemo(() => displayRange(reqRange.start, reqRange.end, pianoKeys), [reqRange, pianoKeys]);
  const focusMidi = Math.round((reqRange.start + reqRange.end) / 2);

  const [state, dispatch] = useReducer(reducerP, groups, initP);

  useEffect(() => {
    dispatch({ type: 'reset', groups });
    stopListen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  useMicNote((midi) => {
    if (!listening) dispatch({ type: 'input', midi, fromMic: true });
  });

  useEffect(() => {
    if (!state.finished) return;
    recordSong(song.id);
    if (loop) {
      const id = window.setTimeout(() => dispatch({ type: 'reset', groups }), 900);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.finished]);

  useEffect(() => () => stopListen(), []);

  function stopListen() {
    listenCancel.current?.();
    listenCancel.current = null;
    if (listenRaf.current !== null) cancelAnimationFrame(listenRaf.current);
    listenRaf.current = null;
    setListening(false);
  }

  function startListen() {
    stopListen();
    setListening(true);
    setPlayheadBeat(0);
    const cancelAudio = playNoteEvents(handNotes, song.bpm, speed);
    const beatSec = 60 / (song.bpm * speed);
    const last = groups[groups.length - 1];
    const totalBeats = last ? last.beat + (last.durations[0] ?? 1) : 0;
    const startTime = performance.now();
    const tick = () => {
      const beats = (performance.now() - startTime) / 1000 / beatSec;
      setPlayheadBeat(beats);
      if (beats > totalBeats + 2) {
        stopListen();
        return;
      }
      listenRaf.current = requestAnimationFrame(tick);
    };
    listenRaf.current = requestAnimationFrame(tick);
    listenCancel.current = () => cancelAudio();
  }

  const currentIndex = state.finished ? groups.length : state.index;

  const decorations: KeyDecorations = {};
  if (!listening && !state.finished) {
    const cur = groups[state.index];
    cur?.midis.forEach((m, i) => {
      decorations[m] = {
        highlight: state.played.includes(m) ? 'correct' : 'target',
        finger: cur.fingers[i] as Finger | undefined,
      };
    });
  }

  const licenseBadge =
    song.license === 'public-domain'
      ? { text: t('repertoire.publicDomain'), cls: 'bg-correct/15 text-correct' }
      : song.license === 'personal-use'
        ? { text: t('repertoire.personalUse'), cls: 'bg-almost/15 text-almost' }
        : { text: t('repertoire.imported'), cls: 'bg-brand-500/15 text-brand-300' };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button className="text-sm text-slate-500 hover:text-slate-300" onClick={onExit}>
          ← {t('common.back')}
        </button>
        <span className={`chip ${licenseBadge.cls}`}>{licenseBadge.text}</span>
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold">{song.title}</h1>
        <p className="text-sm text-slate-500">
          {song.composer} · {song.key} · {song.bpm} BPM
        </p>
        {song.attribution && <p className="text-xs text-slate-400">{song.attribution[language]}</p>}
      </header>

      <div className="card flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!listening ? (
            <button className="btn-primary" onClick={startListen} disabled={groups.length === 0}>
              ▶ {t('common.listen')}
            </button>
          ) : (
            <button className="btn-ghost" onClick={stopListen}>
              ⏹ {t('common.stop')}
            </button>
          )}
          <button className="btn-ghost" onClick={() => dispatch({ type: 'reset', groups })}>
            ↺ {t('common.reset')}
          </button>

          <label className="ml-auto flex items-center gap-2 text-sm">
            {t('repertoire.speed')}
            <select
              className="rounded-lg border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-700"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s} className="text-black">
                  {s}×
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            {t('common.hand')}
            <select
              className="rounded-lg border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-700"
              value={hand}
              onChange={(e) => setHand(e.target.value as HandChoice)}
            >
              <option value="both" className="text-black">
                {t('common.both')}
              </option>
              <option value="R" className="text-black">
                {t('common.right')}
              </option>
              <option value="L" className="text-black">
                {t('common.left')}
              </option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
            {t('repertoire.loop')}
          </label>
        </div>

        <p className="text-xs text-slate-500">
          {state.finished ? `🎉 ${t('common.completed')}` : t('repertoire.waitModeDesc')}
        </p>
      </div>

      <div className="flex justify-end">
        <PianoControls compact />
      </div>

      <PracticeStage
        start={range.start}
        end={range.end}
        focusMidi={focusMidi}
        decorations={decorations}
        groups={groups}
        currentIndex={currentIndex}
        playheadBeat={listening ? playheadBeat : undefined}
        forceShowFingers
        fallingHeight={300}
        onKeyDown={(midi) => dispatch({ type: 'input', midi, fromMic: false })}
      />

      <MicMeter />
    </div>
  );
}
