import { Initiative, Evaluation } from '@/lib/governance';
import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useMemo } from 'react';

interface ActivityFeedProps {
  initiatives: Initiative[];
  evaluations: Evaluation[];
}

interface ActivityItem {
  id: string;
  icon: typeof CheckCircle2;
  iconColor: string;
  message: string;
  timestamp: string;
  type: 'evaluation' | 'risk' | 'improvement' | 'decline';
}

export function ActivityFeed({ initiatives, evaluations }: ActivityFeedProps) {
  const activities = useMemo(() => {
    const items: ActivityItem[] = [];

    initiatives.forEach(init => {
      const evals = evaluations.filter(e => e.initiative_id === init.id);
      if (evals.length === 0) return;

      const latest = evals[evals.length - 1];

      // Evaluation completed
      items.push({
        id: `eval-${latest.id}`,
        icon: CheckCircle2,
        iconColor: 'text-primary bg-primary/10',
        message: `${init.name} evaluated — score ${latest.health_score}`,
        timestamp: latest.created_at,
        type: 'evaluation',
      });

      // Risks detected
      latest.risks.forEach(risk => {
        items.push({
          id: `risk-${latest.id}-${risk}`,
          icon: AlertTriangle,
          iconColor: 'text-governx-amber bg-governx-amber/10',
          message: `${init.name} flagged — ${risk.toLowerCase()} detected`,
          timestamp: latest.created_at,
          type: 'risk',
        });
      });

      // Score improvements/declines
      if (evals.length > 1) {
        const prev = evals[evals.length - 2];
        const diff = latest.health_score - prev.health_score;
        if (diff > 0) {
          items.push({
            id: `improve-${latest.id}`,
            icon: TrendingUp,
            iconColor: 'text-primary bg-primary/10',
            message: `${init.name} score improved by +${diff} points`,
            timestamp: latest.created_at,
            type: 'improvement',
          });
        } else if (diff < 0) {
          items.push({
            id: `decline-${latest.id}`,
            icon: TrendingDown,
            iconColor: 'text-destructive bg-destructive/10',
            message: `${init.name} score declined by ${diff} points`,
            timestamp: latest.created_at,
            type: 'decline',
          });
        }
      }

      // Validation updates
      if (init.validation_metrics) {
        const retention = init.validation_metrics.user_retention_rate;
        if (retention > 60) {
          items.push({
            id: `validation-${init.id}`,
            icon: Activity,
            iconColor: 'text-accent bg-accent/10',
            message: `${init.name} validation updated — ${retention}% retention`,
            timestamp: init.created_at,
            type: 'evaluation',
          });
        }
      }
    });

    // Sort by timestamp descending, take latest 8
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
  }, [initiatives, evaluations]);

  if (activities.length === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-accent" />
          </div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent Governance Activity</h3>
        </div>
        <div className="space-y-1">
          {activities.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-default"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed pt-1">{item.message}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
