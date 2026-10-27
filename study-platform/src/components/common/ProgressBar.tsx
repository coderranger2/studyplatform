import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  label?: string;
  showPercent?: boolean;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  height = 8
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="progress-container">
      {(label || showPercent) && (
        <div className="progress-label-row">
          {label && <span className="progress-label">{label}</span>}
          {showPercent && <span className="progress-percent">{clamped}%</span>}
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        <div
          className="progress-fill"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
