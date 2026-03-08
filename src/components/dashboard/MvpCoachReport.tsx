import { useState } from 'react';
import { Initiative, Evaluation } from '@/lib/governance';
import { Brain, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MvpCoachReportProps {
  initiative: Initiative;
  evaluation: Evaluation;
  cycleDays: number;
  scopeTrimPercentage: number;
}

const COACH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mvp-coach`;

export function MvpCoachReport({ initiative, evaluation, cycleDays, scopeTrimPercentage }: MvpCoachReportProps) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCoach = async () => {
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
          mode: 'improve',
          data: {
            initiative_name: initiative.name,
            description: initiative.description,
            cycle_score: evaluation.cycle_score,
            scope_score: evaluation.scope_score,
            validation_score: initiative.validation_score,
            health_score: evaluation.health_score,
            health_status: evaluation.health_status,
            mvp_status: evaluation.mvp_status,
            risks: evaluation.risks,
            trend_status: evaluation.trend_status,
            total_features_initial: initiative.total_features_initial,
            trimmed_features_count: initiative.trimmed_features_count,
            cycle_days: cycleDays,
            scope_trim_percentage: scopeTrimPercentage,
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

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-governx-purple" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            AI MVP Coach
          </h3>
        </div>
        <button
          onClick={runCoach}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-governx-purple/15 border border-governx-purple/30 rounded-lg text-xs font-medium text-governx-purple hover:bg-governx-purple/25 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Coaching...</>
          ) : (
            <><Brain className="w-3.5 h-3.5" /> {hasRun ? 'Re-run Coach' : 'Get MVP Coaching'}</>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">{error}</div>
      )}

      {!hasRun && !error && (
        <p className="text-sm text-muted-foreground">
          Get AI-powered coaching with success probability, scope optimization, and strategic recommendations to improve this MVP.
        </p>
      )}

      {analysis && (
        <div className="prose prose-sm prose-invert max-w-none text-foreground [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-governx-purple [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-accent [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-sm [&_li]:text-muted-foreground [&_strong]:text-foreground [&_ol]:space-y-1 [&_ul]:space-y-1">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}

      {isLoading && !analysis && (
        <div className="flex items-center gap-3 py-6 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-governx-purple" />
          <span className="text-sm text-muted-foreground">Generating MVP coaching report...</span>
        </div>
      )}
    </div>
  );
}
