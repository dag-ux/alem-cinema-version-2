// ─── Ethiopian ↔ Gregorian Calendar Utilities (Backend) ─────────

export const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሀሴ', 'ጳጉሜ'
];

/**
 * Convert Ethiopian date string "DD/MM/YYYY" → Gregorian Date object
 */
export function ethiopianToGregorianDate(ethDateStr: string): Date | null {
  if (!ethDateStr) return null;
  const parts = ethDateStr.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  // Calculate Julian Day Number (JDN) for the Ethiopian date
  // This formula is perfectly accurate and handles leap years automatically
  const jdn = 1723856 + 365 * year + Math.floor(year / 4) + 30 * month + day - 31;

  // Convert JDN to Gregorian date
  // Unix epoch (Jan 1, 1970) has JDN 2440588
  const unixTimestamp = (jdn - 2440588) * 86400000;
  const gregDate = new Date(unixTimestamp);

  return gregDate;
}

/**
 * Check if an Ethiopian date is today or in the future
 */
export function isEthiopianDateTodayOrFuture(ethDateStr: string): boolean {
  const gregDate = ethiopianToGregorianDate(ethDateStr);
  if (!gregDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compare only date part
  const showDateStart = new Date(gregDate);
  showDateStart.setHours(0, 0, 0, 0);

  return showDateStart >= today;
}

/**
 * Check if Ethiopian date has passed
 */
export function hasEthiopianDatePassed(ethDateStr: string): boolean {
  return !isEthiopianDateTodayOrFuture(ethDateStr);
}

/**
 * Parse Ethiopian date string "DD/MM/YYYY" into day, month, and year
 */
export function parseEthiopianDate(dateStr: string): { day: number; month: number; year: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  return { day, month, year };
}