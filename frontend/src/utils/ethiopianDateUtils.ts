// ─── Ethiopian Calendar Utilities (DD/MM/YYYY) ────────────────

export const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሀሴ', 'ጳጉሜ'
];

// ─── Format: DD/MM/YYYY ──────────────────────────────────────
export function ethiopianToDDMMYYYY(year: number, month: number, day: number): string {
  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');
  return `${dayStr}/${monthStr}/${year}`;
}

// ─── Parse DD/MM/YYYY ──────────────────────────────────────
export function parseDDMMYYYY(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (month < 1 || month > 13) return null;
  if (day < 1 || day > 30) return null;
  return { year, month, day };
}

// ─── Format for display ──────────────────────────────────────
export function formatEthiopianDateDisplay(dateStr: string): string {
  const parsed = parseDDMMYYYY(dateStr);
  if (!parsed) return dateStr;
  const { year, month, day } = parsed;
  const monthName = ETHIOPIAN_MONTHS[month - 1];
  return `${monthName} ${day} ቀን ${year} ዓ.ም.`;
}

// ─── Get current Ethiopian date as DD/MM/YYYY ────────────────
export function getCurrentEthiopianDDMMYYYY(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-11
  const day = now.getUTCDate();
  
  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  const newYearDay = isLeap(year) ? 11 : 12;
  const newYearDate = new Date(Date.UTC(year, 8, newYearDay));
  
  let ethYear = year - 7;
  let ethMonth = 1;
  let ethDay = 1;
  
  const targetDate = new Date(Date.UTC(year, month, day));
  
  if (targetDate >= newYearDate) {
    ethYear = year - 7;
    const diffDays = Math.floor((targetDate.getTime() - newYearDate.getTime()) / (24 * 60 * 60 * 1000));
    let remaining = diffDays;
    for (let m = 1; m <= 13; m++) {
      const daysInMonth = (m === 13) ? 5 : 30;
      if (remaining < daysInMonth) {
        ethMonth = m;
        ethDay = remaining + 1;
        break;
      }
      remaining -= daysInMonth;
    }
  } else {
    ethYear = year - 8;
    const prevNewYear = new Date(Date.UTC(year - 1, 8, newYearDay));
    const diffDays = Math.floor((targetDate.getTime() - prevNewYear.getTime()) / (24 * 60 * 60 * 1000));
    let remaining = diffDays;
    for (let m = 1; m <= 13; m++) {
      const daysInMonth = (m === 13) ? 5 : 30;
      if (remaining < daysInMonth) {
        ethMonth = m;
        ethDay = remaining + 1;
        break;
      }
      remaining -= daysInMonth;
    }
  }
  
  return ethiopianToDDMMYYYY(ethYear, ethMonth, ethDay);
}

// ─── Year range and days in month ────────────────────────────
export function getYearRange(centerYear: number, range: number = 10): number[] {
  return Array.from({ length: range * 2 + 1 }, (_, i) => centerYear - range + i);
}

export function getEthiopianDaysInMonth(month: number): number {
  return month === 13 ? 5 : 30;
}