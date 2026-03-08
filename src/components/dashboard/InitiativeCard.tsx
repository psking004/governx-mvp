import { Initiative, Evaluation } from '@/lib/governance';
import { HealthScoreRing } from './HealthScoreRing';
import { StatusBadge } from './StatusBadge';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';

interface InitiativeCardProps {
  initiative: Initiative;
  evaluation: Evaluation;
}

export function InitiativeCard({ initiative, evaluation }: InitiativeCardProps) {
  return (
    <Link
      to={`/initiatives/${initiative.id}`}
      className="glass-card p-5 flex items-center gap-5 hover:border-primary/30 transition-all group"
    >
      <HealthScoreRing score={evaluation.health_score} size={64} />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {initiative.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 truncate">{initiative.description}</p>
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <StatusBadge status={evaluation.health_status} />
          <StatusBadge status={evaluation.mvp_status} />
          {evaluation.risks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-destructive">
              <AlertTriangle className="w-3 h-3" />
              {evaluation.risks.length} risk{evaluation.risks.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </Link>
  );
}
