import { useEffect, useMemo, useRef } from 'react';
import { buildLayout, WHITE_W, BLACK_W } from '@/components/Piano/layout';
import { isBlackKey } from '@/audio/notes';
import type { PlayGroup } from '@/utils/groups';

export interface FallingNotesProps {
  groups: PlayGroup[];
  /** Index of the group currently at the hit line. */
  currentIndex: number;
  startMidi: number;
  endMidi: number;
  showFingers?: boolean;
  height?: number;
  /** Wrap in its own horizontal scroll container. Set false to share a parent's. */
  scroll?: boolean;
  className?: string;
}

const PX_PER_BEAT = 80; // vertical pixels per beat
const MIN_BAR_H = 22;

interface HitFx {
  x: number;
  rh: boolean;
  born: number;
}

const RH_COLOR = { future: '#818cf8', glow: '#a5b4fc' };
const LH_COLOR = { future: '#22d3ee', glow: '#67e8f9' };

export function FallingNotes({
  groups,
  currentIndex,
  startMidi,
  endMidi,
  showFingers = true,
  height = 300,
  scroll = true,
  className,
}: FallingNotesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playhead = useRef(0); // current beat at the hit line (lerped)
  const prevIndex = useRef(currentIndex);
  const combo = useRef(0);
  const comboPulse = useRef(0);
  const hitPulse = useRef(0);
  const effects = useRef<HitFx[]>([]);
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
      const now = performance.now();

      // Detect newly-hit groups -> spawn effects + combo.
      if (s.currentIndex > prevIndex.current) {
        for (let i = prevIndex.current; i < s.currentIndex && i < s.groups.length; i++) {
          const g = s.groups[i];
          g.midis.forEach((midi, ni) => {
            const cx = layout.centerX(midi);
            if (cx !== null) effects.current.push({ x: cx, rh: g.hands[ni] !== 'L', born: now });
          });
          combo.current += 1;
          comboPulse.current = 1;
          hitPulse.current = 1;
        }
      } else if (s.currentIndex < prevIndex.current) {
        combo.current = 0;
      }
      prevIndex.current = s.currentIndex;

      // Target beat at the hit line.
      const last = s.groups[s.groups.length - 1];
      const targetBeat =
        s.currentIndex < s.groups.length
          ? s.groups[s.currentIndex].beat
          : (last ? last.beat + last.durations[0] + 2 : 0);
      playhead.current += (targetBeat - playhead.current) * 0.16;
      comboPulse.current *= 0.9;
      hitPulse.current *= 0.88;

      ctx.clearRect(0, 0, width, height);
      const hitY = height - 26;

      // White-key column guides
      ctx.strokeStyle = 'rgba(148,163,184,0.10)';
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

      // Hit line (glows on impact)
      const glow = 0.4 + hitPulse.current * 0.6;
      ctx.save();
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 10 + hitPulse.current * 24;
      ctx.strokeStyle = `rgba(129,140,248,${glow})`;
      ctx.lineWidth = 2 + hitPulse.current * 3;
      ctx.beginPath();
      ctx.moveTo(0, hitY);
      ctx.lineTo(width, hitY);
      ctx.stroke();
      ctx.restore();

      // Falling note bars
      s.groups.forEach((group, i) => {
        const isCurrent = i === s.currentIndex;
        const isPast = i < s.currentIndex;
        group.midis.forEach((midi, ni) => {
          const cx = layout.centerX(midi);
          if (cx === null) return;
          const black = isBlackKey(midi);
          const w = black ? BLACK_W : WHITE_W - 8;
          const dur = group.durations[ni] ?? 1;
          const bottomY = hitY - (group.beat - playhead.current) * PX_PER_BEAT;
          const barH = Math.max(MIN_BAR_H, dur * PX_PER_BEAT - 6);
          const topY = bottomY - barH;
          if (bottomY < -20 || topY > height + 20) return;

          const rh = group.hands[ni] !== 'L';
          const palette = rh ? RH_COLOR : LH_COLOR;
          let fill = palette.future;
          let alpha = 1;
          if (isPast) alpha = 0.18;
          else if (isCurrent) fill = '#22c55e';

          ctx.save();
          ctx.globalAlpha = alpha;
          if (isCurrent) {
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 16;
          } else if (!isPast) {
            ctx.shadowColor = palette.glow;
            ctx.shadowBlur = 6;
          }
          ctx.fillStyle = fill;
          roundRect(ctx, cx - w / 2, topY, w, barH, 6);
          ctx.fill();
          // glossy top
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          roundRect(ctx, cx - w / 2 + 2, topY + 2, w - 4, 5, 3);
          ctx.fill();
          ctx.restore();

          const finger = group.fingers[ni];
          if (s.showFingers && finger && barH > 24) {
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(finger), cx, bottomY - 12);
          }
        });
      });

      // Hit effects (expanding rings + sparks)
      effects.current = effects.current.filter((fx) => now - fx.born < 480);
      for (const fx of effects.current) {
        const age = (now - fx.born) / 480; // 0..1
        const r = 6 + age * 34;
        const a = 1 - age;
        const col = fx.rh ? '129,140,248' : '34,211,238';
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = `rgba(${col},${a})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(fx.x, hitY, r, 0, Math.PI * 2);
        ctx.stroke();
        // sparks
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        for (let k = 0; k < 5; k++) {
          const ang = (k / 5) * Math.PI * 2 + age;
          const rr = r * 0.9;
          ctx.fillRect(fx.x + Math.cos(ang) * rr - 1.5, hitY + Math.sin(ang) * rr - 1.5, 3, 3);
        }
        ctx.restore();
      }

      // Combo counter
      if (combo.current > 1) {
        const scale = 1 + comboPulse.current * 0.5;
        ctx.save();
        ctx.translate(14, 26);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(250,204,21,0.6)';
        ctx.shadowBlur = 8;
        ctx.fillText(`✦ ${combo.current}x`, 0, 0);
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [height]);

  const canvas = (
    <canvas ref={canvasRef} style={{ display: 'block', width: layoutWidth, height }} aria-hidden />
  );
  if (!scroll) return canvas;
  return <div className={`overflow-x-auto ${className ?? ''}`}>{canvas}</div>;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
