/**
 * Minimal Standard MIDI File (SMF) parser — formats 0 and 1.
 * Extracts note on/off events and the initial tempo. Pure, dependency-free,
 * and runs entirely in the browser. Good enough to import simple piano MIDI.
 */

export interface ParsedNote {
  midi: number;
  /** Start time in ticks. */
  startTick: number;
  /** Duration in ticks. */
  durationTicks: number;
  /** Note-on velocity, 0..1. */
  velocity: number;
}

export interface ParsedMidi {
  /** Ticks per quarter note. */
  ticksPerQuarter: number;
  bpm: number;
  beatsPerMeasure: number;
  notes: ParsedNote[];
}

class Reader {
  pos = 0;
  constructor(private readonly view: DataView) {}
  u8(): number {
    return this.view.getUint8(this.pos++);
  }
  u16(): number {
    const v = this.view.getUint16(this.pos);
    this.pos += 2;
    return v;
  }
  u32(): number {
    const v = this.view.getUint32(this.pos);
    this.pos += 4;
    return v;
  }
  str(len: number): string {
    let s = '';
    for (let i = 0; i < len; i++) s += String.fromCharCode(this.view.getUint8(this.pos++));
    return s;
  }
  /** MIDI variable-length quantity. */
  varInt(): number {
    let value = 0;
    let byte = 0;
    do {
      byte = this.view.getUint8(this.pos++);
      value = (value << 7) | (byte & 0x7f);
    } while (byte & 0x80);
    return value;
  }
  get length(): number {
    return this.view.byteLength;
  }
}

export function parseSmf(buffer: ArrayBuffer): ParsedMidi {
  const r = new Reader(new DataView(buffer));
  if (r.str(4) !== 'MThd') throw new Error('Not a MIDI file');
  r.u32(); // header length (6)
  r.u16(); // format
  const ntrks = r.u16();
  const division = r.u16();
  const ticksPerQuarter = division & 0x8000 ? 480 : division; // ignore SMPTE, fall back

  let bpm = 120;
  let beatsPerMeasure = 4;
  const notes: ParsedNote[] = [];

  for (let track = 0; track < ntrks; track++) {
    if (r.pos + 8 > r.length) break;
    if (r.str(4) !== 'MTrk') break;
    const trackLen = r.u32();
    const trackEnd = r.pos + trackLen;
    let absTick = 0;
    let runningStatus = 0;
    // Pending note-ons keyed by note number: { startTick, velocity }.
    const pending = new Map<number, { tick: number; vel: number }>();

    while (r.pos < trackEnd) {
      absTick += r.varInt();
      let status = r.u8();
      if (status < 0x80) {
        // running status: reuse last, rewind one byte
        r.pos--;
        status = runningStatus;
      } else {
        runningStatus = status;
      }
      const type = status & 0xf0;

      if (status === 0xff) {
        // meta event
        const metaType = r.u8();
        const len = r.varInt();
        if (metaType === 0x51 && len === 3) {
          const us = (r.u8() << 16) | (r.u8() << 8) | r.u8();
          bpm = Math.round(60_000_000 / us);
        } else if (metaType === 0x58 && len >= 2) {
          beatsPerMeasure = r.u8();
          r.pos += len - 1;
        } else {
          r.pos += len;
        }
      } else if (status === 0xf0 || status === 0xf7) {
        const len = r.varInt();
        r.pos += len;
      } else if (type === 0x90 || type === 0x80) {
        const note = r.u8();
        const velocity = r.u8();
        if (type === 0x90 && velocity > 0) {
          pending.set(note, { tick: absTick, vel: velocity / 127 });
        } else {
          const start = pending.get(note);
          if (start !== undefined) {
            notes.push({
              midi: note,
              startTick: start.tick,
              durationTicks: Math.max(1, absTick - start.tick),
              velocity: start.vel,
            });
            pending.delete(note);
          }
        }
      } else if (type === 0xa0 || type === 0xb0 || type === 0xe0) {
        r.pos += 2; // two data bytes
      } else if (type === 0xc0 || type === 0xd0) {
        r.pos += 1; // one data byte
      } else {
        r.pos += 1; // unknown — skip a byte to avoid looping
      }
    }
    r.pos = trackEnd;
  }

  notes.sort((a, b) => a.startTick - b.startTick);
  return { ticksPerQuarter: ticksPerQuarter || 480, bpm, beatsPerMeasure, notes };
}
