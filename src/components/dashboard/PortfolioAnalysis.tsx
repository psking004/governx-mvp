import { useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Initiative, Evaluation, calculateCycleScore } from '@/lib/governance';

interface PortfolioAnalysisProps {
  initiatives: Initiative[];
  evaluations: Evaluation[];
}

const COACH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mvp-coach`;

export function PortfolioAnalysis({ initiatives, evaluations }: PortfolioAnalysisProps) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPortfolioAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis('');
    setHasRun(true);

    // Build portfolio data
    const latestEvals = initiatives.map(init => {
      const evals = evaluations.filter(e => e.initiative_id === init.id);
      const latest = evals[evals.length - 1];
      if (!latest) return null;
      const cycle = calculateCycleScore(init.idea_created_at, init.first_release_at);
      return {
        name: init.name,
        health_score: latest.health_score,
        health_status: latest.health_status,
        mvp_status: latest.mvp_status,
        risks: latest.risks,
        trend_status: latest.trend_status,
        cycle_days: cycle.days,
      };
    }).filter(Boolean);

    const avgHealth = latestEvals.length > 0
      ? Math.round(latestEvals.reduce((s, x) => s + (x?.health_score || 0), 0) / latestEvals.length)
      : 0;
    const totalRisks = latestEvals.reduce((s, x) => s + (x?.risks?.length || 0), 0);
    const readyCount = latestEvals.filter(x => x?.mvp_status === 'Ready to Scale').length;

    try {
      const resp = await fetch(COACH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode: 'portfolio',
          data: {
            initiatives: latestEvals,
            avg_health: avgHealth,
            total_risks: totalRisks,
            ready_count: readyCount,
          },
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: 'Analysis failed' }));
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
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (initiatives.length < 2) return null;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            AI Portfolio Analysis
          </h3>
        </div>
        <button
          onClick={runPortfolioAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-accent/15 border border-accent/30 rounded-lg text-xs font-medium text-accent hover:bg-accent/25 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
          ) : (
            <><BarChart3 className="w-3.5 h-3.5" /> {hasRun ? 'Re-analyze Portfolio' : 'Analyze Portfolio'}</>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">{error}</div>
      )}

      {!hasRun && !error && (
        <p className="text-sm text-muted-foreground">
          Get AI-powered portfolio-level insights across all {initiatives.length} initiatives — identify systemic issues, trends, and strategic priorities.
        </p>
      )}

      {analysis && (
        <div className="prose prose-sm prose-invert max-w-none text-foreground [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-accent [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-primary [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-sm [&_li]:text-muted-foreground [&_strong]:text-foreground [&_ol]:space-y-1 [&_ul]:space-y-1">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}

      {isLoading && !analysis && (
        <div className="flex items-center gap-3 py-6 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <span className="text-sm text-muted-foreground">Analyzing portfolio governance trends...</span>
        </div>
      )}
    </div>
  );
}
