import type {
  IndexDimension,
  RecommendationInput,
  RecommendationResult,
} from "./types";

export const BOARD_VERSION = "board_v1" as const;
export const INDEX_VERSION = "purchase_index_v1" as const;
export const RECOMMENDATION_VERSION = "recommendation_v1" as const;

export const INDEX_WEIGHTS: Record<IndexDimension, number> = {
  offerPrice: 25,
  familyFit: 20,
  serviceability: 15,
  tco: 15,
  accessories: 10,
  resale: 10,
  availability: 5,
};

export function calculateBoardScore(
  criteria: Array<{ weight: number; score: number }>,
): number {
  const total = criteria.reduce((sum, item) => sum + item.weight, 0);
  if (total !== 100) throw new Error("Les poids du board doivent totaliser 100.");
  if (criteria.some(({ score }) => score < 0 || score > 10)) {
    throw new Error("Chaque note doit être comprise entre 0 et 10.");
  }
  return Math.round(
    criteria.reduce((sum, item) => sum + item.weight * item.score, 0) / 10,
  );
}

export function calculatePurchaseIndex(
  scores: Partial<Record<IndexDimension, number>>,
): number | null {
  const dimensions = Object.keys(INDEX_WEIGHTS) as IndexDimension[];
  if (dimensions.some((dimension) => scores[dimension] == null)) return null;
  if (dimensions.some((dimension) => scores[dimension]! < 0 || scores[dimension]! > 10)) {
    throw new Error("Chaque dimension doit être comprise entre 0 et 10.");
  }
  return Math.round(
    dimensions.reduce(
      (sum, dimension) => sum + scores[dimension]! * INDEX_WEIGHTS[dimension],
      0,
    ) / 10,
  );
}

export type ComparableObservation = {
  variantId: string;
  channel: string;
  condition: string;
  configuration: string;
  currency: string;
  priceMinor: number;
  referencePriceMinor?: number | null;
};

export function areComparable(a: ComparableObservation, b: ComparableObservation): boolean {
  return (
    a.variantId === b.variantId &&
    a.channel === b.channel &&
    a.condition === b.condition &&
    a.configuration.trim().toLowerCase() === b.configuration.trim().toLowerCase() &&
    a.currency === b.currency
  );
}

export function classifyPriceSignal(
  current: ComparableObservation,
  previous?: ComparableObservation,
): "price_drop" | "baseline_promotion" | null {
  if (previous && areComparable(current, previous) && current.priceMinor < previous.priceMinor) {
    return "price_drop";
  }
  if (!previous && current.referencePriceMinor && current.priceMinor < current.referencePriceMinor) {
    return "baseline_promotion";
  }
  return null;
}

export function recommend(input: RecommendationInput): RecommendationResult {
  if (input.evidenceExpired || input.blockingFields.length > 0 || input.purchaseIndex == null) {
    const missing = [
      ...input.blockingFields,
      ...(input.evidenceExpired ? ["preuve à revalider"] : []),
    ];
    return {
      state: "verifier",
      rule: "blocking_data",
      reasons: ["La décision n’est pas suffisamment documentée."],
      risks: input.evidenceExpired ? ["La preuve disponible a expiré."] : [],
      missing,
      nextAction: `Compléter ou confirmer : ${missing.join(", ")}.`,
      version: RECOMMENDATION_VERSION,
    };
  }
  if (input.confidence !== "elevee" && input.actionableSignals.length > 0) {
    return {
      state: "verifier",
      rule: "attractive_low_confidence",
      reasons: ["L’offre est attractive mais sa confiance doit être renforcée."],
      risks: ["La source ou les conditions ne sont pas confirmées avec une confiance élevée."],
      missing: [],
      nextAction: "Revalider l’offre et ses conditions auprès du vendeur.",
      version: RECOMMENDATION_VERSION,
    };
  }
  if (
    input.withinBudget &&
    (input.purchaseIndex >= 90 || input.actionableSignals.some((signal) =>
      ["price_drop", "availability"].includes(signal),
    ))
  ) {
    return {
      state: "agir",
      rule: input.purchaseIndex >= 90 ? "index_at_least_90" : "verified_signal",
      reasons: ["L’offre respecte le budget et présente un signal actionnable."],
      risks: [],
      missing: [],
      nextAction: "Vérifier une dernière fois le panier puis décider de l’achat.",
      version: RECOMMENDATION_VERSION,
    };
  }
  return {
    state: "attendre",
    rule: input.withinBudget ? "no_actionable_change" : "over_budget",
    reasons: [
      input.withinBudget
        ? "Aucun changement comparable ne justifie une action immédiate."
        : "L’offre dépasse le budget défini.",
    ],
    risks: [],
    missing: [],
    nextAction: "Ajouter une nouvelle observation comparable ultérieurement.",
    version: RECOMMENDATION_VERSION,
  };
}
