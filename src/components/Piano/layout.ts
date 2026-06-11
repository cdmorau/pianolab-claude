import { isBlackKey } from '@/audio/notes';

/** Shared keyboard geometry so the falling-notes lane aligns with the keys. */
export const WHITE_W = 40;
export const WHITE_H = 180;
export const BLACK_W = 26;
export const BLACK_H = 112;

export interface KeyboardLayout {
  width: number;
  /** Center x of a given MIDI key, or null if out of range. */
  centerX: (midi: number) => number | null;
  isBlack: (midi: number) => boolean;
}

export function buildLayout(startMidi: number, endMidi: number): KeyboardLayout {
  const whiteIndexByMidi = new Map<number, number>();
  let wi = 0;
  for (let m = startMidi; m <= endMidi; m++) {
    if (!isBlackKey(m)) {
      whiteIndexByMidi.set(m, wi);
      wi++;
    }
  }
  const width = wi * WHITE_W;

  const centerX = (midi: number): number | null => {
    if (midi < startMidi || midi > endMidi) return null;
    if (!isBlackKey(midi)) {
      const idx = whiteIndexByMidi.get(midi);
      return idx === undefined ? null : idx * WHITE_W + WHITE_W / 2;
    }
    const leftWhiteIndex = whiteIndexByMidi.get(midi - 1);
    if (leftWhiteIndex === undefined) return null;
    return (leftWhiteIndex + 1) * WHITE_W; // boundary between two white keys
  };

  return { width, centerX, isBlack: isBlackKey };
}
