import { cn } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: 'default' | 'seafoam' | 'blue' | 'amber' | 'red';
}

const variantStyles = {
  default: 'border-border',
  seafoam: 'border-primary/30 glow-seafoam',
  blue: 'border-accent/30 glow-blue',
  amber: 'border-governx-amber/30',
  red: 'border-destructive/30',
};

const iconVariants = {
  default: 'bg-secondary text-foreground',
  seafoam: 'bg-primary/10 text-primary',
  blue: 'bg-accent/10 text-accent',
  amber: 'bg-governx-amber/10 text-governx-amber',
  red: 'bg-destructive/10 text-destructive',
};

export function MetricCard({ label, value, subtitle, icon: Icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <div className={cn('glass-card p-4 sm:p-5 space-y-2 sm:space-y-3', variantStyles[variant])}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconVariants[variant])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{value}</span>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {trend && (
        <p className={cn('text-xs font-medium', trend.positive ? 'text-primary' : 'text-destructive')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  );
}
