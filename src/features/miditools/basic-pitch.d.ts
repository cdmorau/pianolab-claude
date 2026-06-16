// Minimal ambient type declarations for @spotify/basic-pitch
// The full types are available once `npm install` runs in CI.
declare module '@spotify/basic-pitch' {
  export class BasicPitch {
    constructor(modelPath: string);
    evaluateModel(
      audio: AudioBuffer,
      onOutput: (
        frames: number[][],
        onsets: number[][],
        contours: number[][],
      ) => void,
      onProgress: (pct: number) => void,
    ): Promise<void>;
  }

  /** Returns [startFrame, endFrame, pitchMidi, amplitude][] */
  export function outputToNotesPoly(
    frames: number[][],
    onsets: number[][],
    onsetThreshold: number,
    frameThreshold: number,
    minNoteLength: number,
  ): [number, number, number, number][];
}
