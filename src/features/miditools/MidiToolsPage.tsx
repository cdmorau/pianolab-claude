import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { transcribeAudio } from './audioTranscriber';
import { detectSynthesia } from './synthesiaDetector';

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = 'audio' | 'synthesia';
type Status = 'idle' | 'processing' | 'done' | 'error';

// ── Sub-components ────────────────────────────────────────────────────────────

function DownloadBtn({ bytes, fileName }: { bytes: Uint8Array; fileName: string }) {
  const { t } = useTranslation();
  function go() {
    const blob = new Blob([bytes], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button onClick={go} className="btn-primary w-full py-3 text-base font-bold">
      ⬇ {t('miditools.download')} {fileName}
    </button>
  );
}

interface DropZoneProps {
  accept: string;
  label: string;
  hint: string;
  onFile: (f: File) => void;
  disabled: boolean;
}

function DropZone({ accept, label, hint, onFile, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined) {
    if (f && !disabled) onFile(f);
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && ref.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        pick(e.dataTransfer.files[0]);
      }}
      className={`rounded-xl border-2 border-dashed p-12 text-center transition-all select-none
        ${dragging ? 'border-brand-400 bg-brand-500/10' : 'border-slate-700 hover:border-slate-500'}
        ${disabled ? 'pointer-events-none opacity-40' : 'cursor-pointer'}`}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
        disabled={disabled}
      />
      <div className="text-5xl mb-4">{dragging ? '📂' : '🎵'}</div>
      <p className="font-semibold text-slate-200 text-lg">{label}</p>
      <p className="text-sm text-slate-500 mt-1.5">{hint}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function MidiToolsPage() {
  const { t } = useTranslation();

  const [tab, setTab] = useState<Tab>('audio');
  const [status, setStatus] = useState<Status>('idle');
  const [progressLabel, setProgressLabel] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [result, setResult] = useState<{
    midi: Uint8Array;
    noteCount: number;
    fileName: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const onProgress = useCallback((label: string, pct: number) => {
    setProgressLabel(label);
    setProgressPct(pct);
  }, []);

  async function handleFile(file: File) {
    setStatus('processing');
    setResult(null);
    setErrorMsg('');
    setProgressPct(0);
    setProgressLabel('Iniciando…');
    try {
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const res =
        tab === 'audio'
          ? await transcribeAudio(file, onProgress)
          : await detectSynthesia(file, onProgress);
      setResult({ ...res, fileName: `${baseName}.mid` });
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  }

  function switchTab(next: Tab) {
    if (status === 'processing') return;
    setTab(next);
    setStatus('idle');
    setResult(null);
  }

  const busy = status === 'processing';

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-2xl mx-auto">
      {/* Hero */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold">🎵 {t('miditools.title')}</h1>
        <p className="text-slate-400">{t('miditools.subtitle')}</p>
      </header>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
        {(['audio', 'synthesia'] as const).map((k) => (
          <button
            key={k}
            onClick={() => switchTab(k)}
            disabled={busy}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === k
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 disabled:cursor-not-allowed'
            }`}
          >
            {k === 'audio'
              ? `🎼 ${t('miditools.tabAudio')}`
              : `🎮 ${t('miditools.tabSynthesia')}`}
          </button>
        ))}
      </div>

      {/* Drop zone + hints */}
      {tab === 'audio' ? (
        <div className="flex flex-col gap-4">
          <DropZone
            accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg,.aac"
            label={t('miditools.dropAudio')}
            hint="MP3 · WAV · FLAC · M4A · OGG · AAC"
            onFile={handleFile}
            disabled={busy}
          />
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">💡 {t('miditools.ytTip')}</strong>{' '}
            {t('miditools.ytTipBody')}
            <code className="mt-2 block rounded bg-slate-800 px-2 py-1.5 font-mono text-slate-300">
              {`yt-dlp -x --audio-format mp3 "YOUTUBE_URL" -o audio.mp3`}
            </code>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <DropZone
            accept="video/*,.mp4,.mov,.mkv,.webm,.avi"
            label={t('miditools.dropVideo')}
            hint="MP4 · MOV · MKV · WebM"
            onFile={handleFile}
            disabled={busy}
          />
          <div className="rounded-lg border border-amber-800/40 bg-amber-900/10 p-4 text-xs text-slate-400 leading-relaxed">
            <strong className="text-amber-400">⚠ {t('miditools.synthesiaNote')}</strong>{' '}
            {t('miditools.synthesiaBody')}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {status === 'processing' && (
        <div className="card flex flex-col gap-3">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-3 rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-center text-sm text-slate-300">{progressLabel}</p>
          <p className="text-center text-xs text-slate-600">{t('miditools.processingNote')}</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="font-bold text-red-400">{t('miditools.error')}</p>
          <p className="mt-1 break-all text-sm text-slate-400">{errorMsg}</p>
          <button
            onClick={() => setStatus('idle')}
            className="btn-ghost mt-3 px-3 py-1 text-xs"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Success */}
      {status === 'done' && result && (
        <div className="card flex flex-col gap-4 border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-3">
            <span className="text-4xl">✅</span>
            <div>
              <p className="text-lg font-bold text-green-400">{t('miditools.done')}</p>
              <p className="text-sm text-slate-400">
                {result.noteCount} {t('miditools.notesDetected')}
              </p>
            </div>
          </div>
          <DownloadBtn bytes={result.midi} fileName={result.fileName} />
          <button
            onClick={() => { setStatus('idle'); setResult(null); }}
            className="btn-ghost text-sm"
          >
            {t('miditools.processAnother')}
          </button>
        </div>
      )}

      {/* Legal */}
      <div className="rounded-lg border border-slate-800 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">{t('miditools.disclaimerTitle')}: </strong>
        {t('miditools.disclaimerBody')}
      </div>
    </div>
  );
}
