import { Evaluation } from '@/lib/governance';
import { AlertTriangle, Clock, Target, TrendingDown } from 'lucide-react';

const RISK_ICONS = {
  'Delivery Risk': Clock,
  'Scope Creep Risk': Target,
  'Weak Product Market Fit Risk': TrendingDown,
};

const RISK_COLORS = {
  'Delivery Risk': 'text-destructive bg-destructive/10',
  'Scope Creep Risk': 'text-governx-amber bg-governx-amber/10',
  'Weak Product Market Fit Risk': 'text-governx-purple bg-governx-purple/10',
};

export function RiskAlerts({ evaluations }: { evaluations: Evaluation[] }) {
  const allRisks = evaluations.flatMap(e =>
    e.risks.map(r => ({ risk: r, initiative_id: e.initiative_id }))
  );

  if (allRisks.length === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="text-sm text-muted-foreground">No active risks detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allRisks.slice(0, 5).map((item, i) => {
        const Icon = RISK_ICONS[item.risk] || AlertTriangle;
        const color = RISK_COLORS[item.risk] || 'text-destructive bg-destructive/10';
        return (
          <div key={i} className="glass-card p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">{item.risk}</p>
              <p className="text-[11px] text-muted-foreground">Initiative #{item.initiative_id}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
