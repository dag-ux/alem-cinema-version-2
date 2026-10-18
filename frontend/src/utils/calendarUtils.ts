export const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሀሴ', 'ጳጉሜ'
];

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

export function ethiopianToGregorianDate(ethDateStr: string): Date | null {
  if (!ethDateStr) return null;
  const parts = ethDateStr.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  // Exact Julian Day Number (JDN) formula
  const jdn = 1723856 + 365 * year + Math.floor(year / 4) + 30 * month + day - 31;
  
  // 2440587.5 is the Unix epoch (Jan 1, 1970 00:00 UTC)
  const unixTimestamp = (jdn - 2440587.5) * 86400000;

  return new Date(unixTimestamp);
}

export function gregorianToEthiopianDate(date: Date): string {
  const jdn = Math.floor(date.getTime() / 86400000) + 2440588;
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
}

export function formatEthiopianDisplay(ethDateStr: string): string {
  const parsed = parseEthiopianDate(ethDateStr);
  if (!parsed) return ethDateStr;
  return `${ETHIOPIAN_MONTHS[parsed.month - 1]} ${parsed.day} ቀን ${parsed.year} ዓ.ም.`;
}

export function formatGregorianDisplay(ethDateStr: string): string {
  const gregDate = ethiopianToGregorianDate(ethDateStr);
  if (!gregDate) return "";
  
  return gregDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function compareEthiopianDates(a: string, b: string): number {
  const pA = parseEthiopianDate(a);
  const pB = parseEthiopianDate(b);
  if (!pA || !pB) return 0;

  if (pA.year !== pB.year) return pA.year - pB.year;
  if (pA.month !== pB.month) return pA.month - pB.month;
  return pA.day - pB.day;
}

export function getTodayEthiopian(): { day: number; month: number; year: number } {
  const today = new Date();
  const jdn = Math.floor(today.getTime() / 86400000) + 2440588;
  
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;

  return { day, month, year };
}

export function isTodayOrFuture(ethDateStr: string): boolean {
  const p = parseEthiopianDate(ethDateStr);
  if (!p) return false;
  const today = getTodayEthiopian();
  
  if (p.year > today.year) return true;
  if (p.year < today.year) return false;
  
  if (p.month > today.month) return true;
  if (p.month < today.month) return false;
  
  return p.day >= today.day;
}

// ✅ FIXED: Now returns an array of objects and accepts an optional start date
export function getWeekFromFriday(startDateStr?: string): { dayIndex: number; dayName: string; date: string }[] {
  let baseDate = new Date();
  
  if (startDateStr) {
    if (startDateStr.includes('/')) {
      const gDate = ethiopianToGregorianDate(startDateStr);
      if (gDate) baseDate = gDate;
    } else {
      baseDate = new Date(startDateStr);
    }
  }

  // Find the most recent Friday
  const dayOfWeek = baseDate.getDay(); // 0=Sun, 5=Fri, 6=Sat
  const diff = (dayOfWeek + 2) % 7; // 0 -> 2 (go back to Fri), 5 -> 0, 6 -> 1
  const friday = new Date(baseDate);
  friday.setDate(baseDate.getDate() - diff);

  const weekDays = [];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(friday);
    d.setDate(friday.getDate() + i);
    weekDays.push({
      dayIndex: d.getDay(),
      dayName: dayNames[d.getDay()],
      date: gregorianToEthiopianDate(d)
    });
  }
  return weekDays;
}

export function getWeekRangeFromShows(dates: string[]): string {
  if (!dates || dates.length === 0) return "";
  
  const validDates = dates.map(d => parseEthiopianDate(d)).filter(d => d !== null) as { day: number; month: number; year: number }[];
  if (validDates.length === 0) return "";

  validDates.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });

  const first = validDates[0];
  const last = validDates[validDates.length - 1];

  return `${ETHIOPIAN_MONTHS[first.month - 1]} ${first.day} ቀን ${first.year} ዓ.ም. - ${ETHIOPIAN_MONTHS[last.month - 1]} ${last.day} ቀን ${last.year} ዓ.ም.`;
}