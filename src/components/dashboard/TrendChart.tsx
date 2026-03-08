import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Evaluation } from '@/lib/governance';

export function TrendChart({ evaluations }: { evaluations: Evaluation[] }) {
  const data = evaluations.map((e, i) => ({
    name: `Eval ${i + 1}`,
    health: e.health_score,
    cycle: e.cycle_score,
    scope: e.scope_score,
  }));

  return (
    <div className="glass-card p-5">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Governance Trend</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(165, 80%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(165, 80%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0} />
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
              }}
            />
            <Area type="monotone" dataKey="health" stroke="hsl(165, 80%, 45%)" fill="url(#healthGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="cycle" stroke="hsl(210, 100%, 60%)" fill="url(#blueGrad)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
