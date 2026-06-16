export interface MidiNote {
  pitch: number;    // MIDI 0–127
  startSec: number;
  endSec: number;
  velocity: number; // 1–127
}

/** Encodes a note list as a Format-0 SMF MIDI file (Uint8Array). */
export function buildMidi(notes: MidiNote[], bpm = 120): Uint8Array {
  const PPQ = 480;
  const uspb = Math.round(60_000_000 / bpm);

  function varLen(n: number): number[] {
    if (n === 0) return [0];
    const bytes: number[] = [];
    while (n > 0) { bytes.unshift(n & 0x7f); n >>= 7; }
    return bytes.map((b, i) => (i < bytes.length - 1 ? b | 0x80 : b));
  }

  const toBeat = (sec: number) => Math.round((sec * bpm / 60) * PPQ);

  interface Ev { tick: number; raw: number[] }

  const evs: Ev[] = [
    // Tempo meta event
    {
      tick: 0,
      raw: [0xff, 0x51, 0x03, (uspb >> 16) & 0xff, (uspb >> 8) & 0xff, uspb & 0xff],
    },
  ];

  for (const n of [...notes].sort((a, b) => a.startSec - b.startSec)) {
    const vel = Math.max(1, Math.min(127, Math.round(n.velocity)));
    evs.push({ tick: toBeat(n.startSec), raw: [0x90, n.pitch, vel] });
    evs.push({ tick: toBeat(n.endSec),   raw: [0x80, n.pitch, 0] });
  }

  // Sort by tick; note-offs before note-ons at the same tick
  evs.sort((a, b) => a.tick - b.tick || (a.raw[0] === 0x80 ? -1 : 1));

  const lastTick = evs.at(-1)?.tick ?? 0;
  evs.push({ tick: lastTick, raw: [0xff, 0x2f, 0x00] }); // end of track

  const track: number[] = [];
  let prev = 0;
  for (const ev of evs) {
    track.push(...varLen(ev.tick - prev));
    prev = ev.tick;
    track.push(...ev.raw);
  }

  const tl = track.length;
  return new Uint8Array([
    // MThd
    0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06,
    0x00, 0x00,                         // format 0
    0x00, 0x01,                         // 1 track
    (PPQ >> 8) & 0xff, PPQ & 0xff,      // ticks per quarter
    // MTrk
    0x4d, 0x54, 0x72, 0x6b,
    (tl >> 24) & 0xff, (tl >> 16) & 0xff, (tl >> 8) & 0xff, tl & 0xff,
    ...track,
  ]);
}
