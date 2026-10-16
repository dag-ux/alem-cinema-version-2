import React, { useMemo } from 'react';
import { FaClock } from 'react-icons/fa';

interface Show {
  _id: string;
  itemType: 'MOVIE' | 'THEATER';
  movieId?: { title: string; poster?: string };
  theaterPerformanceId?: { title: string; poster?: string };
  hallId?: { hallNumber: string };
  date: string; // DD/MM/YYYY (Ethiopian)
  startTime: string;
  endTime: string;
  price: number;
}

interface ScheduleGridProps {
  shows: Show[];
  days?: number;
}

const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሀሴ', 'ጳጉሜ'
];

const AMHARIC_DAYS = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];

// ─── Get today's Ethiopian date (local time) ───────────────
function getTodayEthiopian() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const isLeap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const newYearDay = isLeap(y) ? 11 : 12;
  const newYear = new Date(y, 8, newYearDay);

  let ethYear, ethMonth, ethDay;
  const target = new Date(y, m, d);

  if (target >= newYear) {
    ethYear = y - 8;
    const diff = Math.floor((target.getTime() - newYear.getTime()) / 86400000);
    let rem = diff;
    for (let i = 1; i <= 13; i++) {
      const days = (i === 13) ? (isLeap(y) ? 6 : 5) : 30;
      if (rem < days) {
        ethMonth = i;
        ethDay = rem + 1;
        break;
      }
      rem -= days;
    }
  } else {
    ethYear = y - 9;
    const prevNewYear = new Date(y - 1, 8, newYearDay);
    const diff = Math.floor((target.getTime() - prevNewYear.getTime()) / 86400000);
    let rem = diff;
    for (let i = 1; i <= 13; i++) {
      const days = (i === 13) ? (isLeap(y - 1) ? 6 : 5) : 30;
      if (rem < days) {
        ethMonth = i;
        ethDay = rem + 1;
        break;
      }
      rem -= days;
    }
  }

  if (!ethMonth || !ethDay || !ethYear) {
    ethYear = 2017; ethMonth = 13; ethDay = 1;
  }

  return { year: ethYear, month: ethMonth, day: ethDay, dayName: AMHARIC_DAYS[target.getDay()] };
}

function addEthiopianDay(year: number, month: number, day: number) {
  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  const daysInMonth = (m: number, y: number) => {
    if (m === 13) return isLeap(y + 7) ? 6 : 5;
    return 30;
  };
  let d = day + 1;
  let m = month;
  let y = year;
  if (d > daysInMonth(m, y)) {
    d = 1;
    m++;
    if (m > 13) { m = 1; y++; }
  }
  return { year: y, month: m, day: d };
}

function ethiopianToString(year: number, month: number, day: number) {
  return `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`;
}

// ─── Main Component ──────────────────────────────────────────
const ScheduleGrid: React.FC<ScheduleGridProps> = ({ shows, days = 7 }) => {
  const today = getTodayEthiopian();
  const todayStr = ethiopianToString(today.year, today.month, today.day);

  const dateRange = useMemo(() => {
    const dates = [];
    let cur = { year: today.year, month: today.month, day: today.day };
    for (let i = 0; i < days; i++) {
      const dayName = AMHARIC_DAYS[(AMHARIC_DAYS.indexOf(today.dayName) + i) % 7];
      dates.push({
        year: cur.year,
        month: cur.month,
        day: cur.day,
        dateStr: ethiopianToString(cur.year, cur.month, cur.day),
        dayName,
      });
      if (i < days - 1) cur = addEthiopianDay(cur.year, cur.month, cur.day);
    }
    return dates;
  }, [days, today]);

  // Group shows by date string
  const showsByDate = useMemo(() => {
    const groups: { [key: string]: Show[] } = {};
    shows.forEach(s => {
      if (!groups[s.date]) groups[s.date] = [];
      groups[s.date].push(s);
    });
    return groups;
  }, [shows]);

  // Helper: is date before today?
  function isBeforeToday(ds: string) {
    const parts = ds.split('/');
    if (parts.length !== 3) return false;
    const d = parseInt(parts[0]), m = parseInt(parts[1]), y = parseInt(parts[2]);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
    if (y < today.year) return true;
    if (y > today.year) return false;
    if (m < today.month) return true;
    if (m > today.month) return false;
    return d < today.day;
  }

  const gridData = dateRange.map(d => ({
    ...d,
    isPast: isBeforeToday(d.dateStr),
    shows: showsByDate[d.dateStr] || [],
    ethiopianDisplay: `${ETHIOPIAN_MONTHS[d.month - 1]} ${d.day} ቀን ${d.year} ዓ.ም.`,
  }));

  return (
    <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4 overflow-x-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">የአለም ሲኒማ ፕሮግራም</h2>
        <p className="text-gray-400 text-sm">
          {dateRange.length > 0 && `${dateRange[0].dateStr} - ${dateRange[dateRange.length-1].dateStr}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {gridData.map(day => (
          <div
            key={day.dateStr}
            className={`bg-gray-800/40 rounded-lg p-3 border ${
              day.isPast ? 'border-gray-700 opacity-60' : 'border-gray-700 hover:border-[#f47920]/50'
            } transition min-h-[200px] relative`}
          >
            <div className="text-center border-b border-gray-700 pb-2 mb-3">
              <div className="text-lg font-bold text-[#f47920]">{day.dayName}</div>
              <div className="text-xs text-gray-400 leading-tight">{day.ethiopianDisplay}</div>
              {day.isPast && <div className="text-xs text-red-400 font-bold mt-1">(አልፏል)</div>}
            </div>

            <div className="space-y-2">
              {day.shows.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">—</div>
              ) : (
                day.shows.map(show => {
                  const title = show.movieId?.title || show.theaterPerformanceId?.title || 'Show';
                  const isMovie = show.itemType === 'MOVIE';
                  return (
                    <div key={show._id} className="text-sm bg-gray-800/30 rounded-lg p-2 hover:bg-gray-700/30 transition">
                      <div className="flex items-center gap-1 text-[#f47920] font-semibold">
                        <FaClock className="text-xs" />
                        <span>{show.startTime}</span>
                      </div>
                      <div className="text-gray-300 text-xs ml-5 truncate font-medium">
                        {title}{!isMovie && ' (ቲያትር)'}
                      </div>
                      <div className="text-gray-500 text-xs ml-5 flex items-center gap-2">
                        <span>{show.hallId?.hallNumber || 'Hall'}</span>
                        <span className="text-[#f47920] font-bold">{show.price} ETB</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {day.isPast && (
              <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center pointer-events-none">
                <span className="text-white text-sm font-bold bg-red-600/80 px-3 py-1 rounded-full">ተጠናቋል</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
        <p>📞 098 695 9595 · 🌐 alemcinema.com · 📱 Find us on Telegram</p>
        <p className="text-[#f47920] font-semibold mt-1">Refresh Your mind!</p>
      </div>
    </div>
  );
};

export default ScheduleGrid;