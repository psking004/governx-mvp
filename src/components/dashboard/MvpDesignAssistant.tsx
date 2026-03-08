import { useState } from 'react';
import { Wand2, Loader2, Plus, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MvpDesignAssistantProps {
  name: string;
  description: string;
}

const COACH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mvp-coach`;

export function MvpDesignAssistant({ name, description }: MvpDesignAssistantProps) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [targetUsers, setTargetUsers] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures(prev => [...prev, featureInput.trim()]);
    setFeatureInput('');
  };

  const removeFeature = (idx: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const runDesignAnalysis = async () => {
    if (!name || !description) return;
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
          mode: 'design',
          data: { name, description, target_users: targetUsers, features },
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
          <Wand2 className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            AI MVP Design Assistant
          </h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Add your target users and initial feature ideas. The AI will recommend an optimized MoSCoW-prioritized scope.
      </p>

      {/* Target Users */}
      <div className="mb-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Users</label>
        <input
          type="text"
          value={targetUsers}
          onChange={e => setTargetUsers(e.target.value)}
          placeholder="e.g., SaaS product managers, startup founders"
          className="mt-1.5 w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Feature Input */}
      <div className="mb-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Initial Features</label>
        <div className="flex gap-2 mt-1.5">
          <input
            type="text"
            value={featureInput}
            onChange={e => setFeatureInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            placeholder="Type a feature and press Enter"
            className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button onClick={addFeature} className="px-3 py-2 bg-primary/15 border border-primary/30 rounded-lg text-sm text-primary hover:bg-primary/25 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {features.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {features.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary border border-border rounded-md text-xs text-foreground">
              {f}
              <button onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        onClick={runDesignAnalysis}
        disabled={isLoading || !name || !description}
        className="flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary/30 rounded-lg text-xs font-medium text-primary hover:bg-primary/25 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing scope...</>
        ) : (
          <><Wand2 className="w-3.5 h-3.5" /> {hasRun ? 'Re-analyze Scope' : 'Optimize MVP Scope'}</>
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">{error}</div>
      )}

      {analysis && (
        <div className="mt-4 prose prose-sm prose-invert max-w-none text-foreground [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-accent [&_h3]:mt-3 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-governx-amber [&_h4]:mt-2 [&_h4]:mb-1 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-sm [&_li]:text-muted-foreground [&_strong]:text-foreground [&_ol]:space-y-1 [&_ul]:space-y-1">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}

      {isLoading && !analysis && (
        <div className="flex items-center gap-3 py-6 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Designing optimal MVP scope...</span>
        </div>
      )}
    </div>
  );
}
