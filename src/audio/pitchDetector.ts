import { PitchDetector } from 'pitchy';
import { centsOff, freqToMidi } from './notes';

export interface PitchReading {
  /** Detected fundamental frequency in Hz. */
  freq: number;
  /** Nearest MIDI note number. */
  midi: number;
  /** Cents off from the nearest equal-tempered note (-50..50). */
  cents: number;
  /** Confidence from the McLeod pitch method, 0..1. */
  clarity: number;
}

export interface PitchListenerOptions {
  /** Called on every frame with a confident reading. */
  onPitch: (reading: PitchReading) => void;
  /** Called when the input is silent / unclear. */
  onSilence?: () => void;
  /** Minimum clarity to accept a reading. Default 0.9. */
  minClarity?: number;
  /** Minimum RMS level to consider the signal non-silent. Default 0.01. */
  minVolume?: number;
}

/**
 * Real-time microphone pitch detection using the Web Audio API + Pitchy
 * (McLeod Pitch Method). 100% local — audio never leaves the browser.
 */
export class PitchListener {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private detector: PitchDetector<Float32Array> | null = null;
  private buffer: Float32Array | null = null;
  private rafId: number | null = null;
  private running = false;

  private readonly minClarity: number;
  private readonly minVolume: number;
  private readonly onPitch: (reading: PitchReading) => void;
  private readonly onSilence?: () => void;

  constructor(options: PitchListenerOptions) {
    this.onPitch = options.onPitch;
    this.onSilence = options.onSilence;
    this.minClarity = options.minClarity ?? 0.9;
    this.minVolume = options.minVolume ?? 0.01;
  }

  static isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  /** Request mic access and begin the detection loop. Throws on denial. */
  async start(): Promise<void> {
    if (this.running) return;
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
      },
    });
    const AudioCtx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioContext = new AudioCtx();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    source.connect(this.analyser);

    this.detector = PitchDetector.forFloat32Array(this.analyser.fftSize);
    this.buffer = new Float32Array(this.detector.inputLength);
    this.running = true;
    this.loop();
  }

  private loop = (): void => {
    if (!this.running || !this.analyser || !this.detector || !this.buffer || !this.audioContext) {
      return;
    }
    this.analyser.getFloatTimeDomainData(this.buffer);

    // RMS gate to ignore background silence.
    let sumSquares = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      sumSquares += this.buffer[i] * this.buffer[i];
    }
    const rms = Math.sqrt(sumSquares / this.buffer.length);

    if (rms >= this.minVolume) {
      const [freq, clarity] = this.detector.findPitch(this.buffer, this.audioContext.sampleRate);
      if (clarity >= this.minClarity && freq > 0) {
        this.onPitch({ freq, midi: freqToMidi(freq), cents: centsOff(freq), clarity });
      } else {
        this.onSilence?.();
      }
    } else {
      this.onSilence?.();
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  /** Stop detection and release the microphone. */
  stop(): void {
    this.running = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    void this.audioContext?.close();
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
    this.detector = null;
    this.buffer = null;
  }

  get isRunning(): boolean {
    return this.running;
  }
}
