import { describe, expect, it } from "vitest";
import {
  areComparable,
  calculateBoardScore,
  calculatePurchaseIndex,
  classifyPriceSignal,
  recommend,
} from "./decision";

const observation = {
  variantId: "r500e",
  channel: "revendeur",
  condition: "neuf",
  configuration: "famille",
  currency: "EUR",
  priceMinor: 199999,
};

describe("board_v1", () => {
  it("calcule et arrondit le score pondéré", () => {
    expect(calculateBoardScore([{ weight: 50, score: 8 }, { weight: 50, score: 9 }])).toBe(85);
  });
  it("refuse un total différent de 100", () => {
    expect(() => calculateBoardScore([{ weight: 90, score: 8 }])).toThrow(/100/);
  });
});

describe("purchase_index_v1", () => {
  it("calcule les sept dimensions", () => {
    expect(calculatePurchaseIndex({
      offerPrice: 10, familyFit: 9, serviceability: 8, tco: 8,
      accessories: 7, resale: 6, availability: 10,
    })).toBe(85);
  });
  it("reste indisponible avec une dimension inconnue", () => {
    expect(calculatePurchaseIndex({ offerPrice: 10 })).toBeNull();
  });
});

describe("historique", () => {
  it("exige des observations comparables", () => {
    expect(areComparable(observation, { ...observation, currency: "USD" })).toBe(false);
  });
  it("distingue baseline promotion et baisse comparable", () => {
    expect(classifyPriceSignal({ ...observation, referencePriceMinor: 249999 })).toBe("baseline_promotion");
    expect(classifyPriceSignal({ ...observation, priceMinor: 189999 }, observation)).toBe("price_drop");
  });
});

describe("recommendation_v1", () => {
  const base = {
    purchaseIndex: 80,
    blockingFields: [],
    evidenceExpired: false,
    confidence: "elevee" as const,
    withinBudget: true,
    actionableSignals: [] as ("purchase_index" | "price_drop" | "baseline_promotion" | "availability")[],
  };
  it("agit à partir de 90", () => expect(recommend({ ...base, purchaseIndex: 90 }).state).toBe("agir"));
  it("vérifie malgré 90 lorsqu’un blocage subsiste", () =>
    expect(recommend({ ...base, purchaseIndex: 95, blockingFields: ["SAV"] }).state).toBe("verifier"));
  it("vérifie une preuve expirée", () =>
    expect(recommend({ ...base, evidenceExpired: true }).state).toBe("verifier"));
  it("attend sans signal", () => expect(recommend(base).state).toBe("attendre"));
});
