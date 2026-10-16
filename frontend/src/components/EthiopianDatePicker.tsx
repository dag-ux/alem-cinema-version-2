import React, { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// ─── Ethiopian Calendar Data ──────────────────────────────
const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሀሴ', 'ጳጉሜ'
];
const AMHARIC_DAYS_SHORT = ['እሁ', 'ሰኞ', 'ማክ', 'ረቡ', 'ሐሙ', 'አር', 'ቅዳ'];

// ─── Helpers ──────────────────────────────────────────────
const isGregorianLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);

const getEthiopianDaysInMonth = (month: number, year: number) => {
  if (month === 13) {
    // Pagume: 5 days normally, 6 in leap year (Gregorian year = Ethiopian year + 7 or 8)
    const gregYear = year + 7;
    return isGregorianLeap(gregYear) ? 6 : 5;
  }
  return 30;
};

// Convert Ethiopian date to Gregorian for day-of-week (0 = Sunday)
const ethiopianToGregorianDate = (year: number, month: number, day: number): Date => {
  const gregYear = year + 7;
  const newYearDay = isGregorianLeap(gregYear) ? 11 : 12;
  const newYear = new Date(gregYear, 8, newYearDay); // September
  const totalDays = (month - 1) * 30 + (day - 1);
  const result = new Date(newYear);
  result.setDate(result.getDate() + totalDays);
  return result;
};

// ─── Component ────────────────────────────────────────────
interface EthiopianDatePickerProps {
  value: string; // DD/MM/YYYY
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

const EthiopianDatePicker: React.FC<EthiopianDatePickerProps> = ({
  value,
  onChange,
  label = 'Date (Ethiopian)',
  required = true,
}) => {
  // Parse current value or default to today
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) return parseInt(parts[1]);
    }
    const today = new Date();
    // Approximate Ethiopian month for today
    const gregYear = today.getFullYear();
    const newYearDay = isGregorianLeap(gregYear) ? 11 : 12;
    const newYear = new Date(gregYear, 8, newYearDay);
    if (today >= newYear) {
      const diff = Math.floor((today.getTime() - newYear.getTime()) / 86400000);
      return Math.min(13, Math.floor(diff / 30) + 1);
    } else {
      const prevNewYear = new Date(gregYear - 1, 8, newYearDay);
      const diff = Math.floor((today.getTime() - prevNewYear.getTime()) / 86400000);
      return Math.min(13, Math.floor(diff / 30) + 1);
    }
  });

  const [currentYear, setCurrentYear] = useState<number>(() => {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) return parseInt(parts[2]);
    }
    const today = new Date();
    const gregYear = today.getFullYear();
    const newYearDay = isGregorianLeap(gregYear) ? 11 : 12;
    const newYear = new Date(gregYear, 8, newYearDay);
    return today >= newYear ? gregYear - 7 : gregYear - 8;
  });

  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) return parseInt(parts[0]);
    }
    return null;
  });

  // Generate grid of days for the current month
  const daysInMonth = getEthiopianDaysInMonth(currentMonth, currentYear);
  const firstDayOfMonth = ethiopianToGregorianDate(currentYear, currentMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  const daysArray = useMemo(() => {
    const arr: (number | null)[] = [];
    // Add empty slots for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) arr.push(null);
    // Add days 1..daysInMonth
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [startDayOfWeek, daysInMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(13);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 13) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const formatted = `${String(day).padStart(2, '0')}/${String(currentMonth).padStart(2, '0')}/${currentYear}`;
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Calendar Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition"
          >
            <FaChevronLeft />
          </button>
          <div className="text-white font-semibold text-lg">
            {ETHIOPIAN_MONTHS[currentMonth - 1]} {currentYear} ዓ.ም.
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition"
          >
            <FaChevronRight />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
          {AMHARIC_DAYS_SHORT.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayClick(day)}
                className={`h-8 rounded-full text-sm transition ${
                  isSelected
                    ? 'bg-[#f47920] text-white font-bold'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview of selected date */}
      {selectedDay && (
        <p className="text-sm text-[#f47920] font-semibold">
          የኢትዮጵያ ቀን: {selectedDay}/{currentMonth}/{currentYear} ({ETHIOPIAN_MONTHS[currentMonth - 1]} {selectedDay} ቀን {currentYear} ዓ.ም.)
        </p>
      )}
      <p className="text-xs text-gray-500">
        Format: DD/MM/YYYY (e.g., 04/02/2019)
      </p>
    </div>
  );
};

export default EthiopianDatePicker;