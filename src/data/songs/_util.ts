import type { NoteEvent } from '@/types/song';
import type { Hand, Finger } from '@/types/music';

/** A compact melody entry: [midi, durationBeats, finger?]. */
export type MelodyItem = [midi: number, dur: number, finger?: Finger];

/**
 * Turn a flat list of melody items into timed NoteEvents, accumulating the
 * start beat from the durations. Useful for single-line (one hand) melodies.
 */
export function melody(items: MelodyItem[], hand: Hand = 'R'): NoteEvent[] {
  let beat = 0;
  return items.map(([midi, dur, finger]) => {
    const ev: NoteEvent = { midi, startBeat: beat, durationBeats: dur, hand };
    if (finger) ev.finger = finger;
    beat += dur;
    return ev;
  });
}
