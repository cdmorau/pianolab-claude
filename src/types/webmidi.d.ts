// Minimal Web MIDI API type declarations (not included in lib.dom.d.ts).
// Only the subset used by src/audio/midi.ts is declared.

interface MIDIMessageEvent extends Event {
  readonly data: Uint8Array | null;
}

interface MIDIInput extends EventTarget {
  readonly id: string;
  readonly name?: string;
  onmidimessage: ((event: MIDIMessageEvent) => void) | null;
}

interface MIDIInputMap {
  values(): IterableIterator<MIDIInput>;
}

interface MIDIAccess extends EventTarget {
  readonly inputs: MIDIInputMap;
}

interface Navigator {
  requestMIDIAccess(options?: { sysex?: boolean }): Promise<MIDIAccess>;
}
