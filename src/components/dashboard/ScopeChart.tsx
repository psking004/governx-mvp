import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Feature } from '@/lib/governance';

const COLORS = {
  must_have: 'hsl(165, 80%, 45%)',
  should_have: 'hsl(210, 100%, 60%)',
  could_have: 'hsl(38, 92%, 55%)',
  wont_have: 'hsl(0, 72%, 55%)',
};

const LABELS: Record<string, string> = {
  must_have: 'Must Have',
  should_have: 'Should Have',
  could_have: 'Could Have',
  wont_have: "Won't Have",
};

export function ScopeChart({ features }: { features: Feature[] }) {
  const counts = features.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(counts).map(([key, value]) => ({
    name: LABELS[key] || key,
    value,
    color: COLORS[key as keyof typeof COLORS] || 'hsl(220, 15%, 30%)',
  }));

  if (data.length === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="text-sm text-muted-foreground">No features scoped yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Feature Scope (MoSCoW)</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'hsl(222, 25%, 13%)',
                border: '1px solid hsl(220, 15%, 18%)',
                borderRadius: 8,
                fontSize: 12,
                color: 'hsl(210, 20%, 92%)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[11px] text-muted-foreground">{d.name} ({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
