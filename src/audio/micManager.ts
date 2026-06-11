import { PitchListener, type PitchReading } from './pitchDetector';

export type MicStatus = 'idle' | 'requesting' | 'listening' | 'denied' | 'unsupported';

type ReadingListener = (reading: PitchReading | null) => void;
type NoteListener = (midi: number, reading: PitchReading) => void;
type StatusListener = (status: MicStatus) => void;

// Frames a pitch must stay stable before it counts as a new note onset.
const ONSET_FRAMES = 3;
// Silence frames before we allow the same note to re-trigger.
const SILENCE_RESET_FRAMES = 6;

/**
 * Single shared microphone manager. Keeps one mic stream for the whole app,
 * broadcasts live readings (for the meter) and debounced note onsets (for
 * challenge validation). All processing is local to the browser.
 */
class MicManager {
  private listener: PitchListener | null = null;
  private status: MicStatus = 'idle';

  private readingListeners = new Set<ReadingListener>();
  private noteListeners = new Set<NoteListener>();
  private statusListeners = new Set<StatusListener>();

  private stableMidi: number | null = null;
  private stableCount = 0;
  private emittedMidi: number | null = null;
  private silenceCount = 0;

  getStatus(): MicStatus {
    return this.status;
  }

  private setStatus(status: MicStatus) {
    this.status = status;
    this.statusListeners.forEach((l) => l(status));
  }

  async enable(): Promise<void> {
    if (!PitchListener.isSupported()) {
      this.setStatus('unsupported');
      return;
    }
    if (this.status === 'listening' || this.status === 'requesting') return;
    this.setStatus('requesting');
    this.listener = new PitchListener({
      onPitch: (reading) => this.handlePitch(reading),
      onSilence: () => this.handleSilence(),
    });
    try {
      await this.listener.start();
      this.setStatus('listening');
    } catch {
      this.listener = null;
      this.setStatus('denied');
    }
  }

  disable(): void {
    this.listener?.stop();
    this.listener = null;
    this.stableMidi = null;
    this.stableCount = 0;
    this.emittedMidi = null;
    this.readingListeners.forEach((l) => l(null));
    if (this.status !== 'unsupported') this.setStatus('idle');
  }

  private handlePitch(reading: PitchReading) {
    this.silenceCount = 0;
    this.readingListeners.forEach((l) => l(reading));

    if (reading.midi === this.stableMidi) {
      this.stableCount += 1;
    } else {
      this.stableMidi = reading.midi;
      this.stableCount = 1;
    }
    if (this.stableCount === ONSET_FRAMES && this.emittedMidi !== reading.midi) {
      this.emittedMidi = reading.midi;
      this.noteListeners.forEach((l) => l(reading.midi, reading));
    }
  }

  private handleSilence() {
    this.silenceCount += 1;
    if (this.silenceCount === SILENCE_RESET_FRAMES) {
      this.emittedMidi = null;
      this.stableMidi = null;
      this.stableCount = 0;
      this.readingListeners.forEach((l) => l(null));
    }
  }

  onReading(cb: ReadingListener): () => void {
    this.readingListeners.add(cb);
    return () => this.readingListeners.delete(cb);
  }

  onNote(cb: NoteListener): () => void {
    this.noteListeners.add(cb);
    return () => this.noteListeners.delete(cb);
  }

  onStatus(cb: StatusListener): () => void {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }
}

export const micManager = new MicManager();
