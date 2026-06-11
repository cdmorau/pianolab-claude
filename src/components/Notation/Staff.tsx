import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Annotation } from 'vexflow';
import { pitchClass, octaveOf } from '@/audio/notes';
import { PITCH_CLASS_NAMES_SHARP } from '@/types/music';

/** A staff item is either a single MIDI note or a chord (several MIDI notes). */
export type StaffItem = number | number[];

export interface StaffProps {
  items: StaffItem[];
  /** Optional finger numbers aligned to each item. */
  fingers?: (number | undefined)[];
  clef?: 'treble' | 'bass';
  /** Index of the item to highlight (e.g. the current target). */
  highlightIndex?: number;
  className?: string;
}

function midiToVexKeyParts(midi: number): { key: string; accidental: '#' | null } {
  const pc = pitchClass(midi);
  const name = PITCH_CLASS_NAMES_SHARP[pc];
  const letter = name[0].toLowerCase();
  const accidental = name.length > 1 ? '#' : null;
  return { key: `${letter}${accidental ?? ''}/${octaveOf(midi)}`, accidental };
}

export function Staff({ items, fingers, clef = 'treble', highlightIndex, className }: StaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';
    if (items.length === 0) return;

    try {
      const noteWidth = 46;
      const width = Math.max(180, items.length * noteWidth + 80);
      const height = 150;
      const renderer = new Renderer(el, Renderer.Backends.SVG);
      renderer.resize(width, height);
      const context = renderer.getContext();
      context.setFont('Inter, sans-serif', 10);

      const stave = new Stave(8, 20, width - 16);
      stave.addClef(clef).setContext(context).draw();

      const staveNotes = items.map((item, i) => {
        const midis = Array.isArray(item) ? [...item].sort((a, b) => a - b) : [item];
        const parts = midis.map(midiToVexKeyParts);
        const note = new StaveNote({
          keys: parts.map((p) => p.key),
          duration: 'q',
          clef,
        });
        parts.forEach((p, idx) => {
          if (p.accidental) note.addModifier(new Accidental('#'), idx);
        });
        const finger = fingers?.[i];
        if (finger) {
          note.addModifier(
            new Annotation(String(finger))
              .setVerticalJustification(Annotation.VerticalJustify.TOP)
              .setFont('Inter, sans-serif', 11, 'bold'),
            0,
          );
        }
        if (highlightIndex === i) {
          note.setStyle({ fillStyle: '#4f46e5', strokeStyle: '#4f46e5' });
        }
        return note;
      });

      const voice = new Voice({ numBeats: items.length, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables(staveNotes);
      new Formatter().joinVoices([voice]).format([voice], width - 90);
      voice.draw(context, stave);

      // Make the generated SVG responsive.
      const svg = el.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', '100%');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.maxWidth = `${width}px`;
      }
    } catch (err) {
      console.error('VexFlow render error', err);
    }
  }, [items, fingers, clef, highlightIndex]);

  return <div ref={containerRef} className={className} aria-label="music staff" />;
}
