import type { NoteEvent } from '@/types/song';
import type { Hand } from '@/types/music';

export interface PlayGroup {
  beat: number;
  midis: number[];
  durations: number[];
  fingers: (number | undefined)[];
  hands: Hand[];
}

/** Group note events that start on the same beat into chords, ordered in time. */
export function groupByBeat(notes: NoteEvent[], hand: Hand | 'both' = 'both'): PlayGroup[] {
  const filtered = hand === 'both' ? notes : notes.filter((n) => n.hand === hand);
  const byBeat = new Map<number, PlayGroup>();
  for (const n of filtered) {
    const key = Math.round(n.startBeat * 1000) / 1000;
    let group = byBeat.get(key);
    if (!group) {
      group = { beat: key, midis: [], durations: [], fingers: [], hands: [] };
      byBeat.set(key, group);
    }
    group.midis.push(n.midi);
    group.durations.push(n.durationBeats);
    group.fingers.push(n.finger);
    group.hands.push(n.hand);
  }
  return [...byBeat.values()].sort((a, b) => a.beat - b.beat);
}

/** Build evenly-spaced groups (1 beat apart) from a simple note list — used by
 * step-based challenges that have no real timing. */
export function evenGroups(
  steps: { midis: number[]; fingers?: (number | undefined)[] }[],
  hand: Hand = 'R',
): PlayGroup[] {
  return steps.map((s, i) => ({
    beat: i,
    midis: s.midis,
    durations: s.midis.map(() => 1),
    fingers: s.fingers ?? s.midis.map(() => undefined),
    hands: s.midis.map(() => hand),
  }));
}
