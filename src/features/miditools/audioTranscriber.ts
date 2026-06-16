import { buildMidi, type MidiNote } from './midiWriter';

export type ProgressFn = (label: string, pct: number) => void;

const MODEL_URL = 'https://unpkg.com/@spotify/basic-pitch@1.0.1/model/model.json';

// Basic Pitch: 88 keys A0–C8, index 0 = MIDI 21
const BP_MIDI_OFFSET = 21;
// Hop size used by Basic Pitch (256 samples @ 22050 Hz)
const BP_FRAME_SEC = 256 / 22050;

function fmtSec(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60).toString().padStart(2, '0');
  return m > 0 ? `${m}m${sec}s` : `${sec}s`;
}

/**
 * Sustain-aware note extractor that replaces outputToNotesPoly.
 *
 * Strategy:
 *  1. For each pitch, compute binary frame activity (frame value > frameThresh).
 *  2. Apply morphological dilation: expand every active sample by ±dilationFrames.
 *     This bridges micro-silences caused by the sustain pedal or natural piano decay
 *     without merging truly separate notes.
 *  3. Find connected "active regions" in the dilated signal.
 *  4. Within each region use the onset array to locate the actual attack frame.
 *     If no onset is found, use the first active frame (can happen on very soft notes).
 *  5. Emit one NoteEvent per region — no re-splitting on false re-triggers.
 */
function extractNotesSustain(
  frames: number[][],
  onsets: number[][],
  onsetThresh = 0.35,
  frameThresh = 0.2,
  dilationFrames = 15,   // 15 × 11.6 ms ≈ 174 ms bridge window
  minLenFrames = 5,      // ~58 ms minimum note length
): Array<{ startFrame: number; durationFrames: number; pitchMidi: number; amplitude: number }> {
  if (frames.length === 0) return [];
  const T = frames.length;
  const numPitches = frames[0].length;
  const notes: Array<{ startFrame: number; durationFrames: number; pitchMidi: number; amplitude: number }> = [];

  for (let p = 0; p < numPitches; p++) {
    // Step 1 + 2: dilated binary activity per frame
    const active = new Uint8Array(T);
    for (let t = 0; t < T; t++) {
      if (frames[t][p] > frameThresh) {
        const lo = Math.max(0, t - dilationFrames);
        const hi = Math.min(T, t + dilationFrames + 1);
        active.fill(1, lo, hi);
      }
    }

    // Step 3 + 4 + 5: connected regions → one note each
    let regionStart = -1;
    for (let t = 0; t <= T; t++) {
      const on = t < T && active[t] === 1;
      if (on && regionStart === -1) {
        regionStart = t;
      } else if (!on && regionStart !== -1) {
        const regionEnd = t;
        const dur = regionEnd - regionStart;
        if (dur >= minLenFrames) {
          // Find earliest onset in this region (= real attack)
          let attackFrame = regionStart;
          for (let i = regionStart; i < regionEnd; i++) {
            if (onsets[i][p] > onsetThresh) { attackFrame = i; break; }
          }
          // Average frame value over the full region as proxy for amplitude
          let ampSum = 0;
          for (let i = regionStart; i < regionEnd; i++) ampSum += frames[i][p];
          notes.push({
            startFrame: attackFrame,
            durationFrames: regionEnd - attackFrame,
            pitchMidi: p + BP_MIDI_OFFSET,
            amplitude: ampSum / dur,
          });
        }
        regionStart = -1;
      }
    }
  }

  return notes.sort((a, b) => a.startFrame - b.startFrame);
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

  const { BasicPitch } = await import('@spotify/basic-pitch');
  const bp = new BasicPitch(MODEL_URL);

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

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

  const raw = extractNotesSustain(frames, onsets);

  const notes: MidiNote[] = raw.map((n) => ({
    pitch: Math.max(0, Math.min(127, n.pitchMidi)),
    startSec: n.startFrame * BP_FRAME_SEC,
    endSec: Math.max(
      n.startFrame * BP_FRAME_SEC + 0.05,
      (n.startFrame + n.durationFrames) * BP_FRAME_SEC,
    ),
    velocity: Math.max(1, Math.min(127, Math.round(n.amplitude * 127))),
  }));

  onProgress('Listo', 100);
  return { midi: buildMidi(notes), noteCount: notes.length };
}
