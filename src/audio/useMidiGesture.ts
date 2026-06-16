import { useRef } from 'react';
import { useMidiNote } from './useMidi';

export interface GestureDef {
  note: number;
  taps: number;
  windowMs?: number;
  action: () => void;
}

export function useMidiGesture(gestures: GestureDef[]): void {
  const tapBuffers = useRef(new Map<number, number[]>());
  const gesturesRef = useRef(gestures);
  gesturesRef.current = gestures;

  useMidiNote((midi) => {
    const now = performance.now();
    const buf = (tapBuffers.current.get(midi) ?? []).filter((t) => now - t < 3000);
    buf.push(now);
    tapBuffers.current.set(midi, buf);
    for (const g of gesturesRef.current) {
      if (g.note !== midi) continue;
      const win = g.windowMs ?? 1500;
      if (buf.length >= g.taps) {
        const recent = buf.slice(-g.taps);
        if (recent[recent.length - 1] - recent[0] < win) {
          g.action();
          tapBuffers.current.set(midi, []);
          break;
        }
      }
    }
  });
}
