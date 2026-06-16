/**
 * Minimal Standard MIDI File (SMF) parser — formats 0 and 1.
 * Extracts note on/off events, full tempo map, and CC volume/expression.
 * Pure, dependency-free, and runs entirely in the browser.
 */

export interface TempoChange {
  /** Absolute tick at which this tempo becomes effective. */
  tick: number;
  /** Microseconds per beat. */
  microsPerBeat: number;
}

export interface ParsedNote {
  midi: number;
  /** Start time in ticks. */
  startTick: number;
  /** Duration in ticks. */
  durationTicks: number;
  /** Note-on velocity, 0..1 (scaled by CC#7 and CC#11). */
  velocity: number;
}

export interface ParsedMidi {
  /** Ticks per quarter note. */
  ticksPerQuarter: number;
  /** BPM from the first tempo event found (default 120). */
  bpm: number;
  beatsPerMeasure: number;
  notes: ParsedNote[];
  tempoMap: TempoChange[];
}

/**
 * Convert absolute ticks to beats at `primaryBpm` using the full tempo map.
 * Beats are measured in terms of primaryBpm quarter-notes (not the file's tempo).
 */
export function ticksToBeats(
  ticks: number,
  tempoMap: TempoChange[],
  ppq: number,
  primaryBpm: number,
): number {
  let elapsedMicros = 0;
  let lastTick = 0;
  let lastMicros = 500_000; // default 120 BPM

  for (const evt of tempoMap) {
    if (evt.tick >= ticks) break;
    elapsedMicros += ((evt.tick - lastTick) / ppq) * lastMicros;
    lastTick = evt.tick;
    lastMicros = evt.microsPerBeat;
  }
  elapsedMicros += ((ticks - lastTick) / ppq) * lastMicros;

  const seconds = elapsedMicros / 1_000_000;
  const beats = seconds * (primaryBpm / 60);
  return beats;
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

  let beatsPerMeasure = 4;
  const notes: ParsedNote[] = [];
  const tempoMap: TempoChange[] = [];

  // CC#7 (channel volume) and CC#11 (channel expression) per channel, default 127
  const cc7 = new Array<number>(16).fill(127);
  const cc11 = new Array<number>(16).fill(127);

  for (let track = 0; track < ntrks; track++) {
    if (r.pos + 8 > r.length) break;
    if (r.str(4) !== 'MTrk') break;
    const trackLen = r.u32();
    const trackEnd = r.pos + trackLen;
    let absTick = 0;
    let runningStatus = 0;
    // Pending note-ons keyed by (channel << 7 | note): { startTick, velocity }.
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
      const channel = status & 0x0f;

      if (status === 0xff) {
        // meta event
        const metaType = r.u8();
        const len = r.varInt();
        if (metaType === 0x51 && len === 3) {
          const us = (r.u8() << 16) | (r.u8() << 8) | r.u8();
          tempoMap.push({ tick: absTick, microsPerBeat: us });
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
        // Skip drum channel (channel 9 = MIDI channel 10)
        const note = r.u8();
        const velocity = r.u8();
        if (channel === 9) {
          // drums — skip
        } else if (type === 0x90 && velocity > 0) {
          // Scale velocity by CC#7 and CC#11
          const scaledVel = (velocity / 127) * (cc7[channel] / 127) * (cc11[channel] / 127);
          const key = (channel << 7) | note;
          pending.set(key, { tick: absTick, vel: scaledVel });
        } else {
          const key = (channel << 7) | note;
          const start = pending.get(key);
          if (start !== undefined) {
            notes.push({
              midi: note,
              startTick: start.tick,
              durationTicks: Math.max(1, absTick - start.tick),
              velocity: start.vel,
            });
            pending.delete(key);
          }
        }
      } else if (type === 0xb0) {
        // Control change
        const cc = r.u8();
        const val = r.u8();
        if (cc === 7) {
          cc7[channel] = val;
        } else if (cc === 11) {
          cc11[channel] = val;
        }
      } else if (type === 0xa0 || type === 0xe0) {
        r.pos += 2; // two data bytes
      } else if (type === 0xc0 || type === 0xd0) {
        r.pos += 1; // one data byte
      } else {
        r.pos += 1; // unknown — skip a byte to avoid looping
      }
    }
    r.pos = trackEnd;
  }

  // Sort tempo map by tick
  tempoMap.sort((a, b) => a.tick - b.tick);
  notes.sort((a, b) => a.startTick - b.startTick);

  // primaryBpm = BPM from first tempo event, default 120
  const primaryBpm =
    tempoMap.length > 0 ? Math.round(60_000_000 / tempoMap[0].microsPerBeat) : 120;

  return {
    ticksPerQuarter: ticksPerQuarter || 480,
    bpm: primaryBpm,
    beatsPerMeasure,
    notes,
    tempoMap,
  };
}
