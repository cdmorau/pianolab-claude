import type { NoteEvent } from '@/types/song';
import type { Hand } from '@/types/music';

export interface PlayGroup {
  beat: number;
  midis: number[];
  fingers: (number | undefined)[];
}

/** Group note events that start on the same beat into chords, ordered in time. */
export function groupByBeat(notes: NoteEvent[], hand: Hand | 'both' = 'both'): PlayGroup[] {
  const filtered = hand === 'both' ? notes : notes.filter((n) => n.hand === hand);
  const byBeat = new Map<number, PlayGroup>();
  for (const n of filtered) {
    const key = Math.round(n.startBeat * 1000) / 1000;
    let group = byBeat.get(key);
    if (!group) {
      group = { beat: key, midis: [], fingers: [] };
      byBeat.set(key, group);
    }
    group.midis.push(n.midi);
    group.fingers.push(n.finger);
  }
  return [...byBeat.values()].sort((a, b) => a.beat - b.beat);
}
