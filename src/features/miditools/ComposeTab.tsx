import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Staff } from '@/components/Notation/Staff';
import { buildMidi, type MidiNote } from './midiWriter';

const WK_W = 40;  // white key width px
const WK_H = 110; // white key height px
const BK_W = 26;  // black key width px
const BK_H = 68;  // black key height px

// 2 octaves: C4 (MIDI 60) → B5 (MIDI 83)
const WHITE_KEYS = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83];
const TOTAL_W = WHITE_KEYS.length * WK_W; // 560px

// Each black key: midi number + how many white keys from the left edge it sits between.
const BLACK_KEYS: { midi: number; pos: number }[] = [
  { midi: 61, pos: 1 }, { midi: 63, pos: 2 },                   // C#4 D#4
  { midi: 66, pos: 4 }, { midi: 68, pos: 5 }, { midi: 70, pos: 6 }, // F#4 G#4 A#4
  { midi: 73, pos: 8 }, { midi: 75, pos: 9 },                   // C#5 D#5
  { midi: 78, pos: 11 }, { midi: 80, pos: 12 }, { midi: 82, pos: 13 }, // F#5 G#5 A#5
];

// White key indices for C notes (for label rendering)
const C_INDICES: { wkIdx: number; label: string }[] = [
  { wkIdx: 0, label: 'C4' },
  { wkIdx: 7, label: 'C5' },
];

