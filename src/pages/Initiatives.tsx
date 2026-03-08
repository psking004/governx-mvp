import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useInitiativeStore } from '@/stores/initiativeStore';
import { InitiativeCard } from '@/components/dashboard/InitiativeCard';
import { Search, Filter } from 'lucide-react';

export default function Initiatives() {
  const { initiatives, evaluations } = useInitiativeStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const latestEvals = initiatives.map(init => {
    const evals = evaluations.filter(e => e.initiative_id === init.id);
    return { initiative: init, evaluation: evals[evals.length - 1] };
  }).filter(x => x.evaluation);

  const filtered = latestEvals.filter(({ initiative, evaluation }) => {
    const matchSearch = initiative.name.toLowerCase().includes(search.toLowerCase()) ||
      initiative.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || evaluation.health_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Initiatives</h1>
            <p className="text-sm text-muted-foreground mt-1">{initiatives.length} total initiatives</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search initiatives..."
              className="w-full pl-9 pr-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="Healthy MVP">Healthy</option>
              <option value="At Risk">At Risk</option>
              <option value="Governance Failure">Failure</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map(({ initiative, evaluation }) => (
            <InitiativeCard key={initiative.id} initiative={initiative} evaluation={evaluation} />
          ))}
          {filtered.length === 0 && (
            <div className="glass-card p-10 text-center">
              <p className="text-muted-foreground">No initiatives found</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
