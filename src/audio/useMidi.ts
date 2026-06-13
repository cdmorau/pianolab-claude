import { useEffect, useRef, useState } from 'react';
import { midiManager, type MidiConnectionState } from './midiManager';

/** Live MIDI connection status. Includes a `connect` action to (re)request access. */
export function useMidiConnection(): MidiConnectionState & { connect: () => void } {
  const [state, setState] = useState<MidiConnectionState>(() => midiManager.getState());

  useEffect(() => {
    return midiManager.onState((connected, deviceName) => {
      setState({ connected, deviceName, isSupported: midiManager.isSupported });
    });
  }, []);

  return { ...state, connect: () => void midiManager.connect() };
}

/**
 * Subscribe to MIDI note-on / note-off events using a stable ref pattern so
 * callers can pass inline closures without causing unnecessary re-subscriptions.
 */
export function useMidiNote(
  onNoteOn: (midi: number, velocity: number) => void,
  onNoteOff?: (midi: number) => void,
): void {
  const onNoteOnRef = useRef(onNoteOn);
  onNoteOnRef.current = onNoteOn;
  const onNoteOffRef = useRef(onNoteOff);
  onNoteOffRef.current = onNoteOff;

  useEffect(() => {
    const offOn = midiManager.onNoteOn((midi, vel) => onNoteOnRef.current(midi, vel));
    const offOff = midiManager.onNoteOff((midi) => onNoteOffRef.current?.(midi));
    return () => {
      offOn();
      offOff();
    };
  }, []);
}
