import { useEffect, useMemo, useRef } from 'react';
import { buildLayout, WHITE_W, BLACK_W } from '@/components/Piano/layout';
import { isBlackKey } from '@/audio/notes';

export interface NoteGroup {
  midis: number[];
  fingers?: (number | undefined)[];
}

export interface FallingNotesProps {
  groups: NoteGroup[];
  /** Index of the group currently at the hit line. */
  currentIndex: number;
  startMidi: number;
  endMidi: number;
  showFingers?: boolean;
  height?: number;
  className?: string;
}

const SPACING = 78; // vertical px between consecutive groups
const NOTE_H = 30;

export function FallingNotes({
  groups,
  currentIndex,
  startMidi,
  endMidi,
  showFingers = true,
  height = 260,
  className,
}: FallingNotesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animScroll = useRef(0);
  const state = useRef({ groups, currentIndex, startMidi, endMidi, showFingers });
  state.current = { groups, currentIndex, startMidi, endMidi, showFingers };
  const layoutWidth = useMemo(() => buildLayout(startMidi, endMidi).width, [startMidi, endMidi]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;

    const draw = () => {
      const s = state.current;
      const layout = buildLayout(s.startMidi, s.endMidi);
      const width = layout.width;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;

      const target = s.currentIndex * SPACING;
      animScroll.current += (target - animScroll.current) * 0.18;

      ctx.clearRect(0, 0, width, height);
      const hitY = height - 18;

      // Hit line
      ctx.strokeStyle = 'rgba(129,140,248,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, hitY);
      ctx.lineTo(width, hitY);
      ctx.stroke();

      // Faint white-key column separators
      ctx.strokeStyle = 'rgba(148,163,184,0.12)';
      ctx.lineWidth = 1;
      for (let m = s.startMidi; m <= s.endMidi; m++) {
        if (!isBlackKey(m)) {
          const cx = layout.centerX(m);
          if (cx !== null) {
            ctx.beginPath();
            ctx.moveTo(cx + WHITE_W / 2, 0);
            ctx.lineTo(cx + WHITE_W / 2, height);
            ctx.stroke();
          }
        }
      }

      s.groups.forEach((group, i) => {
        const y = hitY - (i * SPACING - animScroll.current);
        if (y < -NOTE_H || y > height + NOTE_H) return;
        const isCurrent = i === s.currentIndex;
        const isPast = i < s.currentIndex;
        group.midis.forEach((midi, ni) => {
          const cx = layout.centerX(midi);
          if (cx === null) return;
          const black = isBlackKey(midi);
          const w = black ? BLACK_W : WHITE_W - 8;
          const x = cx - w / 2;

          let fill = black ? '#6366f1' : '#818cf8';
          if (isCurrent) fill = '#22c55e';
          else if (isPast) fill = 'rgba(100,116,139,0.35)';

          ctx.fillStyle = fill;
          const r = 6;
          roundRect(ctx, x, y - NOTE_H / 2, w, NOTE_H, r);
          ctx.fill();

          const finger = group.fingers?.[ni];
          if (s.showFingers && finger) {
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(finger), cx, y);
          }
        });
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [height]);

  return (
    <div className={`overflow-x-auto ${className ?? ''}`}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: layoutWidth, height }}
        aria-hidden
      />
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
