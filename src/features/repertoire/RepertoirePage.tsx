import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SONGS, getSong } from '@/data/songs';
import { songFromMidiFile } from '@/audio/midiImport';
import { useImportedSongs } from '@/state/importedSongsStore';
import { useSettings } from '@/state/settingsStore';
import { useUi } from '@/state/uiStore';
import type { Song } from '@/types/song';
import { SongPlayer } from './SongPlayer';

function SongCard({ song, onOpen }: { song: Song; onOpen: () => void }) {
  const { t } = useTranslation();
  const badge =
    song.license === 'public-domain'
      ? { text: t('repertoire.publicDomain'), cls: 'bg-correct/15 text-correct' }
      : song.license === 'personal-use'
        ? { text: t('repertoire.personalUse'), cls: 'bg-almost/15 text-almost' }
        : { text: t('repertoire.imported'), cls: 'bg-brand-500/15 text-brand-300' };
  return (
    <button
      onClick={onOpen}
      className="card flex flex-col items-start gap-2 text-left transition-transform hover:-translate-y-1"
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-sm font-semibold text-brand-400">
          {'●'.repeat(song.difficulty)}
          <span className="text-slate-300 dark:text-slate-700">{'●'.repeat(5 - song.difficulty)}</span>
        </span>
        <span className={`chip ${badge.cls}`}>{badge.text}</span>
      </div>
      <h2 className="text-lg font-bold leading-tight">{song.title}</h2>
      <p className="text-sm text-slate-500">{song.composer}</p>
      <span className="mt-2 text-xs font-semibold text-brand-400">{t('repertoire.practice')} →</span>
    </button>
  );
}

function MidiImporter() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const add = useImportedSongs((s) => s.add);
  const { openDetail } = useUi();
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const song = await songFromMidiFile(file);
      add(song);
      openDetail(song.id);
    } catch {
      setError('⚠');
    }
  };

  return (
    <div className="card flex flex-col gap-2 border-dashed">
      <h3 className="font-bold">📂 {t('repertoire.importTitle')}</h3>
      <p className="text-sm text-slate-500">{t('repertoire.importDesc')}</p>
      <input
        ref={inputRef}
        type="file"
        accept=".mid,.midi,audio/midi"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
      <button className="btn-ghost w-fit" onClick={() => inputRef.current?.click()}>
        {t('repertoire.importButton')}
      </button>
      {error && <p className="text-sm text-wrong">{error}</p>}
    </div>
  );
}

export function RepertoirePage() {
  const { t } = useTranslation();
  const importedSongs = useImportedSongs((s) => s.songs);
  const { detailId, openDetail, closeDetail } = useUi();
  // settings subscription keeps the page reactive to language changes via children
  useSettings((s) => s.language);

  const song = detailId ? (getSong(detailId) ?? importedSongs.find((x) => x.id === detailId)) : undefined;
  if (song) return <SongPlayer song={song} onExit={closeDetail} />;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl font-extrabold">{t('repertoire.title')}</h1>
        <p className="text-slate-500">{t('repertoire.subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SONGS.map((s) => (
          <SongCard key={s.id} song={s} onOpen={() => openDetail(s.id)} />
        ))}
      </div>

      <MidiImporter />

      {importedSongs.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">{t('repertoire.imported')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {importedSongs.map((s) => (
              <SongCard key={s.id} song={s} onOpen={() => openDetail(s.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
