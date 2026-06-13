/**
 * Singleton Web MIDI manager.
 * Works with USB MIDI, Bluetooth MIDI (paired at OS level), and virtual ports.
 * Handles sustain pedal (CC#64), auto-reconnects when devices are added/removed.
 */

type NoteOnCb = (midi: number, velocity: number) => void;
type NoteOffCb = (midi: number) => void;
type StateCb = (connected: boolean, deviceName: string | undefined) => void;

export interface MidiConnectionState {
  connected: boolean;
  deviceName: string | undefined;
  isSupported: boolean;
}

class MidiManager {
  private access: MIDIAccess | null = null;
  private noteOnListeners = new Set<NoteOnCb>();
  private noteOffListeners = new Set<NoteOffCb>();
  private stateListeners = new Set<StateCb>();
  private sustainOn = false;
  private sustainedNotes = new Set<number>();
  private connecting = false;
  private _connected = false;
  private _deviceName: string | undefined;

  readonly isSupported: boolean =
    typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;

  getState(): MidiConnectionState {
    return {
      connected: this._connected,
      deviceName: this._deviceName,
      isSupported: this.isSupported,
    };
  }

  async connect(): Promise<void> {
    if (!this.isSupported || this.connecting) return;
    this.connecting = true;
    try {
      this.access = await navigator.requestMIDIAccess({ sysex: false });
      this.attachInputs();
      this.access.onstatechange = () => this.attachInputs();
    } catch {
      this.setConnected(false, undefined);
    } finally {
      this.connecting = false;
    }
  }

  private attachInputs(): void {
    if (!this.access) return;
    const inputs = Array.from(this.access.inputs.values());
    inputs.forEach((input) => {
      input.onmidimessage = (e) => this.handleMessage(e);
    });
    this.setConnected(inputs.length > 0, inputs[0]?.name);
  }

  private setConnected(connected: boolean, deviceName: string | undefined): void {
    this._connected = connected;
    this._deviceName = deviceName;
    this.stateListeners.forEach((l) => l(connected, deviceName));
  }

  private handleMessage(e: MIDIMessageEvent): void {
    const data = e.data;
    if (!data || data.length < 2) return;
    const status = data[0];
    const data1 = data[1];
    const data2 = data.length > 2 ? data[2] : 0;
    const cmd = status & 0xf0;

    // Sustain pedal CC#64
    if (cmd === 0xb0 && data1 === 64) {
      this.sustainOn = data2 >= 64;
      if (!this.sustainOn) {
        this.sustainedNotes.forEach((midi) =>
          this.noteOffListeners.forEach((l) => l(midi)),
        );
        this.sustainedNotes.clear();
      }
      return;
    }

    if (cmd === 0x90 && data2 > 0) {
      this.noteOnListeners.forEach((l) => l(data1, data2 / 127));
    } else if (cmd === 0x80 || (cmd === 0x90 && data2 === 0)) {
      if (this.sustainOn) {
        this.sustainedNotes.add(data1);
      } else {
        this.noteOffListeners.forEach((l) => l(data1));
      }
    }
  }

  onNoteOn(cb: NoteOnCb): () => void {
    this.noteOnListeners.add(cb);
    return () => this.noteOnListeners.delete(cb);
  }

  onNoteOff(cb: NoteOffCb): () => void {
    this.noteOffListeners.add(cb);
    return () => this.noteOffListeners.delete(cb);
  }

  onState(cb: StateCb): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }
}

export const midiManager = new MidiManager();

// Try auto-connecting on load (no user gesture required for non-sysex MIDI in Chrome/Edge).
// The user can also click "Connect MIDI" manually.
if (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator) {
  void midiManager.connect();
}
