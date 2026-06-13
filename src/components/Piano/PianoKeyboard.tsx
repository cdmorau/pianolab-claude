import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { isBlackKey, midiToNoteName, pitchClass } from '@/audio/notes';
import { playNote } from '@/audio/engine';
import { useMidiNote } from '@/audio/useMidi';
import { useSettings } from '@/state/settingsStore';
import type { KeyDecoration, KeyDecorations } from './types';
import { WHITE_W, WHITE_H, BLACK_W, BLACK_H } from './layout';

const TOP = 10; // bezel / felt strip height above the keys

// PC-keyboard mapping for one octave (key char -> semitone offset from octave start).
const PC_KEY_MAP: Record<string, number> = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
};

const HIGHLIGHT_FILL: Record<string, string> = {
  target: '#818cf8',
  correct: '#22c55e',
  wrong: '#ef4444',
  almost: '#f59e0b',
  hint: '#a5b4fc',
};

export interface PianoKeyboardProps {
  startMidi?: number;
  endMidi?: number;
  decorations?: KeyDecorations;
  onKeyDown?: (midi: number) => void;
  onKeyUp?: (midi: number) => void;
  sound?: boolean;
  enablePcKeyboard?: boolean;
  pcOctaveStart?: number;
  forceShowFingers?: boolean;
  /** Fixed display height in px (keys keep their height; width scales to fit). */
  displayHeight?: number;
  className?: string;
}

interface PositionedKey {
  midi: number;
  x: number;
}

function keyPath(x: number, w: number, h: number, r: number): string {
  const t = TOP;
  return `M${x},${t} L${x + w},${t} L${x + w},${t + h - r} Q${x + w},${t + h} ${x + w - r},${t + h} L${x + r},${t + h} Q${x},${t + h} ${x},${t + h - r} Z`;
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
  displayHeight,
  className,
}: PianoKeyboardProps) {
  const gid = useId().replace(/[:]/g, '');
  const language = useSettings((s) => s.language);
  const showFingersSetting = useSettings((s) => s.showFingers);
  const showNoteNames = useSettings((s) => s.showNoteNames);
  const showFingers = forceShowFingers ?? showFingersSetting;
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const pressedRef = useRef<Set<number>>(new Set());

  const { whiteKeys, blackKeys, width } = useMemo(() => {
    const whites: PositionedKey[] = [];
    const whiteIndexByMidi = new Map<number, number>();
    let wi = 0;
    for (let m = startMidi; m <= endMidi; m++) {
      if (!isBlackKey(m)) {
        whites.push({ midi: m, x: wi * WHITE_W });
        whiteIndexByMidi.set(m, wi);
        wi++;
      }
    }
    const blacks: PositionedKey[] = [];
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

  // MIDI keyboard / Bluetooth MIDI — press keys visually + trigger game logic
  useMidiNote(
    (midi) => { if (midi >= startMidi && midi <= endMidi) press(midi); },
    (midi) => { release(midi); },
  );

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

  const totalH = WHITE_H + TOP;
  const wId = `w-${gid}`;
  const wpId = `wp-${gid}`;
  const bId = `b-${gid}`;
  const bpId = `bp-${gid}`;

  const whiteFill = (midi: number, deco?: KeyDecoration): string => {
    if (deco?.highlight) return HIGHLIGHT_FILL[deco.highlight];
    return activeNotes.has(midi) ? `url(#${wpId})` : `url(#${wId})`;
  };
  const blackFill = (midi: number, deco?: KeyDecoration): string => {
    if (deco?.highlight) return HIGHLIGHT_FILL[deco.highlight];
    return activeNotes.has(midi) ? `url(#${bpId})` : `url(#${bId})`;
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

  // Show note-name labels only when there's enough horizontal room per key.
  const labelsFit = whiteKeys.length <= 36;

  return (
    <div className={className} style={{ userSelect: 'none', touchAction: 'none', width: '100%' }}>
      <svg
        viewBox={`0 0 ${width} ${totalH}`}
        width="100%"
        height={displayHeight ?? totalH}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
        role="group"
        aria-label="piano keyboard"
      >
        <defs>
          <linearGradient id={wId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.82" stopColor="#f1f5f9" />
            <stop offset="1" stopColor="#dbe2ea" />
          </linearGradient>
          <linearGradient id={wpId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dbe4ff" />
            <stop offset="1" stopColor="#a5b4fc" />
          </linearGradient>
          <linearGradient id={bId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#475569" />
            <stop offset="0.12" stopColor="#1e293b" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
          <linearGradient id={bpId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#818cf8" />
            <stop offset="1" stopColor="#3730a3" />
          </linearGradient>
          <linearGradient id={`felt-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3730a3" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={width} height={TOP} fill={`url(#felt-${gid})`} />

        {/* White keys */}
        {whiteKeys.map(({ midi, x }) => {
          const deco = decorations[midi];
          const isC = pitchClass(midi) === 0;
          return (
            <g key={midi}>
              <path
                d={keyPath(x + 1, WHITE_W - 2, WHITE_H, 5)}
                fill={whiteFill(midi, deco)}
                stroke="#94a3b8"
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  press(midi);
                }}
                onPointerUp={() => release(midi)}
                onPointerLeave={() => release(midi)}
              />
              {showNoteNames && (labelsFit || isC) && (
                <text
                  x={x + WHITE_W / 2}
                  y={TOP + WHITE_H - 14}
                  textAnchor="middle"
                  fontSize={isC ? 12 : 10}
                  fill={isC ? '#4f46e5' : '#94a3b8'}
                  fontWeight={isC ? 700 : 500}
                  pointerEvents="none"
                >
                  {deco?.label ?? midiToNoteName(midi, { language, withOctave: isC })}
                </text>
              )}
              {renderFinger(deco, x + WHITE_W / 2, TOP + WHITE_H - 34, false)}
            </g>
          );
        })}

        {/* Black keys */}
        {blackKeys.map(({ midi, x }) => {
          const deco = decorations[midi];
          return (
            <g key={midi}>
              <path
                d={keyPath(x, BLACK_W, BLACK_H, 4)}
                fill={blackFill(midi, deco)}
                stroke="#020617"
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  press(midi);
                }}
                onPointerUp={() => release(midi)}
                onPointerLeave={() => release(midi)}
              />
              <rect x={x + 3} y={TOP + 4} width={BLACK_W - 6} height={6} rx={3} fill="rgba(255,255,255,0.18)" pointerEvents="none" />
              {renderFinger(deco, x + BLACK_W / 2, TOP + BLACK_H - 16, true)}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
