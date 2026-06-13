import { useTranslation } from 'react-i18next';
import { useSettings } from '@/state/settingsStore';
import { useMidiConnection } from '@/audio/useMidi';
import { PIANO_SIZES } from '@/data/pianoSizes';

/** Toolbar to pick keyboard size, toggle overlays, and show MIDI connection status. */
export function PianoControls({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const pianoKeys = useSettings((s) => s.pianoKeys);
  const setPianoKeys = useSettings((s) => s.setPianoKeys);
  const showNoteNames = useSettings((s) => s.showNoteNames);
  const setShowNoteNames = useSettings((s) => s.setShowNoteNames);
  const showFingers = useSettings((s) => s.showFingers);
  const setShowFingers = useSettings((s) => s.setShowFingers);
  const { connected, deviceName, isSupported, connect } = useMidiConnection();

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex items-center gap-2">
        🎹 {t('piano.size')}
        <select
          className="rounded-lg border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-700"
          value={pianoKeys}
          onChange={(e) => setPianoKeys(Number(e.target.value))}
        >
          {PIANO_SIZES.map((s) => (
            <option key={s.keys} value={s.keys} className="text-black">
              {s.keys} {t('piano.keys')} · {s.range}
              {s.keys === 88 ? ` (${t('piano.full')})` : ''}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5">
        <input type="checkbox" checked={showNoteNames} onChange={(e) => setShowNoteNames(e.target.checked)} />
        {t('piano.showNames')}
      </label>

      {!compact && (
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={showFingers} onChange={(e) => setShowFingers(e.target.checked)} />
          {t('piano.showFingers')}
        </label>
      )}

      {/* MIDI status */}
      {isSupported && (
        connected ? (
          <span className="chip bg-correct/15 text-correct text-xs">
            🎛 {deviceName ?? t('piano.midiConnected')}
          </span>
        ) : (
          <button
            className="chip cursor-pointer bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 text-xs"
            onClick={connect}
            title={t('piano.midiConnect')}
          >
            🎛 {t('piano.midiConnect')}
          </button>
        )
      )}
    </div>
  );
}
