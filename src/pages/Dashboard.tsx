import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { InitiativeCard } from '@/components/dashboard/InitiativeCard';
import { RiskAlerts } from '@/components/dashboard/RiskAlerts';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { ScopeChart } from '@/components/dashboard/ScopeChart';
import { HealthScoreRing } from '@/components/dashboard/HealthScoreRing';
import { useInitiativeStore } from '@/stores/initiativeStore';
import { PortfolioAnalysis } from '@/components/dashboard/PortfolioAnalysis';
import { useAuthStore } from '@/stores/authStore';
import { FolderKanban, Activity, AlertTriangle, Rocket } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { initiatives, evaluations, features } = useInitiativeStore();

  // Latest evaluation per initiative
  const latestEvals = initiatives.map(init => {
    const evals = evaluations.filter(e => e.initiative_id === init.id);
    return { initiative: init, evaluation: evals[evals.length - 1] };
  }).filter(x => x.evaluation);

  const avgHealth = latestEvals.length > 0
    ? Math.round(latestEvals.reduce((s, x) => s + x.evaluation.health_score, 0) / latestEvals.length)
    : 0;

  const totalRisks = latestEvals.reduce((s, x) => s + x.evaluation.risks.length, 0);
  const readyCount = latestEvals.filter(x => x.evaluation.mvp_status === 'Ready to Scale').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, <span className="text-gradient">{user?.name || 'User'}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your governance portfolio overview</p>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Initiatives" value={initiatives.length} icon={FolderKanban} variant="seafoam" />
          <MetricCard label="Avg Health" value={avgHealth} subtitle="out of 100" icon={Activity} variant="blue" />
          <MetricCard label="Active Risks" value={totalRisks} icon={AlertTriangle} variant={totalRisks > 0 ? 'amber' : 'default'} />
          <MetricCard label="MVP Ready" value={readyCount} subtitle={`of ${initiatives.length}`} icon={Rocket} variant="seafoam" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: initiatives */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Initiative Portfolio</h2>
            <div className="space-y-3">
              {latestEvals.map(({ initiative, evaluation }) => (
                <InitiativeCard key={initiative.id} initiative={initiative} evaluation={evaluation} />
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Portfolio health ring */}
            <div className="glass-card p-5 flex flex-col items-center">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Portfolio Health</h3>
              <HealthScoreRing score={avgHealth} size={140} />
            </div>

            {/* Risk alerts */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Risk Alerts</h3>
              <RiskAlerts evaluations={latestEvals.map(x => x.evaluation)} />
            </div>

            {/* Scope chart */}
            <ScopeChart features={features} />
          </div>
        </div>

        {/* Trend chart */}
        <TrendChart evaluations={evaluations} />
      </div>
    </AppLayout>
  );
}
