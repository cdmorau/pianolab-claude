import { buildMidi, type MidiNote } from './midiWriter';

export type ProgressFn = (label: string, pct: number) => void;

// Basic Pitch hop = 256 samples at sr = 22050 Hz
const BP_FRAME_SEC = 256 / 22050;

// Model loaded from unpkg CDN (cached by browser after first load, ~25 MB)
const MODEL_URL = 'https://unpkg.com/@spotify/basic-pitch@0.1.5/model/model.json';

function fmtSec(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60).toString().padStart(2, '0');
  return m > 0 ? `${m}m${sec}s` : `${sec}s`;
}

export async function transcribeAudio(
  file: File,
  onProgress: ProgressFn,
): Promise<{ midi: Uint8Array; noteCount: number }> {
  onProgress('Decodificando audio…', 5);

  const buf = await file.arrayBuffer();
  const ctx = new AudioContext();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await ctx.decodeAudioData(buf);
  } finally {
    await ctx.close();
  }

  onProgress('Cargando modelo de IA… (primera vez descarga ~25 MB desde CDN)', 10);

  const { BasicPitch, outputToNotesPoly } = await import('@spotify/basic-pitch');
  const bp = new BasicPitch(MODEL_URL);

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];
  const totalSec = audioBuffer.duration;

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
    () => {},
  );

  onProgress('Generando MIDI…', 92);

  const raw = outputToNotesPoly(frames, onsets, 0.25, 0.25, 5);

  const notes: MidiNote[] = raw.map(([sf, ef, pitch, amp]) => ({
    // Basic Pitch returns MIDI note numbers (21–108 for piano)
    pitch: Math.round(pitch < 21 ? pitch + 21 : pitch),
    startSec: sf * BP_FRAME_SEC,
    endSec: Math.max(sf * BP_FRAME_SEC + 0.05, ef * BP_FRAME_SEC),
    velocity: Math.max(1, Math.min(127, Math.round((amp ?? 0.7) * 100))),
  }));

  onProgress('Listo', 100);
  return { midi: buildMidi(notes), noteCount: notes.length };
}
