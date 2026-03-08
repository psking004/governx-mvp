import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS: Record<string, string> = {
  design: `You are the AI MVP Design Assistant inside GovernX.

Your role is to analyze a project description, target users, and initial feature list, then recommend a refined MVP scope using MoSCoW prioritization.

You must:
1. Identify the core user journey
2. Classify each feature as Must Have, Should Have, Could Have, or Won't Have
3. Explain your reasoning
4. Suggest any missing critical features
5. Recommend features to cut

Output format (structured markdown):

## MVP SCOPE RECOMMENDATION

### Core User Journey
<description of the single most important user flow>

### MoSCoW Classification

#### Must Have
- feature — reason

#### Should Have
- feature — reason

#### Could Have
- feature — reason

#### Won't Have
- feature — reason

### Missing Critical Features
- feature suggestion

### Scope Optimization Summary
<brief summary of changes and why>

Write concisely. Focus on reducing scope to the minimum viable product.`,

  improve: `You are the AI MVP Improvement Advisor inside GovernX.

You receive governance evaluation results. DO NOT recompute scores — they are already calculated.

Analyze the results and generate strategic recommendations for improving the MVP.

Output format (structured markdown):

## AI MVP COACH REPORT

### MVP Assessment
<summary of current state>

### Success Probability
<percentage estimate based on governance signals with explanation>
- 80-100%: Strong MVP foundation
- 60-79%: Moderate success potential
- 40-59%: Risky MVP
- Below 40%: High failure probability

### Scope Optimization Suggestions
• suggestion
• suggestion

### Key Risks
• risk explanation
• risk explanation

### Recommended Next Steps
1. action
2. action
3. action
4. action

### Strategic Insight
<one powerful insight about this MVP's trajectory>

Focus on practical product strategy. Keep concise but insightful.`,

  portfolio: `You are the AI Portfolio Analyst inside GovernX.

You receive data about multiple MVP initiatives with their governance scores.

Analyze portfolio-level trends and provide strategic insights.

Output format (structured markdown):

## PORTFOLIO GOVERNANCE ANALYSIS

### Portfolio Health Summary
<overall assessment>

### Key Metrics
- Average cycle time assessment
- Common risks across portfolio
- Best performing initiative and why
- Worst performing initiative and why

### Portfolio Trends
<governance trend across initiatives>

### Systemic Issues
• issue affecting multiple initiatives

### Strategic Recommendations
1. portfolio-level action
2. portfolio-level action
3. portfolio-level action

### Top Priority
<single most important thing to address>

Be specific and data-driven. Reference initiative names.`,

  timeline: `You are the AI MVP Timeline Estimator inside GovernX.

You receive data about an MVP initiative including team size, feature counts, and technical complexity.

DO NOT recompute governance scores — they are already calculated.

Estimate a realistic MVP development timeline and identify delivery risks.

Output format (structured markdown):

## MVP TIMELINE ESTIMATE

### Estimated Timeline
<realistic development time estimate with range, e.g. "6–9 weeks">
<explanation of how you arrived at this estimate>

### Delivery Risk Assessment
<Low / Medium / High / Critical>
<explanation of delivery risk level based on the data>

### Key Factors Affecting Timeline
• factor and its impact
• factor and its impact
• factor and its impact

### Timeline Optimization Suggestions
1. specific action to reduce development time
2. specific action to reduce development time
3. specific action to reduce development time

### Recommended Launch Plan
<optimal MVP launch timeline with milestones>
- Week X: milestone
- Week X: milestone
- Week X: milestone

### Strategic Insight
<one powerful insight about this MVP's delivery trajectory>

Focus on practical, realistic estimates. Be specific about trade-offs between speed and scope.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = PROMPTS[mode];
    if (!systemPrompt) throw new Error(`Unknown mode: ${mode}`);

    let userMessage = "";

    if (mode === "design") {
      userMessage = `Analyze this MVP and recommend a refined scope:

Project: ${data.name}
Description: ${data.description}
Target Users: ${data.target_users || "Not specified"}

Initial Feature List:
${(data.features || []).map((f: string, i: number) => `${i + 1}. ${f}`).join("\n")}

Total features: ${data.features?.length || 0}`;
    } else if (mode === "improve") {
      userMessage = `Analyze this MVP evaluation and provide improvement recommendations:

Initiative: ${data.initiative_name}
Description: ${data.description}
Cycle Score: ${data.cycle_score}/100
Scope Score: ${data.scope_score}/100
Validation Score: ${data.validation_score}/100
Health Score: ${data.health_score}/100
Health Status: ${data.health_status}
MVP Status: ${data.mvp_status}
Risks: ${data.risks?.length > 0 ? data.risks.join(", ") : "None detected"}
Trend: ${data.trend_status}
Cycle Days: ${data.cycle_days}
Scope Trim %: ${data.scope_trim_percentage}%
Total Features: ${data.total_features_initial}
Trimmed Features: ${data.trimmed_features_count}`;
    } else if (mode === "timeline") {
      userMessage = `Estimate the MVP development timeline for this initiative:

Initiative: ${data.initiative_name}
Description: ${data.description}
Team Size: ${data.team_size} developers
Must-Have Features: ${data.must_have_features}
Total Features: ${data.total_features}
Technical Complexity: ${data.technical_complexity}/5
Cycle Score: ${data.cycle_score}/100
Scope Score: ${data.scope_score}/100
Health Score: ${data.health_score}/100
Health Status: ${data.health_status}
Trimmed Features: ${data.trimmed_features_count}
Current Cycle Days: ${data.cycle_days}`;
    } else if (mode === "portfolio") {
      const initSummaries = (data.initiatives || [])
        .map(
          (i: any) =>
            `- ${i.name}: Health ${i.health_score} (${i.health_status}), Risks: ${i.risks?.join(", ") || "None"}, Trend: ${i.trend_status}, Cycle Days: ${i.cycle_days}, MVP Status: ${i.mvp_status}`
        )
        .join("\n");

      userMessage = `Analyze this portfolio of ${data.initiatives?.length || 0} MVP initiatives:

${initSummaries}

Portfolio Average Health: ${data.avg_health}
Total Active Risks: ${data.total_risks}
MVP Ready Count: ${data.ready_count}/${data.initiatives?.length || 0}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mvp-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
