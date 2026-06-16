import { buildMidi, type MidiNote } from './midiWriter';

export type ProgressFn = (label: string, pct: number) => void;

// Black pitch-classes: C#=1 D#=3 F#=6 G#=8 A#=10
const BLACK_PCS = new Set([1, 3, 6, 8, 10]);

interface KeyInfo { midi: number; xNorm: number; isBlack: boolean }

function buildKeyLayout(): KeyInfo[] {
  const layout: KeyInfo[] = [];
  let wi = 0; // white-key index 0–51
  for (let midi = 21; midi <= 108; midi++) {
    const isBlack = BLACK_PCS.has(midi % 12);
    // Black key sits between the previous and current white-key centre
    layout.push({ midi, xNorm: isBlack ? (wi - 0.5) / 52 : (wi + 0.5) / 52, isBlack });
    if (!isBlack) wi++;
  }
  return layout;
}

const KEY_LAYOUT = buildKeyLayout();

function isActiveKey(r: number, g: number, b: number, isBlack: boolean): boolean {
  const mx = Math.max(r, g, b) / 255;
  const mn = Math.min(r, g, b) / 255;
  const sat = mx === 0 ? 0 : (mx - mn) / mx;
  // Colored note overlay (high saturation → active)
  if (sat > 0.30 && mx > 0.25) return true;
  // White key with light color tint (shadow from falling note)
  if (!isBlack && sat > 0.15 && mx > 0.50) return true;
  return false;
}

export async function detectSynthesia(
  file: File,
  onProgress: ProgressFn,
): Promise<{ midi: Uint8Array; noteCount: number }> {
  onProgress('Cargando video…', 5);

  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.src = url;

  await new Promise<void>((res, rej) => {
    video.onloadedmetadata = () => res();
    video.onerror = () => rej(new Error('No se pudo cargar el video'));
    setTimeout(() => rej(new Error('Tiempo de carga excedido')), 30_000);
  });

  const { duration, videoWidth: W, videoHeight: H } = video;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx2d = canvas.getContext('2d')!;

  // Sample a horizontal strip at ~82% height (top of the piano key area in most Synthesia videos)
  const sampleY = Math.floor(H * 0.82);

  // 8 fps — good balance between accuracy and processing speed
  const FPS = 8;
  const totalFrames = Math.max(1, Math.floor(duration * FPS));

  const activeAt = new Map<number, number>(); // midi → note-on time (seconds)
  const notes: MidiNote[] = [];

  for (let fi = 0; fi < totalFrames; fi++) {
    const t = Math.min(fi / FPS, duration - 0.01);
    video.currentTime = t;
    await new Promise<void>((res) => { video.onseeked = () => res(); });

    ctx2d.drawImage(video, 0, 0, W, H);
    const { data } = ctx2d.getImageData(0, sampleY, W, 1);

    onProgress(
      `Analizando fotograma ${fi + 1} / ${totalFrames}…`,
      5 + (fi / totalFrames) * 85,
    );

    for (const { midi, xNorm, isBlack } of KEY_LAYOUT) {
      const x = Math.min(W - 1, Math.max(0, Math.floor(xNorm * W)));
      const i = x * 4;
      const active = isActiveKey(data[i], data[i + 1], data[i + 2], isBlack);

      if (active && !activeAt.has(midi)) {
        activeAt.set(midi, t);
      } else if (!active && activeAt.has(midi)) {
        const start = activeAt.get(midi)!;
        if (t - start >= 0.05) {
          notes.push({ pitch: midi, startSec: start, endSec: t, velocity: 80 });
        }
        activeAt.delete(midi);
      }
    }
  }

  // Close any notes still held at the end of the video
  for (const [midi, start] of activeAt) {
    notes.push({ pitch: midi, startSec: start, endSec: duration, velocity: 80 });
  }

  URL.revokeObjectURL(url);
  onProgress('Generando MIDI…', 92);

  return { midi: buildMidi(notes), noteCount: notes.length };
}
