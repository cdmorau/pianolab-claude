import { useEffect, useState } from 'react';
import { micManager, type MicStatus } from '@/audio/micManager';
import type { PitchReading } from '@/audio/pitchDetector';

/** Subscribe to live mic status + the latest pitch reading (for the meter). */
export function useMic() {
  const [status, setStatus] = useState<MicStatus>(micManager.getStatus());
  const [reading, setReading] = useState<PitchReading | null>(null);

  useEffect(() => {
    const offStatus = micManager.onStatus(setStatus);
    const offReading = micManager.onReading(setReading);
    return () => {
      offStatus();
      offReading();
    };
  }, []);

  return {
    status,
    reading,
    enable: () => micManager.enable(),
    disable: () => micManager.disable(),
  };
}

/** Subscribe to debounced note-onset events from the microphone. */
export function useMicNote(onNote: (midi: number) => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    return micManager.onNote((midi) => onNote(midi));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, onNote]);
}
