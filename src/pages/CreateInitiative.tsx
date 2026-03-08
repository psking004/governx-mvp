import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useInitiativeStore } from '@/stores/initiativeStore';
import { useAuthStore } from '@/stores/authStore';

import { calculateValidationScore, ValidationMetrics } from '@/lib/governance';
import { ArrowLeft, Users, Activity, TrendingUp, ThumbsUp } from 'lucide-react';

export default function CreateInitiative() {
  const navigate = useNavigate();
  const { addInitiative, evaluateInitiative: runEval } = useInitiativeStore();
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    description: '',
    idea_created_at: '',
    first_release_at: '',
    total_features_initial: 20,
    trimmed_features_count: 5,
    stability_verified: false,
    core_metric_threshold_met: false,
    scalability_path_defined: false,
  });

  const [metrics, setMetrics] = useState<ValidationMetrics>({
    beta_users: 0,
    weekly_active_users: 0,
    user_retention_rate: 0,
    positive_feedback_percentage: 0,
  });

  const validationScore = useMemo(() => calculateValidationScore(metrics), [metrics]);

  const update = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }));
  const updateMetric = (key: keyof ValidationMetrics, value: number) =>
    setMetrics(m => ({ ...m, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addInitiative({
      ...form,
      validation_score: validationScore,
      validation_metrics: metrics,
      created_by: user?.id || 'unknown',
    });
    runEval(id);
    navigate(`/initiatives/${id}`);
  };

  const scoreColor = validationScore >= 70 ? 'text-primary' : validationScore >= 50 ? 'text-governx-amber' : 'text-destructive';

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div>
          <h1 className="text-2xl font-bold text-foreground">New Initiative</h1>
          <p className="text-sm text-muted-foreground mt-1">Define your MVP product initiative</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project Name</label>
            <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., PayFlow Checkout" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea required value={form.description} onChange={e => update('description', e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20"
              placeholder="What problem does this MVP solve?" />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Idea Created</label>
              <input type="date" required value={form.idea_created_at} onChange={e => update('idea_created_at', e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">First Release</label>
              <input type="date" required value={form.first_release_at} onChange={e => update('first_release_at', e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          {/* Feature counts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Initial Features</label>
              <input type="number" min={1} required value={form.total_features_initial} onChange={e => update('total_features_initial', +e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trimmed Features</label>
              <input type="number" min={0} required value={form.trimmed_features_count} onChange={e => update('trimmed_features_count', +e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          {/* Validation Evidence Metrics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Validation Evidence</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Calculated Score:</span>
                <span className={`text-lg font-bold ${scoreColor}`}>{validationScore}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <label className="text-xs font-medium text-muted-foreground">Beta Users</label>
                </div>
                <input type="number" min={0} value={metrics.beta_users} onChange={e => updateMetric('beta_users', +e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., 25" />
                <p className="text-[10px] text-muted-foreground mt-1">Weight: 20% · Target: 50+</p>
              </div>

              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-accent" />
                  <label className="text-xs font-medium text-muted-foreground">Weekly Active Users</label>
                </div>
                <input type="number" min={0} value={metrics.weekly_active_users} onChange={e => updateMetric('weekly_active_users', +e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., 60" />
                <p className="text-[10px] text-muted-foreground mt-1">Weight: 25% · Target: 100+</p>
              </div>

              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-governx-amber" />
                  <label className="text-xs font-medium text-muted-foreground">User Retention Rate</label>
                </div>
                <input type="number" min={0} max={100} value={metrics.user_retention_rate} onChange={e => updateMetric('user_retention_rate', +e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., 65%" />
                <p className="text-[10px] text-muted-foreground mt-1">Weight: 30% · Percentage</p>
              </div>

              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                  <label className="text-xs font-medium text-muted-foreground">Positive Feedback %</label>
                </div>
                <input type="number" min={0} max={100} value={metrics.positive_feedback_percentage} onChange={e => updateMetric('positive_feedback_percentage', +e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., 80%" />
                <p className="text-[10px] text-muted-foreground mt-1">Weight: 25% · Percentage</p>
              </div>
            </div>

            {/* Score breakdown bar */}
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${validationScore}%`,
                  background: validationScore >= 70
                    ? 'hsl(var(--primary))'
                    : validationScore >= 50
                    ? 'hsl(var(--governx-amber))'
                    : 'hsl(var(--destructive))',
                }}
              />
            </div>
          </div>

          {/* Booleans */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exit Gate Criteria</p>
            {[
              { key: 'stability_verified', label: 'Stability Verified' },
              { key: 'core_metric_threshold_met', label: 'Core Metric Threshold Met' },
              { key: 'scalability_path_defined', label: 'Scalability Path Defined' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                  onChange={e => update(key, e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary/50" />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>

          <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            Create & Evaluate Initiative
          </button>
        </form>

      </div>
    </AppLayout>
  );
}
