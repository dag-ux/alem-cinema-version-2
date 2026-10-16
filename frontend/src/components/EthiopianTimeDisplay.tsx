import React from 'react';
import { EthiopianPeriod, getPeriodAmharic } from '../utils/timeUtils';

interface EthiopianTimeDisplayProps {
  time: string; // Ethiopian time string like "2:00 ጠዋት"
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const EthiopianTimeDisplay: React.FC<EthiopianTimeDisplayProps> = ({
  time,
  className = '',
  showLabel = true,
  size = 'md'
}) => {
  if (!time) return null;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className={`font-semibold text-white ${sizeClasses[size]}`}>
        {time}
      </span>
      {showLabel && (
        <span className="text-[10px] text-gray-500">🇪🇹</span>
      )}
    </div>
  );
};

export default EthiopianTimeDisplay;