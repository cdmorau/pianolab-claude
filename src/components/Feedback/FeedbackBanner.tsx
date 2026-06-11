import { useTranslation } from 'react-i18next';

export type FeedbackStatus = 'correct' | 'wrong' | 'almost' | null;

const STYLES: Record<Exclude<FeedbackStatus, null>, { bg: string; icon: string; key: string }> = {
  correct: { bg: 'bg-correct/15 text-correct', icon: '✓', key: 'common.correct' },
  wrong: { bg: 'bg-wrong/15 text-wrong', icon: '✕', key: 'common.incorrect' },
  almost: { bg: 'bg-almost/15 text-almost', icon: '≈', key: 'common.almost' },
};

export function FeedbackBanner({ status, message }: { status: FeedbackStatus; message?: string }) {
  const { t } = useTranslation();
  if (!status) {
    return <div className="h-9" aria-hidden />;
  }
  const style = STYLES[status];
  return (
    <div
      key={`${status}-${message ?? ''}`}
      className={`chip animate-pop-in h-9 px-4 text-sm font-semibold ${style.bg}`}
      role="status"
      aria-live="polite"
    >
      <span className="text-base">{style.icon}</span>
      {message ?? t(style.key)}
    </div>
  );
}
