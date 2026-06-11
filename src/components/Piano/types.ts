import type { Finger } from '@/types/music';

/** Visual state applied to a single key. */
export type KeyHighlight =
  | 'target' // the note the user should play next
  | 'correct' // just played correctly
  | 'wrong' // just played incorrectly
  | 'almost' // right pitch class, wrong octave (or close in tune)
  | 'hint'; // shown as the revealed answer

export interface KeyDecoration {
  highlight?: KeyHighlight;
  finger?: Finger;
  /** Optional short label drawn on the key (overrides note name). */
  label?: string;
}

/** Map of MIDI note -> decoration. */
export type KeyDecorations = Record<number, KeyDecoration>;
