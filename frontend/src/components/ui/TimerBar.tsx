// src/components/ui/TimerBar.tsx
"use client";

interface Props {
  percentage: number;
  timeLeft: number;
  isUrgent: boolean;
  label: string;
}

export default function TimerBar({ percentage, timeLeft, isUrgent, label }: Props) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
        <span className={`font-mono font-bold text-sm tabular-nums transition-colors ${
          isUrgent ? "text-danger animate-pulse" : "text-text-secondary"
        }`}>
          {timeLeft}s
        </span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent
              ? "bg-danger"
              : percentage > 60
              ? "bg-success"
              : percentage > 30
              ? "bg-gold"
              : "bg-danger"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
