import { buildMidi, type MidiNote } from './midiWriter';

export type ProgressFn = (label: string, pct: number) => void;

const MODEL_URL = 'https://unpkg.com/@spotify/basic-pitch@1.0.1/model/model.json';

function fmtSec(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60).toString().padStart(2, '0');
  return m > 0 ? `${m}m${sec}s` : `${sec}s`;
}

/**
 * Merges consecutive same-pitch notes whose gap is below the threshold.
 * Converts repeated re-triggers from the sustain pedal into a single held note.
 */
function mergeNotes(notes: MidiNote[], maxGapSec = 0.12): MidiNote[] {
  const byPitch = new Map<number, MidiNote[]>();
  for (const note of notes) {
    const bucket = byPitch.get(note.pitch);
    if (bucket) bucket.push(note);
    else byPitch.set(note.pitch, [note]);
  }

  const merged: MidiNote[] = [];
  for (const pitchNotes of byPitch.values()) {
    pitchNotes.sort((a, b) => a.startSec - b.startSec);
    let cur = { ...pitchNotes[0] };
    for (let i = 1; i < pitchNotes.length; i++) {
      const next = pitchNotes[i];
      if (next.startSec - cur.endSec <= maxGapSec) {
        cur.endSec = Math.max(cur.endSec, next.endSec);
        cur.velocity = Math.max(cur.velocity, next.velocity);
      } else {
        merged.push(cur);
        cur = { ...next };
      }
    }
    merged.push(cur);
  }

  return merged.sort((a, b) => a.startSec - b.startSec);
}

/** Decode audio file and resample to 22050 Hz mono (required by Basic Pitch). */
async function prepareBuffer(file: File): Promise<AudioBuffer> {
  const arrayBuf = await file.arrayBuffer();
  const tmpCtx = new AudioContext();
  const decoded = await tmpCtx.decodeAudioData(arrayBuf);
  await tmpCtx.close();

  const TARGET_SR = 22050;
  if (decoded.sampleRate === TARGET_SR && decoded.numberOfChannels === 1) {
    return decoded;
  }

  // Resample + mix to mono via OfflineAudioContext
  const offlineCtx = new OfflineAudioContext(
    1,
    Math.ceil(decoded.duration * TARGET_SR),
    TARGET_SR,
  );
  const src = offlineCtx.createBufferSource();
  src.buffer = decoded;
  src.connect(offlineCtx.destination);
  src.start();
  return offlineCtx.startRendering();
}

export async function transcribeAudio(
  file: File,
  onProgress: ProgressFn,
): Promise<{ midi: Uint8Array; noteCount: number }> {
  onProgress('Decodificando audio…', 5);
  const audioBuffer = await prepareBuffer(file);
  const totalSec = audioBuffer.duration;

  onProgress('Cargando modelo de IA… (primera vez descarga ~25 MB desde CDN)', 10);

  // Dynamic import keeps TF.js out of the initial bundle
  const { BasicPitch, outputToNotesPoly, noteFramesToTime } = await import('@spotify/basic-pitch');
  const bp = new BasicPitch(MODEL_URL);

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  // Basic Pitch: hop = 256 samples at 22050 Hz → seconds per frame
  const BP_FRAME_SEC = 256 / 22050;

  await bp.evaluateModel(
    audioBuffer,
    (f, o, c) => {
      frames.push(...f);
      onsets.push(...o);
      contours.push(...c);
      const done = frames.length * BP_FRAME_SEC;
      const pct = 15 + Math.min(75, (done / totalSec) * 75);
      onProgress(`Transcribiendo… ${fmtSec(done)} / ${fmtSec(totalSec)}`, pct);
    },
    // percentCallback receives 0–1
    () => {},
  );

  onProgress('Generando MIDI…', 92);

  // onsetThreshold=0.5 requires more confidence before marking a new attack,
  // which suppresses false re-triggers on notes held with the sustain pedal.
  // minNoteLength=8 (~93 ms) filters out very short spurious events.
  const raw = outputToNotesPoly(frames, onsets, 0.5, 0.25, 8);
  const timed = noteFramesToTime(raw);

  const mapped: MidiNote[] = timed.map((n) => ({
    pitch: Math.max(0, Math.min(127, Math.round(n.pitchMidi))),
    startSec: n.startTimeSeconds,
    endSec: Math.max(n.startTimeSeconds + 0.05, n.startTimeSeconds + n.durationSeconds),
    velocity: Math.max(1, Math.min(127, Math.round(n.amplitude * 100))),
  }));

  // Bridge micro-gaps (< 120 ms) between same-pitch notes caused by pedal sustain.
  const notes = mergeNotes(mapped);

  onProgress('Listo', 100);
  return { midi: buildMidi(notes), noteCount: notes.length };
}
