import { useLayoutEffect, useRef } from 'react';
import { PianoKeyboard } from './PianoKeyboard';
import { buildLayout } from './layout';
import type { KeyDecorations } from './types';
import { FallingNotes } from '@/components/FallingNotes/FallingNotes';
import type { PlayGroup } from '@/utils/groups';
import { useSettings } from '@/state/settingsStore';

export interface PracticeStageProps {
  start: number;
  end: number;
  decorations?: KeyDecorations;
  onKeyDown?: (midi: number) => void;
  /** Falling-notes groups; when provided, the lane is shown above the keys. */
  groups?: PlayGroup[];
  currentIndex?: number;
  /** MIDI note to keep centered when the keyboard is wider than the viewport. */
  focusMidi?: number;
  forceShowFingers?: boolean;
  fallingHeight?: number;
}

/**
 * Falling-notes lane + keyboard sharing ONE horizontal scroll container, so
 * the columns stay aligned and the whole stage scrolls/centers together.
 */
export function PracticeStage({
  start,
  end,
  decorations,
  onKeyDown,
  groups,
  currentIndex = 0,
  focusMidi = 60,
  forceShowFingers,
  fallingHeight = 280,
}: PracticeStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const showFingers = useSettings((s) => s.showFingers);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const layout = buildLayout(start, end);
    const cx = layout.centerX(focusMidi) ?? layout.width / 2;
    if (layout.width > el.clientWidth) {
      el.scrollLeft = Math.max(0, cx - el.clientWidth / 2);
    }
  }, [start, end, focusMidi]);

  return (
    <div
      ref={ref}
      className="overflow-x-auto rounded-xl bg-slate-100 dark:bg-slate-900/50"
      style={{ touchAction: 'pan-x' }}
    >
      {groups && groups.length > 0 && (
        <FallingNotes
          groups={groups}
          currentIndex={currentIndex}
          startMidi={start}
          endMidi={end}
          height={fallingHeight}
          showFingers={forceShowFingers ?? showFingers}
          scroll={false}
        />
      )}
      <PianoKeyboard
        startMidi={start}
        endMidi={end}
        decorations={decorations}
        onKeyDown={onKeyDown}
        enablePcKeyboard
        forceShowFingers={forceShowFingers}
        scroll={false}
      />
    </div>
  );
}
