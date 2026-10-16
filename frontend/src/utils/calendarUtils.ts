// ─── Ethiopian ↔ Gregorian Calendar Utilities ─────────────

export const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሀሴ', 'ጳጉሜ'
];

export const ETHIOPIAN_DAYS = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];

export interface EthiopianDateParts {
  year: number;
  month: number;
  day: number;
}

// ─── Leap Year Check ────────────────────────────────────
const isGregorianLeap = (y: number) =>
  (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

// ─── Parse Ethiopian DD/MM/YYYY ──────────────────────────
export function parseEthiopianDate(dateStr: string): EthiopianDateParts | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return { year, month, day };
}

// ─── Convert Ethiopian → Gregorian Date ──────────────────
export function ethiopianToGregorianDate(ethDateStr: string): Date | null {
  const parsed = parseEthiopianDate(ethDateStr);
  if (!parsed) return null;
  const { year, month, day } = parsed;

  const gregYear = year + 7;
  const newYearDay = isGregorianLeap(gregYear) ? 11 : 12;
  const newYear = new Date(gregYear, 8, newYearDay); // September 11 or 12

  const totalDays = (month - 1) * 30 + (day - 1);
  const result = new Date(newYear);
  result.setDate(result.getDate() + totalDays);
  return result;
}

// ─── Format Ethiopian: "ጥቅምት 6 ቀን 2019 ዓ.ም." ─────────────
export function formatEthiopianDisplay(dateStr: string): string {
  const parsed = parseEthiopianDate(dateStr);
  if (!parsed) return dateStr;
  const monthName = ETHIOPIAN_MONTHS[parsed.month - 1] || 'ጳጉሜ';
  return `${monthName} ${parsed.day} ቀን ${parsed.year} ዓ.ም.`;
}

// ─── Format Gregorian: "Sat, Sep 6, 2026" ─────────────────
export function formatGregorianDisplay(dateStr: string): string {
  const greg = ethiopianToGregorianDate(dateStr);
  if (!greg) return dateStr;
  return greg.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Short both: { ethiopian, gregorian } ────────────────
export function formatBothShort(dateStr: string): {
  ethiopian: string;
  gregorian: string;
} {
  const parsed = parseEthiopianDate(dateStr);
  const greg = ethiopianToGregorianDate(dateStr);
  const ethiopian = parsed
    ? `${ETHIOPIAN_MONTHS[parsed.month - 1]} ${parsed.day}, ${parsed.year}`
    : dateStr;
  const gregorian = greg
    ? greg.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : dateStr;
  return { ethiopian, gregorian };
}

// ─── Get today's Ethiopian date ──────────────────────────
export function getTodayEthiopian(): EthiopianDateParts {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const newYearDay = isGregorianLeap(y) ? 11 : 12;
  const newYearDate = new Date(y, 8, newYearDay);
  let ethYear: number | undefined;
  let ethMonth: number | undefined;
  let ethDay: number | undefined;
  const targetDate = new Date(y, m, d);

  if (targetDate >= newYearDate) {
    // ✅ FIXED: After Ethiopian New Year → Gregorian year - 7
    ethYear = y - 7;
    const diffDays = Math.floor(
      (targetDate.getTime() - newYearDate.getTime()) / 86400000
    );
    let rem = diffDays;
    for (let mm = 1; mm <= 13; mm++) {
      const daysInMonth = mm === 13 ? (isGregorianLeap(y) ? 6 : 5) : 30;
      if (rem < daysInMonth) {
        ethMonth = mm;
        ethDay = rem + 1;
        break;
      }
      rem -= daysInMonth;
    }
  } else {
    // ✅ FIXED: Before Ethiopian New Year → Gregorian year - 8
    ethYear = y - 8;
    const prevNewYear = new Date(y - 1, 8, newYearDay);
    const diffDays = Math.floor(
      (targetDate.getTime() - prevNewYear.getTime()) / 86400000
    );
    let rem = diffDays;
    for (let mm = 1; mm <= 13; mm++) {
      const daysInMonth = mm === 13 ? (isGregorianLeap(y - 1) ? 6 : 5) : 30;
      if (rem < daysInMonth) {
        ethMonth = mm;
        ethDay = rem + 1;
        break;
      }
      rem -= daysInMonth;
    }
  }

  if (!ethMonth || !ethDay || !ethYear) {
    ethYear = 2019;
    ethMonth = 1;
    ethDay = 1;
  }
  return { year: ethYear, month: ethMonth, day: ethDay };
}

// ─── Compare two Ethiopian dates ─────────────────────────
export function compareEthiopianDates(a: string, b: string): number {
  const da = parseEthiopianDate(a);
  const db = parseEthiopianDate(b);
  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;
  if (da.year !== db.year) return da.year - db.year;
  if (da.month !== db.month) return da.month - db.month;
  return da.day - db.day;
}

// ─── Check if date is today or in the future ─────────────
export function isTodayOrFuture(dateStr: string): boolean {
  const parsed = parseEthiopianDate(dateStr);
  if (!parsed) return false;
  const today = getTodayEthiopian();
  if (parsed.year > today.year) return true;
  if (parsed.year < today.year) return false;
  if (parsed.month > today.month) return true;
  if (parsed.month < today.month) return false;
  return parsed.day >= today.day;
}

// ─── Check if the date has passed ────────────────────────
export function isPast(dateStr: string): boolean {
  const parsed = parseEthiopianDate(dateStr);
  if (!parsed) return false;
  const today = getTodayEthiopian();
  if (parsed.year < today.year) return true;
  if (parsed.year > today.year) return false;
  if (parsed.month < today.month) return true;
  if (parsed.month > today.month) return false;
  return parsed.day < today.day;
}

// ─── Week Range from shows ───────────────────────────────
export function getWeekRangeFromShows(dates: string[]): string | null {
  const upcoming = dates.filter((d) => isTodayOrFuture(d));
  if (upcoming.length === 0) return null;

  const sorted = [...upcoming].sort(compareEthiopianDates);
  const earliest = sorted[0];
  const latest = sorted[sorted.length - 1];

  if (earliest === latest) return formatEthiopianDisplay(earliest);
  return `${formatEthiopianDisplay(earliest)} - ${formatEthiopianDisplay(latest)}`;
}

// ─── Get 7 days starting from a given date (Friday) ─────
export function getWeekFromFriday(
  startDateStr: string
): { date: string; dayName: string; dayIndex: number }[] {
  const parsed = parseEthiopianDate(startDateStr);
  if (!parsed) return [];

  const result: { date: string; dayName: string; dayIndex: number }[] = [];
  let { year, month, day } = parsed;

  for (let i = 0; i < 7; i++) {
    const gregDate = ethiopianToGregorianDate(
      `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
    );
    if (!gregDate) break;

    const dow = gregDate.getDay(); // 0 = Sunday
    result.push({
      date: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
      dayName: ETHIOPIAN_DAYS[dow],
      dayIndex: dow,
    });

    // Advance one Ethiopian day
    const isLeap = isGregorianLeap(year + 7);
    const daysInMonth = month === 13 ? (isLeap ? 6 : 5) : 30;
    day += 1;
    if (day > daysInMonth) {
      day = 1;
      month += 1;
      if (month > 13) {
        month = 1;
        year += 1;
      }
    }
  }

  return result;
}