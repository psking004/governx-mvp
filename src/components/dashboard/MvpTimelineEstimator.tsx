import { useState } from 'react';
import { Initiative, Evaluation } from '@/lib/governance';
import { Clock, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MvpTimelineEstimatorProps {
  initiative: Initiative;
  evaluation: Evaluation;
  cycleDays: number;
  mustHaveCount: number;
}

const COACH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mvp-coach`;

export function MvpTimelineEstimator({ initiative, evaluation, cycleDays, mustHaveCount }: MvpTimelineEstimatorProps) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState(3);
  const [complexity, setComplexity] = useState(3);

  const runEstimator = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis('');
    setHasRun(true);

    try {
      const resp = await fetch(COACH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode: 'timeline',
          data: {
            initiative_name: initiative.name,
            description: initiative.description,
            team_size: teamSize,
            must_have_features: mustHaveCount,
            total_features: initiative.total_features_initial,
            technical_complexity: complexity,
            cycle_score: evaluation.cycle_score,
            scope_score: evaluation.scope_score,
            health_score: evaluation.health_score,
            health_status: evaluation.health_status,
            trimmed_features_count: initiative.trimmed_features_count,
            cycle_days: cycleDays,
          },
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: 'Estimation failed' }));
        throw new Error(errData.error || `Error ${resp.status}`);
      }
      if (!resp.body) throw new Error('No response stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { fullText += content; setAnalysis(fullText); }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Estimation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-governx-amber" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            AI Timeline Estimator
          </h3>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Team Size</label>
          <input
            type="number"
            min={1}
            max={50}
            value={teamSize}
            onChange={e => setTeamSize(Number(e.target.value))}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Technical Complexity (1–5)</label>
          <select
            value={complexity}
            onChange={e => setComplexity(Number(e.target.value))}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none"
          >
            <option value={1}>1 — Simple</option>
            <option value={2}>2 — Low</option>
            <option value={3}>3 — Moderate</option>
            <option value={4}>4 — High</option>
            <option value={5}>5 — Very Complex</option>
          </select>
        </div>
      </div>

      <button
        onClick={runEstimator}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 bg-governx-amber/15 border border-governx-amber/30 rounded-lg text-xs font-medium text-governx-amber hover:bg-governx-amber/25 transition-colors disabled:opacity-50 mb-4"
      >
        {isLoading ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Estimating...</>
        ) : (
          <><Clock className="w-3.5 h-3.5" /> {hasRun ? 'Re-estimate' : 'Estimate Timeline'}</>
        )}
      </button>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">{error}</div>
      )}

      {!hasRun && !error && (
        <p className="text-sm text-muted-foreground">
          Get an AI-powered timeline estimate with delivery risk assessment, key factors, and optimization suggestions.
        </p>
      )}

      {analysis && (
        <div className="prose prose-sm prose-invert max-w-none text-foreground [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-governx-amber [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-accent [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-sm [&_li]:text-muted-foreground [&_strong]:text-foreground [&_ol]:space-y-1 [&_ul]:space-y-1">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}

      {isLoading && !analysis && (
        <div className="flex items-center gap-3 py-6 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-governx-amber" />
          <span className="text-sm text-muted-foreground">Estimating MVP timeline...</span>
        </div>
      )}
    </div>
  );
}
