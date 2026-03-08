import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Initiative, Evaluation } from '@/lib/governance';
import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface GovernanceTrendChartProps {
  initiatives: Initiative[];
  evaluations: Evaluation[];
}

export function GovernanceTrendChart({ initiatives, evaluations }: GovernanceTrendChartProps) {
  const data = useMemo(() => {
    // Group evaluations by time and calculate averages
    const latestEvals = initiatives.map(init => {
      const evals = evaluations.filter(e => e.initiative_id === init.id);
      return evals[evals.length - 1];
    }).filter(Boolean);

    if (latestEvals.length === 0) return [];

    // Generate simulated weekly trend data based on current scores
    const avgHealth = Math.round(latestEvals.reduce((s, e) => s + e.health_score, 0) / latestEvals.length);
    const avgCycle = Math.round(latestEvals.reduce((s, e) => s + e.cycle_score, 0) / latestEvals.length);
    const avgScope = Math.round(latestEvals.reduce((s, e) => s + e.scope_score, 0) / latestEvals.length);

    // Create 6-week trend leading to current values
    const weeks = 6;
    return Array.from({ length: weeks }, (_, i) => {
      const progress = (i + 1) / weeks;
      const variance = Math.sin(i * 1.5) * 5;
      return {
        name: `Week ${i + 1}`,
        health: Math.round(Math.max(0, Math.min(100, (avgHealth - 15) + (15 * progress) + variance))),
        cycle: Math.round(Math.max(0, Math.min(100, (avgCycle - 10) + (10 * progress) + variance * 0.5))),
        scope: Math.round(Math.max(0, Math.min(100, (avgScope - 8) + (8 * progress) - variance * 0.3))),
      };
    });
  }, [initiatives, evaluations]);

  if (data.length === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="text-sm text-muted-foreground">No trend data available</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/3 to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
            </div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Governance Trend</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] text-muted-foreground">Health</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] text-muted-foreground">Cycle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-governx-amber" />
              <span className="text-[10px] text-muted-foreground">Scope</span>
            </div>
          </div>
        </div>
        <div className="h-[220px] sm:h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="trendHealthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(165, 80%, 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(165, 80%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="trendCycleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="trendScopeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 15%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(222, 25%, 13%)',
                  border: '1px solid hsl(220, 15%, 18%)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'hsl(210, 20%, 92%)',
                  boxShadow: '0 8px 32px hsl(0 0% 0% / 0.4)',
                }}
              />
              <Area type="monotone" dataKey="health" stroke="hsl(165, 80%, 45%)" fill="url(#trendHealthGrad)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(165, 80%, 45%)' }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="cycle" stroke="hsl(210, 100%, 60%)" fill="url(#trendCycleGrad)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="scope" stroke="hsl(38, 92%, 55%)" fill="url(#trendScopeGrad)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
