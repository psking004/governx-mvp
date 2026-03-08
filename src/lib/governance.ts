// GovernX Deterministic Governance Scoring Engine

export interface Initiative {
  id: string;
  name: string;
  description: string;
  idea_created_at: string;
  first_release_at: string;
  total_features_initial: number;
  trimmed_features_count: number;
  validation_score: number;
  stability_verified: boolean;
  core_metric_threshold_met: boolean;
  scalability_path_defined: boolean;
  created_by: string;
  created_at: string;
}

export interface Feature {
  id: string;
  initiative_id: string;
  feature_name: string;
  category: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
}

export type HealthStatus = 'Healthy MVP' | 'At Risk' | 'Governance Failure';
export type MvpStatus = 'Ready to Scale' | 'Remain in MVP';
export type RiskType = 'Delivery Risk' | 'Scope Creep Risk' | 'Weak Product Market Fit Risk';
export type TrendStatus = 'Governance Declining' | 'Stable' | 'No History';

export interface Evaluation {
  id: string;
  initiative_id: string;
  cycle_score: number;
  scope_score: number;
  health_score: number;
  health_status: HealthStatus;
  mvp_status: MvpStatus;
  risks: RiskType[];
  trend_status: TrendStatus;
  created_at: string;
}

// STEP 1 — Cycle Time
export function calculateCycleScore(ideaCreatedAt: string, firstReleaseAt: string): { days: number; score: number } {
  const idea = new Date(ideaCreatedAt);
  const release = new Date(firstReleaseAt);
  const days = Math.ceil((release.getTime() - idea.getTime()) / (1000 * 60 * 60 * 24));
  
  let score: number;
  if (days <= 30) score = 100;
  else if (days <= 60) score = 70;
  else if (days <= 90) score = 40;
  else score = 10;
  
  return { days, score };
}

// STEP 2 — Scope Discipline
export function calculateScopeScore(totalFeatures: number, trimmedFeatures: number): { percentage: number; score: number } {
  const percentage = totalFeatures > 0 ? (trimmedFeatures / totalFeatures) * 100 : 0;
  
  let score: number;
  if (percentage >= 20 && percentage <= 40) score = 100;
  else if ((percentage >= 10 && percentage < 20) || (percentage > 40 && percentage <= 60)) score = 70;
  else score = 30;
  
  return { percentage, score };
}

// STEP 3 — MVP Exit Gate
export function calculateMvpStatus(initiative: Initiative): { status: MvpStatus; criteriaMet: number } {
  let criteriaMet = 0;
  if (initiative.stability_verified) criteriaMet++;
  if (initiative.core_metric_threshold_met) criteriaMet++;
  if (initiative.validation_score >= 70) criteriaMet++;
  if (initiative.scalability_path_defined) criteriaMet++;
  
  return {
    status: criteriaMet === 4 ? 'Ready to Scale' : 'Remain in MVP',
    criteriaMet,
  };
}

// STEP 4 — Risk Detection
export function detectRisks(cycleDays: number, scopePercentage: number, validationScore: number): RiskType[] {
  const risks: RiskType[] = [];
  if (cycleDays > 90) risks.push('Delivery Risk');
  if (scopePercentage < 10) risks.push('Scope Creep Risk');
  if (validationScore < 50) risks.push('Weak Product Market Fit Risk');
  return risks;
}

// STEP 5 — Health Score
export function calculateHealthScore(cycleScore: number, scopeScore: number, validationScore: number): { score: number; status: HealthStatus } {
  const score = Math.round(0.3 * cycleScore + 0.3 * scopeScore + 0.4 * validationScore);
  
  let status: HealthStatus;
  if (score >= 80) status = 'Healthy MVP';
  else if (score >= 60) status = 'At Risk';
  else status = 'Governance Failure';
  
  return { score, status };
}

// STEP 6 — Trend Analysis
export function analyzeTrend(previousScores: number[]): TrendStatus {
  if (previousScores.length < 3) return 'No History';
  const last3 = previousScores.slice(-3);
  if (last3[0] > last3[1] && last3[1] > last3[2]) return 'Governance Declining';
  return 'Stable';
}

// Full evaluation
export function evaluateInitiative(initiative: Initiative, previousScores: number[] = []): Evaluation {
  const cycle = calculateCycleScore(initiative.idea_created_at, initiative.first_release_at);
  const scope = calculateScopeScore(initiative.total_features_initial, initiative.trimmed_features_count);
  const mvp = calculateMvpStatus(initiative);
  const risks = detectRisks(cycle.days, scope.percentage, initiative.validation_score);
  const health = calculateHealthScore(cycle.score, scope.score, initiative.validation_score);
  const trend = analyzeTrend(previousScores);
  
  return {
    id: crypto.randomUUID(),
    initiative_id: initiative.id,
    cycle_score: cycle.score,
    scope_score: scope.score,
    health_score: health.score,
    health_status: health.status,
    mvp_status: mvp.status,
    risks,
    trend_status: trend,
    created_at: new Date().toISOString(),
  };
}
