import { create } from 'zustand';
import { Initiative, Feature, Evaluation, evaluateInitiative, ValidationMetrics, calculateValidationScore } from '@/lib/governance';

// Seed data
const SEED_INITIATIVES: Initiative[] = [
  {
    id: '1', name: 'PayFlow Checkout', description: 'One-click checkout experience for mobile commerce',
    idea_created_at: '2026-01-10', first_release_at: '2026-02-05',
    total_features_initial: 20, trimmed_features_count: 6,
    validation_metrics: { beta_users: 45, weekly_active_users: 85, user_retention_rate: 78, positive_feedback_percentage: 88 },
    validation_score: 82,
    stability_verified: true, core_metric_threshold_met: true, scalability_path_defined: true,
    created_by: '1', created_at: '2026-01-10',
  },
  {
    id: '2', name: 'InsightHub Analytics', description: 'Real-time product analytics dashboard for SaaS teams',
    idea_created_at: '2025-11-01', first_release_at: '2026-02-15',
    total_features_initial: 35, trimmed_features_count: 5,
    validation_metrics: { beta_users: 12, weekly_active_users: 20, user_retention_rate: 35, positive_feedback_percentage: 55 },
    validation_score: 45,
    stability_verified: false, core_metric_threshold_met: false, scalability_path_defined: false,
    created_by: '1', created_at: '2025-11-01',
  },
  {
    id: '3', name: 'TaskForge PM', description: 'Lightweight project management tool for agile teams',
    idea_created_at: '2026-01-20', first_release_at: '2026-03-01',
    total_features_initial: 15, trimmed_features_count: 4,
    validation_metrics: { beta_users: 30, weekly_active_users: 55, user_retention_rate: 62, positive_feedback_percentage: 72 },
    validation_score: 68,
    stability_verified: true, core_metric_threshold_met: true, scalability_path_defined: false,
    created_by: '2', created_at: '2026-01-20',
  },
  {
    id: '4', name: 'CloudSync Storage', description: 'Distributed file storage with edge caching',
    idea_created_at: '2025-10-15', first_release_at: '2026-03-05',
    total_features_initial: 28, trimmed_features_count: 3,
    validation_metrics: { beta_users: 20, weekly_active_users: 40, user_retention_rate: 50, positive_feedback_percentage: 60 },
    validation_score: 55,
    stability_verified: false, core_metric_threshold_met: true, scalability_path_defined: true,
    created_by: '1', created_at: '2025-10-15',
  },
  {
    id: '5', name: 'DevBot Assistant', description: 'AI-powered code review and pair programming tool',
    idea_created_at: '2026-02-01', first_release_at: '2026-02-28',
    total_features_initial: 12, trimmed_features_count: 3,
    validation_metrics: { beta_users: 50, weekly_active_users: 95, user_retention_rate: 85, positive_feedback_percentage: 92 },
    validation_score: 90,
    stability_verified: true, core_metric_threshold_met: true, scalability_path_defined: true,
    created_by: '2', created_at: '2026-02-01',
  },
];

const SEED_FEATURES: Feature[] = [
  { id: 'f1', initiative_id: '1', feature_name: 'One-click purchase', category: 'must_have' },
  { id: 'f2', initiative_id: '1', feature_name: 'Cart persistence', category: 'must_have' },
  { id: 'f3', initiative_id: '1', feature_name: 'Apple Pay integration', category: 'should_have' },
  { id: 'f4', initiative_id: '1', feature_name: 'Gift wrapping option', category: 'could_have' },
  { id: 'f5', initiative_id: '1', feature_name: 'Social sharing', category: 'wont_have' },
  { id: 'f6', initiative_id: '2', feature_name: 'Real-time event stream', category: 'must_have' },
  { id: 'f7', initiative_id: '2', feature_name: 'Custom dashboards', category: 'should_have' },
  { id: 'f8', initiative_id: '2', feature_name: 'AI anomaly detection', category: 'could_have' },
  { id: 'f9', initiative_id: '2', feature_name: 'White-label branding', category: 'wont_have' },
  { id: 'f10', initiative_id: '3', feature_name: 'Kanban board', category: 'must_have' },
  { id: 'f11', initiative_id: '3', feature_name: 'Sprint planning', category: 'must_have' },
  { id: 'f12', initiative_id: '3', feature_name: 'Time tracking', category: 'should_have' },
  { id: 'f13', initiative_id: '3', feature_name: 'Resource allocation', category: 'could_have' },
  { id: 'f14', initiative_id: '5', feature_name: 'Code review AI', category: 'must_have' },
  { id: 'f15', initiative_id: '5', feature_name: 'PR summaries', category: 'must_have' },
  { id: 'f16', initiative_id: '5', feature_name: 'IDE plugin', category: 'should_have' },
];

interface InitiativeState {
  initiatives: Initiative[];
  features: Feature[];
  evaluations: Evaluation[];
  addInitiative: (init: Omit<Initiative, 'id' | 'created_at'>) => string;
  updateInitiative: (id: string, data: Partial<Initiative>) => void;
  deleteInitiative: (id: string) => void;
  addFeature: (feature: Omit<Feature, 'id'>) => void;
  deleteFeature: (id: string) => void;
  evaluateInitiative: (id: string) => Evaluation | null;
  getInitiativeFeatures: (id: string) => Feature[];
  getInitiativeEvaluations: (id: string) => Evaluation[];
}

export const useInitiativeStore = create<InitiativeState>((set, get) => {
  // Pre-compute evaluations for seed data
  const seedEvaluations = SEED_INITIATIVES.map(init => evaluateInitiative(init));

  return {
    initiatives: SEED_INITIATIVES,
    features: SEED_FEATURES,
    evaluations: seedEvaluations,
    addInitiative: (data) => {
      const id = crypto.randomUUID();
      const init: Initiative = { ...data, id, created_at: new Date().toISOString() };
      set(s => ({ initiatives: [...s.initiatives, init] }));
      return id;
    },
    updateInitiative: (id, data) => {
      set(s => ({
        initiatives: s.initiatives.map(i => i.id === id ? { ...i, ...data } : i),
      }));
    },
    deleteInitiative: (id) => {
      set(s => ({
        initiatives: s.initiatives.filter(i => i.id !== id),
        features: s.features.filter(f => f.initiative_id !== id),
        evaluations: s.evaluations.filter(e => e.initiative_id !== id),
      }));
    },
    addFeature: (data) => {
      set(s => ({ features: [...s.features, { ...data, id: crypto.randomUUID() }] }));
    },
    deleteFeature: (id) => {
      set(s => ({ features: s.features.filter(f => f.id !== id) }));
    },
    evaluateInitiative: (id) => {
      const init = get().initiatives.find(i => i.id === id);
      if (!init) return null;
      const prevScores = get().evaluations
        .filter(e => e.initiative_id === id)
        .map(e => e.health_score);
      const eval_ = evaluateInitiative(init, prevScores);
      set(s => ({ evaluations: [...s.evaluations, eval_] }));
      return eval_;
    },
    getInitiativeFeatures: (id) => get().features.filter(f => f.initiative_id === id),
    getInitiativeEvaluations: (id) => get().evaluations.filter(e => e.initiative_id === id),
  };
});
