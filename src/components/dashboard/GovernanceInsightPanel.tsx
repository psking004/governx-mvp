import { Initiative, Evaluation } from '@/lib/governance';
import { Brain, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

interface GovernanceInsightPanelProps {
  initiatives: Initiative[];
  evaluations: Evaluation[];
}

export function GovernanceInsightPanel({ initiatives, evaluations }: GovernanceInsightPanelProps) {
  const insight = useMemo(() => {
    const latestEvals = initiatives.map(init => {
      const evals = evaluations.filter(e => e.initiative_id === init.id);
      return evals[evals.length - 1];
    }).filter(Boolean);

    if (latestEvals.length === 0) return 'No evaluations available yet. Create and evaluate initiatives to get governance insights.';

    const avgHealth = Math.round(latestEvals.reduce((s, e) => s + e.health_score, 0) / latestEvals.length);
    const totalRisks = latestEvals.reduce((s, e) => s + e.risks.length, 0);
    const atRisk = latestEvals.filter(e => e.health_status === 'At Risk' || e.health_status === 'Governance Failure');
    const healthy = latestEvals.filter(e => e.health_status === 'Healthy MVP');
    const deliveryRisks = latestEvals.filter(e => e.risks.includes('Delivery Risk'));
    const scopeRisks = latestEvals.filter(e => e.risks.includes('Scope Creep Risk'));

    const parts: string[] = [];

    if (avgHealth >= 80) {
      parts.push(`Portfolio health is strong at ${avgHealth}/100 with ${healthy.length} healthy initiative${healthy.length !== 1 ? 's' : ''}.`);
    } else if (avgHealth >= 60) {
      parts.push(`Portfolio health is moderate at ${avgHealth}/100. There's room for improvement across ${latestEvals.length} initiatives.`);
    } else {
      parts.push(`Portfolio health needs attention at ${avgHealth}/100. Multiple initiatives require governance improvements.`);
    }

    if (deliveryRisks.length > 0) {
      parts.push(`${deliveryRisks.length} initiative${deliveryRisks.length > 1 ? 's show' : ' shows'} delivery risk due to long development cycles.`);
    }

    if (scopeRisks.length > 0) {
      parts.push(`${scopeRisks.length} initiative${scopeRisks.length > 1 ? 's have' : ' has'} scope creep risk — consider trimming features.`);
    }

    if (atRisk.length > 0 && deliveryRisks.length === 0 && scopeRisks.length === 0) {
      parts.push(`${atRisk.length} initiative${atRisk.length > 1 ? 's are' : ' is'} at risk. Review validation metrics and scope discipline.`);
    }

    if (totalRisks === 0) {
      parts.push('No active risks detected. Maintain current governance practices.');
    } else {
      parts.push('Consider reducing feature scope and improving validation metrics.');
    }

    return parts.join(' ');
  }, [initiatives, evaluations]);

  const avgHealth = useMemo(() => {
    const latestEvals = initiatives.map(init => {
      const evals = evaluations.filter(e => e.initiative_id === init.id);
      return evals[evals.length - 1];
    }).filter(Boolean);
    if (latestEvals.length === 0) return 0;
    return Math.round(latestEvals.reduce((s, e) => s + e.health_score, 0) / latestEvals.length);
  }, [initiatives, evaluations]);

  const trendIcon = avgHealth >= 70 ? TrendingUp : avgHealth >= 50 ? AlertTriangle : TrendingDown;
  const TrendIcon = trendIcon;

  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">AI Governance Insight</h3>
        </div>
        <div className="flex items-start gap-3">
          <TrendIcon className={`w-4 h-4 mt-0.5 shrink-0 ${avgHealth >= 70 ? 'text-primary' : avgHealth >= 50 ? 'text-governx-amber' : 'text-destructive'}`} />
          <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
        </div>
      </div>
    </div>
  );
}
