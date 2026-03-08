import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useInitiativeStore } from '@/stores/initiativeStore';
import { HealthScoreRing } from '@/components/dashboard/HealthScoreRing';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ScopeChart } from '@/components/dashboard/ScopeChart';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { Feature } from '@/lib/governance';
import { GovernanceAdvisor } from '@/components/dashboard/GovernanceAdvisor';
import { ArrowLeft, Trash2, RefreshCw, Plus } from 'lucide-react';
import { useState } from 'react';
import { calculateCycleScore, calculateScopeScore } from '@/lib/governance';

const MOSCOW_LABELS: Record<string, string> = {
  must_have: 'Must Have',
  should_have: 'Should Have',
  could_have: 'Could Have',
  wont_have: "Won't Have",
};

const MOSCOW_COLORS: Record<string, string> = {
  must_have: 'bg-primary/15 text-primary border-primary/30',
  should_have: 'bg-accent/15 text-accent border-accent/30',
  could_have: 'bg-governx-amber/15 text-governx-amber border-governx-amber/30',
  wont_have: 'bg-destructive/15 text-destructive border-destructive/30',
};

export default function InitiativeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useInitiativeStore();
  const initiative = store.initiatives.find(i => i.id === id);
  const features = store.getInitiativeFeatures(id || '');
  const evals = store.getInitiativeEvaluations(id || '');
  const latestEval = evals[evals.length - 1];

  const [newFeature, setNewFeature] = useState('');
  const [newCategory, setNewCategory] = useState<Feature['category']>('must_have');
  const [showAddFeature, setShowAddFeature] = useState(false);

  if (!initiative || !latestEval) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Initiative not found</p>
          <button onClick={() => navigate('/')} className="text-primary text-sm mt-2">Go to Dashboard</button>
        </div>
      </AppLayout>
    );
  }

  const cycle = calculateCycleScore(initiative.idea_created_at, initiative.first_release_at);
  const scope = calculateScopeScore(initiative.total_features_initial, initiative.trimmed_features_count);

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    store.addFeature({ initiative_id: initiative.id, feature_name: newFeature, category: newCategory });
    setNewFeature('');
    setShowAddFeature(false);
  };

  const handleReEvaluate = () => {
    store.evaluateInitiative(initiative.id);
  };

  const handleDelete = () => {
    store.deleteInitiative(initiative.id);
    navigate('/initiatives');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-2">
            <button onClick={handleReEvaluate} className="flex items-center gap-2 px-3 py-2 bg-secondary border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Re-evaluate
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Title + badges */}
        <div className="glass-card p-6">
          <div className="flex items-start gap-6">
            <HealthScoreRing score={latestEval.health_score} size={100} />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{initiative.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{initiative.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <StatusBadge status={latestEval.health_status} />
                <StatusBadge status={latestEval.mvp_status} />
                <StatusBadge status={latestEval.trend_status} />
                {latestEval.risks.map(r => <StatusBadge key={r} status={r} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Scoring breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Cycle Time</p>
            <p className="text-2xl font-bold text-foreground mt-2">{cycle.days} days</p>
            <p className="text-xs text-muted-foreground mt-1">Score: <span className="text-primary font-semibold">{latestEval.cycle_score}</span></p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Scope Trim</p>
            <p className="text-2xl font-bold text-foreground mt-2">{scope.percentage.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Score: <span className="text-accent font-semibold">{latestEval.scope_score}</span></p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Validation</p>
            <p className="text-2xl font-bold text-foreground mt-2">{initiative.validation_score}</p>
            <p className="text-xs text-muted-foreground mt-1">Exit criteria: {latestEval.mvp_status === 'Ready to Scale' ? '4/4' : `met`}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Features (MoSCoW) */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Feature Scope (MoSCoW)</h3>
              <button onClick={() => setShowAddFeature(true)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {showAddFeature && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)}
                  placeholder="Feature name"
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <select value={newCategory} onChange={e => setNewCategory(e.target.value as Feature['category'])}
                  className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none">
                  {Object.entries(MOSCOW_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={handleAddFeature} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Add</button>
              </div>
            )}

            <div className="space-y-2">
              {features.length === 0 && <p className="text-sm text-muted-foreground">No features added yet</p>}
              {features.map(f => (
                <div key={f.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${MOSCOW_COLORS[f.category]}`}>
                      {MOSCOW_LABELS[f.category]}
                    </span>
                    <span className="text-sm text-foreground">{f.feature_name}</span>
                  </div>
                  <button onClick={() => store.deleteFeature(f.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Scope visualization */}
          <ScopeChart features={features} />
        </div>

        {/* AI Governance Advisor */}
        <GovernanceAdvisor
          initiative={initiative}
          evaluation={latestEval}
          cycleDays={cycle.days}
          scopeTrimPercentage={scope.percentage}
        />

        {/* Trend */}
        <TrendChart evaluations={evals} />
      </div>
    </AppLayout>
  );
}
