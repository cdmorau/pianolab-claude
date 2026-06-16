// Minimal ambient type declarations for @spotify/basic-pitch@1.0.1
// Full types are available after `npm install` in CI.
declare module '@spotify/basic-pitch' {
  export interface NoteEvent {
    startFrame: number;
    durationFrames: number;
    pitchMidi: number;
    amplitude: number;
    pitchBends?: number[];
  }

  export interface NoteEventTime {
    startTimeSeconds: number;
    durationSeconds: number;
    pitchMidi: number;
    amplitude: number;
    pitchBends?: number[];
  }

  export class BasicPitch {
    constructor(modelPath: string);
    /** audio must be 22050 Hz, mono. percentCallback receives 0–1. */
    evaluateModel(
      audio: AudioBuffer | Float32Array,
      onOutput: (
        frames: number[][],
        onsets: number[][],
        contours: number[][],
      ) => void,
      percentCallback: (pct: number) => void,
    ): Promise<void>;
  }

  export function outputToNotesPoly(
    frames: number[][],
    onsets: number[][],
    onsetThreshold: number,
    frameThreshold: number,
    minNoteLength: number,
  ): NoteEvent[];

  export function noteFramesToTime(notes: NoteEvent[]): NoteEventTime[];
}
