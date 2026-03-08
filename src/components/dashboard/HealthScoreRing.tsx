import { cn } from '@/lib/utils';

interface HealthScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

export function HealthScoreRing({ score, size = 120, label }: HealthScoreRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? 'hsl(165, 80%, 45%)' : score >= 60 ? 'hsl(38, 92%, 55%)' : 'hsl(0, 72%, 55%)';
  const statusClass = score >= 80 ? 'text-primary' : score >= 60 ? 'text-governx-amber' : 'text-destructive';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="hsl(220, 15%, 18%)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-2xl font-bold', statusClass)}>{score}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</span>
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
    </div>
  );
}
