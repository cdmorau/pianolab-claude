import { PianoKeyboard } from './PianoKeyboard';
import type { KeyDecorations } from './types';
import { FallingNotes } from '@/components/FallingNotes/FallingNotes';
import type { PlayGroup } from '@/utils/groups';

export interface PracticeStageProps {
  start: number;
  end: number;
  decorations?: KeyDecorations;
  onKeyDown?: (midi: number) => void;
  /** Falling-notes groups; when provided, the lane is shown above the keys. */
  groups?: PlayGroup[];
  currentIndex?: number;
  /** Continuous playhead (beats) for smooth playback; omit for practice mode. */
  playheadBeat?: number;
  forceShowFingers?: boolean;
  fallingHeight?: number;
}

/**
 * Falling-notes lane + keyboard, both stretched to the full available width so
 * the whole keyboard is always visible (no scroll) and the columns stay aligned.
 * Spans the full viewport width via `full-bleed`.
 */
export function PracticeStage({
  start,
  end,
  decorations,
  onKeyDown,
  groups,
  currentIndex = 0,
  playheadBeat,
  forceShowFingers,
  fallingHeight = 300,
}: PracticeStageProps) {
  return (
    <div className="full-bleed px-4">
      <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900/50">
        {groups && groups.length > 0 && (
          <FallingNotes
            groups={groups}
            currentIndex={currentIndex}
            playheadBeat={playheadBeat}
            startMidi={start}
            endMidi={end}
            height={fallingHeight}
            showFingers={forceShowFingers}
          />
        )}
        <PianoKeyboard
          startMidi={start}
          endMidi={end}
          decorations={decorations}
          onKeyDown={onKeyDown}
          enablePcKeyboard
          forceShowFingers={forceShowFingers}
        />
      </div>
    </div>
  );
}
