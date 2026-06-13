import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PracticeStage } from '@/components/Piano/PracticeStage';
import { PianoControls } from '@/components/Piano/PianoControls';
import type { KeyDecorations } from '@/components/Piano/types';
import { displayRange } from '@/data/pianoSizes';
import { MicMeter } from '@/components/MicMeter/MicMeter';
import { useMicNote } from '@/components/MicMeter/useMic';
import { playNoteEvents } from '@/audio/engine';
import { startMetronome, stopMetronome } from '@/audio/metronome';
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

export function SongPlayer({ song, onExit }: { song: Song; onExit: () => void }) {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const recordSong = useProgress((s) => s.recordSong);

  const [hand, setHand] = useState<HandChoice>('both');
  const [customBpm, setCustomBpm] = useState(song.bpm);
  const speed = customBpm / song.bpm; // derived — drives playNoteEvents + rAF timing
  const [loop, setLoop] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
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

  // Reset tempo + metronome when song changes
  useEffect(() => {
    setCustomBpm(song.bpm);
    setMetronomeOn(false);
    setTapTimes([]);
  }, [song.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Metronome: independent of playback transport (uses Tone.Clock)
  useEffect(() => {
    if (!metronomeOn) return;
    return startMetronome(customBpm, song.beatsPerMeasure);
  }, [metronomeOn, customBpm, song.beatsPerMeasure]);

  function handleTap() {
    const now = performance.now();
    setTapTimes((prev) => {
      const recent = prev.filter((t) => now - t < 3000);
      const next = [...recent, now];
      if (next.length >= 2) {
        const diffs = next.slice(1).map((t, i) => t - next[i]);
        const avgMs = diffs.reduce((a, b) => a + b) / diffs.length;
        const tapped = Math.max(20, Math.min(300, Math.round(60000 / avgMs)));
        setCustomBpm(tapped);
      }
      return next;
    });
  }

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
    if (metronomeOn) startMetronome(customBpm, song.beatsPerMeasure);
    const beatSec = 60 / customBpm;
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

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 tabular-nums">
              {t('repertoire.bpmLabel')}: <strong className="text-slate-200">{customBpm}</strong>
              {customBpm !== song.bpm && (
                <span className="ml-1 text-slate-500">({t('repertoire.originalBpm', { bpm: song.bpm })})</span>
              )}
            </span>
            <button
              className="btn-ghost py-0.5 px-2 text-xs"
              onClick={handleTap}
              title={t('repertoire.tapTempo')}
            >
              👆 {t('repertoire.tapTempo')}
              {tapTimes.length >= 1 && tapTimes.length < 4 && (
                <span className="ml-1 text-slate-500">{tapTimes.length}…</span>
              )}
            </button>
            <button
              className={`btn-ghost py-0.5 px-2 text-xs ${metronomeOn ? 'bg-brand-500/20 text-brand-300' : ''}`}
              onClick={() => setMetronomeOn((v) => !v)}
            >
              🎵 {t('repertoire.metronome')}
            </button>
          </div>

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

          {/* BPM slider */}
          <div className="flex w-full items-center gap-2 pt-1">
            <span className="shrink-0 text-xs text-slate-500">
              {Math.round(song.bpm * 0.3)} BPM
            </span>
            <input
              type="range"
              min={Math.max(20, Math.round(song.bpm * 0.3))}
              max={Math.round(song.bpm * 1.2)}
              step={1}
              value={customBpm}
              className="flex-1 accent-brand-500"
              onChange={(e) => { setCustomBpm(Number(e.target.value)); setTapTimes([]); }}
            />
            <span className="shrink-0 text-xs text-slate-500">
              {Math.round(song.bpm * 1.2)} BPM
            </span>
          </div>
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
