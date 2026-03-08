import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the AI Governance Advisor inside GovernX, an MVP Governance Intelligence Platform.

Your role is to ANALYZE evaluation results produced by the governance engine and generate clear, actionable insights. DO NOT recompute scores — they are already calculated.

Based on evaluation data, you must:
1. Explain the governance health of the MVP
2. Explain why the score occurred
3. Identify key risks
4. Suggest improvements
5. Suggest how to move toward "Ready to Scale"

Follow this output format using structured markdown:

## MVP GOVERNANCE ANALYSIS

### Overall Status
<explanation using health_score and health_status>

### Cycle Time Assessment
<analysis of development cycle health>

### Scope Discipline Assessment
<analysis of scope trimming>

### Validation Assessment
<evaluation of product-market fit signals>

### Detected Risks
• <risk explanation for each detected risk>

### Trend Insight
<trend explanation>

### Recommended Actions
1. <action>
2. <action>
3. <action>
4. <action>

Write in clear professional language. Focus on practical product strategy advice. Keep concise but insightful. Explain what the team should DO next.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { evaluation } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userMessage = `Analyze this MVP initiative evaluation:

Initiative: ${evaluation.initiative_name}
Description: ${evaluation.description}
Idea Created: ${evaluation.idea_created_at}
First Release: ${evaluation.first_release_at}
Cycle Score: ${evaluation.cycle_score}
Scope Score: ${evaluation.scope_score}
Validation Score: ${evaluation.validation_score}
Health Score: ${evaluation.health_score}
Health Status: ${evaluation.health_status}
MVP Status: ${evaluation.mvp_status}
Risks: ${evaluation.risks?.length > 0 ? evaluation.risks.join(', ') : 'None detected'}
Trend Status: ${evaluation.trend_status}
Total Initial Features: ${evaluation.total_features_initial}
Trimmed Features: ${evaluation.trimmed_features_count}
Cycle Days: ${evaluation.cycle_days}
Scope Trim %: ${evaluation.scope_trim_percentage}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
    console.error("governance-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
