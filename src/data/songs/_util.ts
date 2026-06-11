import type { NoteEvent } from '@/types/song';
import type { Hand, Finger } from '@/types/music';

/** A compact melody entry: [midi, durationBeats, finger?]. */
export type MelodyItem = [midi: number, dur: number, finger?: Finger];

/**
 * Turn a flat list of melody items into timed NoteEvents, accumulating the
 * start beat from the durations. Useful for single-line (one hand) melodies.
 */
export function melody(items: MelodyItem[], hand: Hand = 'R', velocity = 0.85): NoteEvent[] {
  let beat = 0;
  return items.map(([midi, dur, finger]) => {
    const ev: NoteEvent = { midi, startBeat: beat, durationBeats: dur, hand, velocity };
    if (finger) ev.finger = finger;
    beat += dur;
    return ev;
  });
}

/** A harmony entry placed at an absolute beat: [startBeat, midis, dur]. */
export type HarmonyItem = [startBeat: number, midis: number[], dur: number];

/**
 * Build an accompaniment line (chords or bass) at absolute beat positions.
 * Each chord becomes several NoteEvents that start together — ideal for a
 * left-hand part that lines up with a right-hand `melody()`.
 */
export function harmony(items: HarmonyItem[], hand: Hand = 'L', velocity = 0.55): NoteEvent[] {
  const out: NoteEvent[] = [];
  for (const [startBeat, midis, dur] of items) {
    for (const midi of midis) {
      out.push({ midi, startBeat, durationBeats: dur, hand, velocity });
    }
  }
  return out;
}
