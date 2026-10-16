import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import {
  ETHIOPIAN_MONTHS,
  ethiopianToDDMMYYYY,
  parseDDMMYYYY,
  formatEthiopianDateDisplay,
  getCurrentEthiopianDDMMYYYY,
  getYearRange,
  getEthiopianDaysInMonth
} from '../utils/ethiopianCalendar';

interface EthiopianDatePickerProps {
  value: string; // Ethiopian date string "DD/MM/YYYY"
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const EthiopianDatePicker: React.FC<EthiopianDatePickerProps> = ({
  value,
  onChange,
  label = 'Date (Ethiopian)',
  required = true,
  className = '',
}) => {
  const isFirstRender = useRef(true);
  const isInternalUpdate = useRef(false);

  const initDate = (): { year: number; month: number; day: number } => {
    if (value) {
      const parsed = parseDDMMYYYY(value);
      if (parsed) return parsed;
    }
    const current = parseDDMMYYYY(getCurrentEthiopianDDMMYYYY());
    if (current) return current;
    return { year: 2018, month: 1, day: 1 };
  };

  const initial = initDate();
  const [year, setYear] = useState<number>(initial.year);
  const [month, setMonth] = useState<number>(initial.month);
  const [day, setDay] = useState<number>(initial.day);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (value) {
      const parsed = parseDDMMYYYY(value);
      if (parsed) {
        setYear(parsed.year);
        setMonth(parsed.month);
        setDay(parsed.day);
      }
    }
  }, [value]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const dateStr = ethiopianToDDMMYYYY(year, month, day);
    isInternalUpdate.current = true;
    onChange(dateStr);
  }, [year, month, day, onChange]);

  const daysInMonth = getEthiopianDaysInMonth(month);
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const currentEthYear = parseDDMMYYYY(getCurrentEthiopianDDMMYYYY())?.year || 2018;
  const yearOptions = getYearRange(currentEthYear, 10);

  const monthOptions = ETHIOPIAN_MONTHS.map((name, index) => ({
    value: index + 1,
    label: name
  }));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <div className="flex items-center gap-2 flex-wrap">
        {/* Day - first */}
        <select
          value={day}
          onChange={(e) => setDay(parseInt(e.target.value))}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#f47920] transition appearance-none"
        >
          {dayOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Month - second */}
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#f47920] transition appearance-none"
        >
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Year - third */}
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#f47920] transition appearance-none"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y} ዓ.ም.
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-[#f47920] font-semibold">
        <FaCalendarAlt className="inline mr-1" />
        {formatEthiopianDateDisplay(ethiopianToDDMMYYYY(year, month, day))}
      </p>
      <p className="text-xs text-gray-500">
        Format: {ethiopianToDDMMYYYY(year, month, day)} (DD/MM/YYYY)
      </p>
      <p className="text-xs text-gray-500">
        ⚠️ This date will be stored as DD/MM/YYYY in the database
      </p>
    </div>
  );
};

export default EthiopianDatePicker;