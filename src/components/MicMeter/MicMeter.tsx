import { useTranslation } from 'react-i18next';
import { useMic } from './useMic';
import { useSettings } from '@/state/settingsStore';
import { midiToNoteName } from '@/audio/notes';

export function MicMeter({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const { status, reading, enable, disable } = useMic();

  if (status === 'unsupported') {
    return <p className="text-sm text-wrong">{t('mic.notSupported')}</p>;
  }

  if (status === 'idle' || status === 'denied' || status === 'requesting') {
    return (
      <div className="flex flex-col items-start gap-2">
        <button className="btn-primary" onClick={() => void enable()} disabled={status === 'requesting'}>
          🎤 {status === 'requesting' ? t('mic.enabling') : t('mic.enable')}
        </button>
        {status === 'denied' && <p className="text-sm text-wrong">{t('mic.permissionDenied')}</p>}
      </div>
    );
  }

  // status === 'listening'
  const cents = reading?.cents ?? 0;
  const clarityPct = Math.round((reading?.clarity ?? 0) * 100);
  const tuneOffset = Math.max(-50, Math.min(50, cents));

  return (
    <div className={`flex flex-col gap-3 ${compact ? '' : 'card'}`}>
      <div className="flex items-center justify-between">
        <span className="chip bg-correct/15 text-correct">
          <span className="h-2 w-2 animate-pulse rounded-full bg-correct" />
          {t('mic.listening')}
        </span>
        <button className="text-xs text-slate-500 hover:text-slate-300" onClick={disable}>
          {t('common.stop')}
        </button>
      </div>

      <div className="flex items-end gap-4">
        <div className="min-w-[72px]">
          <div className="text-xs uppercase tracking-wide text-slate-500">{t('mic.detected')}</div>
          <div className="text-3xl font-extrabold tabular-nums text-brand-300">
            {reading ? midiToNoteName(reading.midi, { language }) : t('mic.silence')}
          </div>
        </div>

        <div className="flex-1">
          {/* Tuning needle: -50..+50 cents */}
          <div className="relative h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="absolute left-1/2 top-0 h-3 w-0.5 -translate-x-1/2 bg-slate-400" />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow transition-all"
              style={{
                left: `calc(${50 + tuneOffset}% - 8px)`,
                background: Math.abs(cents) <= 8 ? 'var(--tw-correct, #22c55e)' : '#f59e0b',
                backgroundColor: Math.abs(cents) <= 8 ? '#22c55e' : '#f59e0b',
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-500">
            <span>♭ -50</span>
            <span>{reading ? `${cents > 0 ? '+' : ''}${cents}¢` : ''}</span>
            <span>+50 ♯</span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{t('mic.clarity')}</span>
          <span className="tabular-nums">{clarityPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${clarityPct}%` }} />
        </div>
      </div>
    </div>
  );
}
