import { useEffect, useMemo, useRef, useState } from 'react';
import { isBlackKey, midiToNoteName, pitchClass } from '@/audio/notes';
import { playNote } from '@/audio/engine';
import { useSettings } from '@/state/settingsStore';
import type { KeyDecoration, KeyDecorations } from './types';
import { WHITE_W, WHITE_H, BLACK_W, BLACK_H } from './layout';

// PC-keyboard mapping for one octave (key char -> semitone offset from octave start).
const PC_KEY_MAP: Record<string, number> = {
  a: 0, // C
  w: 1, // C#
  s: 2, // D
  e: 3, // D#
  d: 4, // E
  f: 5, // F
  t: 6, // F#
  g: 7, // G
  y: 8, // G#
  h: 9, // A
  u: 10, // A#
  j: 11, // B
  k: 12, // C (next octave)
};

const HIGHLIGHT_FILL: Record<string, string> = {
  target: '#818cf8',
  correct: '#22c55e',
  wrong: '#ef4444',
  almost: '#f59e0b',
  hint: '#a5b4fc',
};

export interface PianoKeyboardProps {
  /** Lowest MIDI note shown. Default C3 (48). */
  startMidi?: number;
  /** Highest MIDI note shown. Default C6 (84). */
  endMidi?: number;
  decorations?: KeyDecorations;
  onKeyDown?: (midi: number) => void;
  onKeyUp?: (midi: number) => void;
  /** Play the piano sound on press. Default true. */
  sound?: boolean;
  /** Enable computer-keyboard input. Default false. */
  enablePcKeyboard?: boolean;
  /** Octave start for PC-keyboard mapping. Default C4 (60). */
  pcOctaveStart?: number;
  /** Force-show finger badges regardless of the global setting. */
  forceShowFingers?: boolean;
  className?: string;
}

interface WhiteKey {
  midi: number;
  x: number;
}
interface BlackKey {
  midi: number;
  x: number;
}

export function PianoKeyboard({
  startMidi = 48,
  endMidi = 84,
  decorations = {},
  onKeyDown,
  onKeyUp,
  sound = true,
  enablePcKeyboard = false,
  pcOctaveStart = 60,
  forceShowFingers,
  className,
}: PianoKeyboardProps) {
  const language = useSettings((s) => s.language);
  const showFingersSetting = useSettings((s) => s.showFingers);
  const showNoteNames = useSettings((s) => s.showNoteNames);
  const showFingers = forceShowFingers ?? showFingersSetting;
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const pressedRef = useRef<Set<number>>(new Set());

  const { whiteKeys, blackKeys, width } = useMemo(() => {
    const whites: WhiteKey[] = [];
    const whiteIndexByMidi = new Map<number, number>();
    let wi = 0;
    for (let m = startMidi; m <= endMidi; m++) {
      if (!isBlackKey(m)) {
        whites.push({ midi: m, x: wi * WHITE_W });
        whiteIndexByMidi.set(m, wi);
        wi++;
      }
    }
    const blacks: BlackKey[] = [];
    for (let m = startMidi; m <= endMidi; m++) {
      if (isBlackKey(m)) {
        const leftWhiteIndex = whiteIndexByMidi.get(m - 1);
        if (leftWhiteIndex === undefined) continue;
        blacks.push({ midi: m, x: (leftWhiteIndex + 1) * WHITE_W - BLACK_W / 2 });
      }
    }
    return { whiteKeys: whites, blackKeys: blacks, width: whites.length * WHITE_W };
  }, [startMidi, endMidi]);

  const press = (midi: number) => {
    if (pressedRef.current.has(midi)) return;
    pressedRef.current.add(midi);
    setActiveNotes(new Set(pressedRef.current));
    if (sound) playNote(midi);
    onKeyDown?.(midi);
  };

  const release = (midi: number) => {
    if (!pressedRef.current.has(midi)) return;
    pressedRef.current.delete(midi);
    setActiveNotes(new Set(pressedRef.current));
    onKeyUp?.(midi);
  };

  useEffect(() => {
    if (!enablePcKeyboard) return;
    const down = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const offset = PC_KEY_MAP[e.key.toLowerCase()];
      if (offset === undefined) return;
      press(pcOctaveStart + offset);
    };
    const up = (e: KeyboardEvent) => {
      const offset = PC_KEY_MAP[e.key.toLowerCase()];
      if (offset === undefined) return;
      release(pcOctaveStart + offset);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enablePcKeyboard, pcOctaveStart]);

  const fillFor = (midi: number, isBlack: boolean, deco?: KeyDecoration): string => {
    if (deco?.highlight) return HIGHLIGHT_FILL[deco.highlight];
    if (activeNotes.has(midi)) return isBlack ? '#475569' : '#c7d2fe';
    return isBlack ? '#1e293b' : '#ffffff';
  };

  const renderFinger = (deco: KeyDecoration | undefined, cx: number, cy: number, isBlack: boolean) => {
    if (!showFingers || !deco?.finger) return null;
    return (
      <g pointerEvents="none">
        <circle cx={cx} cy={cy} r={10} fill={isBlack ? '#f8fafc' : '#312e81'} />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill={isBlack ? '#312e81' : '#f8fafc'}
        >
          {deco.finger}
        </text>
      </g>
    );
  };

  return (
    <div className={className} style={{ width: '100%', userSelect: 'none', touchAction: 'none' }}>
      <svg
        viewBox={`0 0 ${width} ${WHITE_H}`}
        width="100%"
        style={{ display: 'block', maxHeight: WHITE_H }}
        role="group"
        aria-label="piano keyboard"
      >
        {/* White keys */}
        {whiteKeys.map(({ midi, x }) => {
          const deco = decorations[midi];
          return (
            <g key={midi}>
              <rect
                x={x + 1}
                y={0}
                width={WHITE_W - 2}
                height={WHITE_H}
                rx={5}
                fill={fillFor(midi, false, deco)}
                stroke="#cbd5e1"
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  press(midi);
                }}
                onPointerUp={() => release(midi)}
                onPointerLeave={() => release(midi)}
              />
              {showNoteNames && (
                <text
                  x={x + WHITE_W / 2}
                  y={WHITE_H - 26}
                  textAnchor="middle"
                  fontSize={10}
                  fill={pitchClass(midi) === 0 ? '#4f46e5' : '#64748b'}
                  fontWeight={pitchClass(midi) === 0 ? 700 : 400}
                  pointerEvents="none"
                >
                  {deco?.label ?? midiToNoteName(midi, { language, withOctave: pitchClass(midi) === 0 })}
                </text>
              )}
              {renderFinger(deco, x + WHITE_W / 2, WHITE_H - 8, false)}
            </g>
          );
        })}

        {/* Black keys (drawn on top) */}
        {blackKeys.map(({ midi, x }) => {
          const deco = decorations[midi];
          return (
            <g key={midi}>
              <rect
                x={x}
                y={0}
                width={BLACK_W}
                height={BLACK_H}
                rx={4}
                fill={fillFor(midi, true, deco)}
                stroke="#0f172a"
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  press(midi);
                }}
                onPointerUp={() => release(midi)}
                onPointerLeave={() => release(midi)}
              />
              {renderFinger(deco, x + BLACK_W / 2, BLACK_H - 14, true)}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
