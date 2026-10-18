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
  const unixTimestamp = (jdn - 2440588) * 86400000;
  
  return new Date(unixTimestamp);
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
    timeZone: 'UTC' // Crucial to prevent timezone shift from moving the date backward
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