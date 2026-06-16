import { parseSmf, ticksToBeats } from './smfParser';
import type { NoteEvent, Song } from '@/types/song';

/**
 * Parse a local MIDI file into a Song using our dependency-free SMF parser.
 * Runs entirely in the browser — the file is read via the File API and never
 * uploaded anywhere.
 */
export async function songFromMidiFile(file: File): Promise<Song> {
  const buffer = await file.arrayBuffer();
  const midi = parseSmf(buffer);
  const ppq = midi.ticksPerQuarter || 480;

  const notes: NoteEvent[] = midi.notes.map((n) => ({
    midi: n.midi,
    startBeat: ticksToBeats(n.startTick, midi.tempoMap, ppq, midi.bpm),
    durationBeats: Math.max(
      0.1,
      ticksToBeats(n.startTick + n.durationTicks, midi.tempoMap, ppq, midi.bpm) -
        ticksToBeats(n.startTick, midi.tempoMap, ppq, midi.bpm),
    ),
    // Heuristic: notes below middle C go to the left hand.
    hand: n.midi < 60 ? 'L' : 'R',
    velocity: n.velocity,
  }));

  const title = file.name.replace(/\.midi?$/i, '') || 'MIDI';

  return {
    id: `imported-${Date.now()}`,
    title,
    composer: '—',
    license: 'user-imported',
    difficulty: 3,
    bpm: midi.bpm,
    beatsPerMeasure: midi.beatsPerMeasure,
    key: '—',
    notes,
  };
}
