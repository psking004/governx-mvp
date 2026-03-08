import { HealthStatus, MvpStatus, RiskType, TrendStatus } from '@/lib/governance';
import { cn } from '@/lib/utils';

type BadgeType = HealthStatus | MvpStatus | RiskType | TrendStatus | string;

const styles: Record<string, string> = {
  'Healthy MVP': 'bg-primary/15 text-primary border-primary/30',
  'At Risk': 'bg-governx-amber/15 text-governx-amber border-governx-amber/30',
  'Governance Failure': 'bg-destructive/15 text-destructive border-destructive/30',
  'Ready to Scale': 'bg-primary/15 text-primary border-primary/30',
  'Remain in MVP': 'bg-accent/15 text-accent border-accent/30',
  'Delivery Risk': 'bg-destructive/15 text-destructive border-destructive/30',
  'Scope Creep Risk': 'bg-governx-amber/15 text-governx-amber border-governx-amber/30',
  'Weak Product Market Fit Risk': 'bg-governx-purple/15 text-governx-purple border-governx-purple/30',
  'Governance Declining': 'bg-destructive/15 text-destructive border-destructive/30',
  'Stable': 'bg-primary/15 text-primary border-primary/30',
  'No History': 'bg-secondary text-muted-foreground border-border',
};

export function StatusBadge({ status }: { status: BadgeType }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border tracking-wide',
      styles[status] || 'bg-secondary text-muted-foreground border-border'
    )}>
      {status}
    </span>
  );
}
