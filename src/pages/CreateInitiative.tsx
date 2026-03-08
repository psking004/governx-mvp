import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useInitiativeStore } from '@/stores/initiativeStore';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft } from 'lucide-react';

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
    validation_score: 70,
    stability_verified: false,
    core_metric_threshold_met: false,
    scalability_path_defined: false,
  });

  const update = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addInitiative({ ...form, created_by: user?.id || 'unknown' });
    runEval(id);
    navigate(`/initiatives/${id}`);
  };

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

          {/* Validation score */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Validation Score (0-100)</label>
            <input type="number" min={0} max={100} required value={form.validation_score} onChange={e => update('validation_score', +e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
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
