import { useTranslation } from 'react-i18next';
import { useSettings } from '@/state/settingsStore';
import { PIANO_SIZES } from '@/data/pianoSizes';

/** Toolbar to pick keyboard size and toggle note-name / finger overlays. */
export function PianoControls({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const pianoKeys = useSettings((s) => s.pianoKeys);
  const setPianoKeys = useSettings((s) => s.setPianoKeys);
  const showNoteNames = useSettings((s) => s.showNoteNames);
  const setShowNoteNames = useSettings((s) => s.setShowNoteNames);
  const showFingers = useSettings((s) => s.showFingers);
  const setShowFingers = useSettings((s) => s.setShowFingers);

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
    </div>
  );
}
