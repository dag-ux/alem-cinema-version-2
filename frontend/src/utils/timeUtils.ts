// ─── Ethiopian Time Utilities ──────────────────────────────────────

export type EthiopianPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface EthiopianTime {
  hour: number;
  minute: number;
  period: EthiopianPeriod;
  display: string;
  displayFull: string;
}

/**
 * Get period label in Amharic only
 */
export function getPeriodAmharic(period: EthiopianPeriod): string {
  const labels: Record<EthiopianPeriod, string> = {
    morning: 'ጠዋት',
    afternoon: 'ከሰዓት',
    evening: 'ማታ',
    night: 'ሌሊት',
  };
  return labels[period];
}

/**
 * Get period label with English (for dropdowns)
 */
export function getPeriodLabel(period: EthiopianPeriod): string {
  const labels: Record<EthiopianPeriod, string> = {
    morning: 'ጠዋት (Morning)',
    afternoon: 'ከሰዓት (Afternoon)',
    evening: 'ማታ (Evening)',
    night: 'ሌሊት (Night)',
  };
  return labels[period];
}

/**
 * Period options for dropdown
 */
export const PERIOD_OPTIONS: { value: EthiopianPeriod; label: string; amharic: string }[] = [
  { value: 'morning', label: 'ጠዋት (Morning)', amharic: 'ጠዋት' },
  { value: 'afternoon', label: 'ከሰዓት (Afternoon)', amharic: 'ከሰዓት' },
  { value: 'evening', label: 'ማታ (Evening)', amharic: 'ማታ' },
  { value: 'night', label: 'ሌሊት (Night)', amharic: 'ሌሊት' },
];