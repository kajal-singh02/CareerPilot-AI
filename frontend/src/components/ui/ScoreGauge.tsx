import React from 'react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  maxScore = 100,
  size = 120,
  label = 'Score',
  sublabel = 'out of 100',
}) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = '#10B981'; // emerald
  if (percentage < 65) strokeColor = '#ef233c'; // crimson red noir
  else if (percentage < 80) strokeColor = '#F59E0B'; // amber

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#27272a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-heading font-extrabold text-3xl text-white leading-none">
            {Math.round(score)}
          </span>
          <span className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-wider mt-1">
            {label}
          </span>
        </div>
      </div>
      {sublabel && (
        <span className="text-xs text-zinc-300 font-semibold mt-2.5">{sublabel}</span>
      )}
    </div>
  );
};