export function ComposeTab() {
  const { t } = useTranslation();

  const [isRecording, setIsRecording] = useState(false);
  const [displayNotes, setDisplayNotes] = useState<number[]>([]);
  const [midiBytes, setMidiBytes] = useState<Uint8Array | null>(null);
  const [noteCount, setNoteCount] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscRef = useRef<Map<number, { osc: OscillatorNode; gain: GainNode }>>(new Map());
  const isRecordingRef = useRef(false);
  const recordStartRef = useRef<number>(0);
  const heldRef = useRef<Map<number, number>>(new Map());
  const capturedRef = useRef<MidiNote[]>([]);
  const pressedRef = useRef<Set<number>>(new Set());

  // Stable ref so the global mouseup handler always sees latest handleNoteOff
  const handleNoteOffRef = useRef<(midi: number) => void>(() => {});

  function handleNoteOn(midi: number) {
    if (pressedRef.current.has(midi)) return;
    pressedRef.current.add(midi);

    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    activeOscRef.current.set(midi, { osc, gain });

    if (isRecordingRef.current) {
      heldRef.current.set(midi, performance.now());
    }
    setDisplayNotes((prev) => [...prev.slice(-39), midi]);
  }

  function handleNoteOff(midi: number) {
    pressedRef.current.delete(midi);

    const entry = activeOscRef.current.get(midi);
    if (entry && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      entry.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      entry.osc.stop(ctx.currentTime + 0.2);
      activeOscRef.current.delete(midi);
    }

    if (isRecordingRef.current) {
      const startMs = heldRef.current.get(midi);
      if (startMs !== undefined) {
        const startSec = (startMs - recordStartRef.current) / 1000;
        const endSec = (performance.now() - recordStartRef.current) / 1000;
        capturedRef.current.push({
          pitch: midi,
          startSec,
          endSec: Math.max(endSec, startSec + 0.05),
          velocity: 90,
        });
        heldRef.current.delete(midi);
      }
    }
  }

  // Keep ref current on every render
  handleNoteOffRef.current = handleNoteOff;

  // Single global mouseup listener so releasing the mouse outside a key ends the note
  useEffect(() => {
    function onUp() {
      const pressed = Array.from(pressedRef.current);
      for (const midi of pressed) handleNoteOffRef.current(midi);
    }
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, []);

  function startRecording() {
    capturedRef.current = [];
    heldRef.current.clear();
    recordStartRef.current = performance.now();
    isRecordingRef.current = true;
    setIsRecording(true);
    setDisplayNotes([]);
    setMidiBytes(null);
    setNoteCount(0);
  }

  function stopRecording() {
    const now = performance.now();
    for (const [midi, startMs] of heldRef.current) {
      const startSec = (startMs - recordStartRef.current) / 1000;
      const endSec = (now - recordStartRef.current) / 1000;
      capturedRef.current.push({
        pitch: midi,
        startSec,
        endSec: Math.max(endSec, startSec + 0.05),
        velocity: 90,
      });
    }
    heldRef.current.clear();
    isRecordingRef.current = false;
    setIsRecording(false);

    const notes = capturedRef.current;
    setNoteCount(notes.length);
    if (notes.length > 0) {
      setMidiBytes(buildMidi(notes));
      setDisplayNotes(notes.map((n) => n.pitch));
    }
  }

  function clearAll() {
    capturedRef.current = [];
    heldRef.current.clear();
    setDisplayNotes([]);
    setMidiBytes(null);
    setNoteCount(0);
  }

  function downloadMidi() {
    if (!midiBytes) return;
    const blob = new Blob([midiBytes], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'composicion.mid';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            {t('miditools.composeRecord')}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
          >
            <span className="h-2.5 w-2.5 rounded-sm bg-white" />
            {t('miditools.composeStop')}
          </button>
        )}
        {displayNotes.length > 0 && !isRecording && (
          <button onClick={clearAll} className="btn-ghost px-4 py-2.5 text-sm">
            {t('miditools.composeClear')}
          </button>
        )}
        {isRecording && (
          <span className="animate-pulse text-sm font-medium text-red-400">
            {t('miditools.composeRecording')}
          </span>
        )}
        {!isRecording && noteCount > 0 && (
          <span className="text-sm text-slate-400">
            {noteCount} {t('miditools.composeNotes')}
          </span>
        )}
      </div>

      {/* Mini piano keyboard */}
      <div className="overflow-x-auto rounded-lg">
        <div className="relative select-none mx-auto" style={{ width: TOTAL_W, height: WK_H + 18 }}>
          {/* C note labels below keyboard */}
          {C_INDICES.map(({ wkIdx, label }) => (
            <span
              key={label}
              className="absolute bottom-0 text-[10px] text-slate-500 pointer-events-none"
              style={{ left: wkIdx * WK_W + 2, width: WK_W - 2, textAlign: 'center' }}
            >
              {label}
            </span>
          ))}
          {/* White keys */}
          {WHITE_KEYS.map((midi, i) => (
            <div
              key={midi}
              onMouseDown={() => handleNoteOn(midi)}
              onTouchStart={(e) => { e.preventDefault(); handleNoteOn(midi); }}
              onTouchEnd={(e) => { e.preventDefault(); handleNoteOff(midi); }}
              className="absolute cursor-pointer rounded-b border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200 transition-colors"
              style={{ left: i * WK_W, top: 0, width: WK_W - 1, height: WK_H, zIndex: 1 }}
            />
          ))}
          {/* Black keys */}
          {BLACK_KEYS.map(({ midi, pos }) => (
            <div
              key={midi}
              onMouseDown={(e) => { e.stopPropagation(); handleNoteOn(midi); }}
              onTouchStart={(e) => { e.preventDefault(); handleNoteOn(midi); }}
              onTouchEnd={(e) => { e.preventDefault(); handleNoteOff(midi); }}
              className="absolute cursor-pointer rounded-b bg-slate-900 hover:bg-slate-700 active:bg-slate-600 transition-colors"
              style={{
                left: pos * WK_W - BK_W / 2,
                top: 0,
                width: BK_W,
                height: BK_H,
                zIndex: 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Notation */}
      <div className="card flex min-h-[148px] flex-col items-stretch">
        {displayNotes.length === 0 ? (
          <p className="m-auto text-sm text-slate-500">{t('miditools.composeEmpty')}</p>
        ) : (
          <Staff items={displayNotes.slice(-24)} className="w-full" />
        )}
      </div>

      {/* MIDI download */}
      {midiBytes && !isRecording && (
        <button onClick={downloadMidi} className="btn-primary w-full py-3 text-base font-bold">
          ⬇ {t('miditools.download')} composicion.mid
        </button>
      )}
    </div>
  );
}
