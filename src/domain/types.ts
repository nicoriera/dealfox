export const CHANNELS = ["constructeur", "revendeur", "reconditionneur", "particulier"] as const;
export const CONDITIONS = ["neuf", "reconditionne_constructeur", "reconditionne_tiers", "occasion"] as const;
export const CONFIDENCES = ["elevee", "moyenne", "faible"] as const;
export const OFFER_STATUSES = ["brouillon", "prouvee", "a_completer", "expiree"] as const;
export const AVAILABILITIES = ["confirmee", "non_confirmee", "inconnue"] as const;
export const RECOMMENDATION_STATES = ["agir", "verifier", "attendre"] as const;
export const SIGNAL_TYPES = ["purchase_index", "price_drop", "baseline_promotion", "availability"] as const;
export const TRACKING_GOALS = ["achat", "benchmark", "possession"] as const;

export type UnknownValue<T> =
  | { status: "known"; value: T; evidence?: string }
  | { status: "unknown"; reason?: string };

export type ValidationIssue = { field: string; code: string; message: string };

export type IndexDimension =
  | "offerPrice"
  | "familyFit"
  | "serviceability"
  | "tco"
  | "accessories"
  | "resale"
  | "availability";

export type RecommendationInput = {
  purchaseIndex: number | null;
  blockingFields: string[];
  evidenceExpired: boolean;
  confidence: (typeof CONFIDENCES)[number];
  withinBudget: boolean;
  actionableSignals: (typeof SIGNAL_TYPES)[number][];
};

export type RecommendationResult = {
  state: (typeof RECOMMENDATION_STATES)[number];
  rule: string;
  reasons: string[];
  risks: string[];
  missing: string[];
  nextAction: string;
  version: "recommendation_v1";
};
