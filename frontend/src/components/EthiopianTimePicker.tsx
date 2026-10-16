import React, { useState, useEffect, useRef } from 'react';
import { EthiopianPeriod, PERIOD_OPTIONS, getPeriodAmharic } from '../utils/timeUtils';

interface EthiopianTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const EthiopianTimePicker: React.FC<EthiopianTimePickerProps> = ({
  value,
  onChange,
  label = 'የኢትዮጵያ ሰዓት (Ethiopian Time)',
  required = true,
  className = '',
}) => {
  const isFirstRender = useRef(true);
  const isInternalUpdate = useRef(false);

  const parseEthiopianTime = (timeStr: string): { hour: string; minute: string; period: EthiopianPeriod } => {
    if (!timeStr) return { hour: '6', minute: '00', period: 'morning' };
    
    const parts = timeStr.trim().split(' ');
    if (parts.length < 2) return { hour: '6', minute: '00', period: 'morning' };
    
    const timeParts = parts[0].split(':');
    if (timeParts.length < 2) return { hour: '6', minute: '00', period: 'morning' };
    
    const hour = timeParts[0];
    const minute = timeParts[1].padStart(2, '0');
    
    const periodStr = parts.slice(1).join(' ');
    let period: EthiopianPeriod = 'morning';
    if (periodStr.includes('ሌሊት') || periodStr.includes('Night')) period = 'night';
    else if (periodStr.includes('ማታ') || periodStr.includes('Evening')) period = 'evening';
    else if (periodStr.includes('ከሰዓት') || periodStr.includes('Afternoon')) period = 'afternoon';
    else if (periodStr.includes('ጠዋት') || periodStr.includes('Morning')) period = 'morning';
    
    return { hour, minute, period };
  };

  const [hour, setHour] = useState<string>('6');
  const [minute, setMinute] = useState<string>('00');
  const [period, setPeriod] = useState<EthiopianPeriod>('morning');

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (value) {
      const parsed = parseEthiopianTime(value);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
    }
  }, [value]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const ethiopianTimeStr = `${hour}:${minute} ${getPeriodAmharic(period)}`;
    isInternalUpdate.current = true;
    onChange(ethiopianTimeStr);
  }, [hour, minute, period, onChange]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <div className="flex items-center gap-2">
        <select
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#f47920] transition appearance-none"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <span className="text-white font-bold text-lg">:</span>

        <select
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#f47920] transition appearance-none"
        >
          {['00', '15', '30', '45'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as EthiopianPeriod)}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#f47920] transition appearance-none"
        >
          {PERIOD_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-[#f47920] font-semibold">
        የኢትዮጵያ ሰዓት: {hour}:{minute} {getPeriodAmharic(period)}
      </p>
      <p className="text-xs text-gray-500">
        ⚠️ This time will be stored as Ethiopian time in the database
      </p>
    </div>
  );
};

export default EthiopianTimePicker;