/**
 * Optional Web MIDI input. Lets a physical MIDI keyboard drive the app.
 * Gracefully no-ops in browsers without Web MIDI support.
 */

type NoteOnHandler = (midi: number, velocity: number) => void;
type NoteOffHandler = (midi: number) => void;

export interface MidiConnection {
  /** True if at least one MIDI input device is connected. */
  hasDevice: boolean;
  /** First connected device name, if any. */
  deviceName?: string;
  /** Stop listening and detach handlers. */
  disconnect: () => void;
}

export function isMidiSupported(): boolean {
  return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
}

/**
 * Connect to Web MIDI inputs. Calls `onNoteOn`/`onNoteOff` for note messages.
 * Returns null if Web MIDI is unsupported or access is denied.
 */
export async function connectMidi(
  onNoteOn: NoteOnHandler,
  onNoteOff: NoteOffHandler,
): Promise<MidiConnection | null> {
  if (!isMidiSupported()) return null;
  let access: MIDIAccess;
  try {
    access = await navigator.requestMIDIAccess();
  } catch {
    return null;
  }

  const handleMessage = (event: MIDIMessageEvent) => {
    const data = event.data;
    if (!data || data.length < 3) return;
    const [status, note, velocity] = data;
    const command = status & 0xf0;
    if (command === 0x90 && velocity > 0) {
      onNoteOn(note, velocity / 127);
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      onNoteOff(note);
    }
  };

  const inputs = Array.from(access.inputs.values());
  inputs.forEach((input) => {
    input.onmidimessage = handleMessage;
  });

  return {
    hasDevice: inputs.length > 0,
    deviceName: inputs[0]?.name ?? undefined,
    disconnect: () => {
      inputs.forEach((input) => {
        input.onmidimessage = null;
      });
    },
  };
}
