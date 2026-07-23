"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db, ensureDatabase, schema } from "@/db";
import { needSchema, offerSchema, issuesFromZod } from "@/domain/validation";
import { INDEX_WEIGHTS, recommend } from "@/domain/decision";
import { calculatePurchaseIndex, classifyPriceSignal } from "@/domain/decision";
import type { ValidationIssue } from "@/domain/types";

export type ActionState = { ok: boolean; message?: string; issues?: ValidationIssue[] };

const now = () => new Date().toISOString();
const text = (form: FormData, key: string) => String(form.get(key) ?? "");

export async function createNeed(_: ActionState, form: FormData): Promise<ActionState> {
  const result = needSchema.safeParse({
    title: text(form, "title"), category: text(form, "category"), usages: text(form, "usages"),
    budgetMinor: Math.round(Number(text(form, "budget")) * 100),
    currency: text(form, "currency"), horizon: text(form, "horizon"),
    location: text(form, "location"), riskTolerance: text(form, "riskTolerance"),
  });
  if (!result.success) return { ok: false, issues: issuesFromZod(result.error) };
  await ensureDatabase();
  const timestamp = now();
  const needId = randomUUID();
  const boardId = randomUUID();
  await db.insert(schema.purchaseNeeds).values({
    id: needId, householdId: "household-default", ...result.data, createdAt: timestamp, updatedAt: timestamp,
  });
  await db.insert(schema.decisionBoards).values({
    id: boardId, needId, name: "Board principal", version: "board_v1", createdAt: timestamp, updatedAt: timestamp,
  });
  const defaults = [
    ["Prix d’achat", "Coût immédiat au regard du budget.", 25],
    ["Adéquation au besoin", "Compatibilité avec les usages du foyer.", 25],
    ["SAV et réparabilité", "Confiance dans le support et les ateliers.", 20],
    ["Coût total", "Coût de possession documenté.", 15],
    ["Équipement", "Accessoires réellement inclus.", 10],
    ["Confiance des preuves", "Fraîcheur et qualité des sources.", 5],
  ] as const;
  await db.insert(schema.criteria).values(defaults.map(([label, definition, weight], position) => ({
    id: randomUUID(), boardId, label, definition, weight, position, createdAt: timestamp, updatedAt: timestamp,
  })));
  revalidatePath("/");
  return { ok: true, message: "Décision créée avec un board totalisant 100." };
}

export async function createProduct(_: ActionState, form: FormData): Promise<ActionState> {
  const needId = text(form, "needId");
  const brand = text(form, "brand").trim();
  const model = text(form, "model").trim();
  const variantName = text(form, "variantName").trim();
  const configuration = text(form, "configuration").trim();
  if (![needId, brand, model, variantName, configuration].every(Boolean)) {
    return { ok: false, issues: [{ field: "product", code: "required", message: "Tous les champs produit et variante sont obligatoires." }] };
  }
  await ensureDatabase();
  const timestamp = now();
  const productId = randomUUID();
  await db.insert(schema.products).values({ id: productId, needId, brand, model, createdAt: timestamp, updatedAt: timestamp });
  await db.insert(schema.variants).values({ id: randomUUID(), productId, name: variantName, configuration, year: text(form, "year") || null, createdAt: timestamp, updatedAt: timestamp });
  revalidatePath("/");
  return { ok: true, message: "Produit et variante ajoutés." };
}

export async function saveOffer(_: ActionState, form: FormData): Promise<ActionState> {
  const draft = text(form, "intent") === "draft";
  const raw = {
    variantId: text(form, "variantId"), seller: text(form, "seller"), channel: text(form, "channel"),
    condition: text(form, "condition"), configuration: text(form, "configuration"),
    priceMinor: Math.round(Number(text(form, "price")) * 100), currency: text(form, "currency"),
    sourceUrl: text(form, "sourceUrl"), observedAt: text(form, "observedAt"),
    observedFact: text(form, "observedFact"), confidence: text(form, "confidence"),
    confidenceReason: text(form, "confidenceReason"), revalidateBefore: text(form, "revalidateBefore"),
  };
  if (draft) {
    if (!raw.variantId || !raw.seller) return { ok: false, issues: [{ field: "seller", code: "required", message: "Une variante et un vendeur suffisent pour enregistrer le brouillon." }] };
  }
  const result = offerSchema.safeParse(raw);
  if (!draft && !result.success) return { ok: false, issues: issuesFromZod(result.error) };
  await ensureDatabase();
  const timestamp = now();
  const offerId = randomUUID();
  const valid = result.success ? result.data : null;
  await db.insert(schema.offers).values({
    id: offerId, variantId: raw.variantId, seller: raw.seller,
    channel: raw.channel || "revendeur", condition: raw.condition || "neuf",
    configuration: raw.configuration || "à compléter", status: valid ? "prouvee" : "brouillon",
    trackingGoal: "achat", categoryProfile: "cargo_longtail", createdAt: timestamp, updatedAt: timestamp,
  });
  if (valid) {
    const observationId = randomUUID();
    const hash = createHash("sha256").update(JSON.stringify(valid)).digest("hex");
    await db.insert(schema.observations).values({
      id: observationId, offerId, priceMinor: valid.priceMinor, currency: valid.currency,
      observedAt: valid.observedAt, availability: "inconnue", revalidateBefore: valid.revalidateBefore,
      immutableHash: hash, createdAt: timestamp,
    });
    await db.insert(schema.evidence).values({
      id: randomUUID(), observationId, sourceUrl: valid.sourceUrl, observedFact: valid.observedFact,
      confidence: valid.confidence, confidenceReason: valid.confidenceReason || null, createdAt: timestamp,
    });
    const blocking = ["disponibilité locale", "compatibilité famille", "SAV/réparabilité", "TCO", "accessoires", "revente"];
    const evaluationId = randomUUID();
    await db.insert(schema.evaluations).values({
      id: evaluationId, targetType: "offer", targetId: offerId, kind: "purchase_index",
      version: "purchase_index_v1", inputsJson: "{}", weightsJson: JSON.stringify(INDEX_WEIGHTS),
      formula: "Σ(note × poids) / 10", result: null, missingJson: JSON.stringify(blocking), createdAt: timestamp,
    });
    const recommendation = recommend({
      purchaseIndex: null, blockingFields: blocking,
      evidenceExpired: valid.revalidateBefore < new Date().toISOString().slice(0, 10),
      confidence: valid.confidence, withinBudget: true, actionableSignals: [],
    });
    const variantRows = await db.select().from(schema.variants);
    const variant = variantRows.find((row) => row.id === raw.variantId);
    const productRows = await db.select().from(schema.products);
    const product = productRows.find((row) => row.id === variant?.productId);
    await db.insert(schema.recommendations).values({
      id: randomUUID(), needId: product!.needId, offerId, evaluationId,
      state: recommendation.state, version: recommendation.version, rule: recommendation.rule,
      reasonsJson: JSON.stringify(recommendation.reasons), risksJson: JSON.stringify(recommendation.risks),
      missingJson: JSON.stringify(recommendation.missing), nextAction: recommendation.nextAction, createdAt: timestamp,
    });
  }
  revalidatePath("/");
  return { ok: true, message: valid ? "Offre prouvée et observation ajoutée." : "Brouillon enregistré." };
}

export async function evaluateOffer(_: ActionState, form: FormData): Promise<ActionState> {
  await ensureDatabase();
  const offerId = text(form, "offerId");
  const dimensions = Object.keys(INDEX_WEIGHTS) as Array<keyof typeof INDEX_WEIGHTS>;
  const scores = Object.fromEntries(dimensions.map((dimension) => [dimension, Number(text(form, dimension))]));
  if (dimensions.some((dimension) => !Number.isFinite(scores[dimension]) || scores[dimension] < 0 || scores[dimension] > 10)) {
    return { ok: false, issues: [{ field: "scores", code: "range", message: "Chaque note doit être comprise entre 0 et 10." }] };
  }
  const purchaseIndex = calculatePurchaseIndex(scores);
  const timestamp = now();
  const offerRows = await db.select().from(schema.offers);
  const offer = offerRows.find((row) => row.id === offerId);
  if (!offer) return { ok: false, issues: [{ field: "offerId", code: "not_found", message: "Offre introuvable." }] };
  const allObservations = await db.select().from(schema.observations);
  const offerObservations = allObservations.filter((item) => item.offerId === offerId).sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  const latest = offerObservations[0];
  if (!latest) return { ok: false, issues: [{ field: "observation", code: "required", message: "Une observation prouvée est requise." }] };
  const allEvidence = await db.select().from(schema.evidence);
  const proof = allEvidence.find((item) => item.observationId === latest.id);
  const variants = await db.select().from(schema.variants);
  const variant = variants.find((item) => item.id === offer.variantId)!;
  const products = await db.select().from(schema.products);
  const product = products.find((item) => item.id === variant.productId)!;
  const needs = await db.select().from(schema.purchaseNeeds);
  const need = needs.find((item) => item.id === product.needId)!;
  const previous = offerObservations[1];
  const signal = classifyPriceSignal({
    variantId: offer.variantId, channel: offer.channel, condition: offer.condition,
    configuration: offer.configuration, currency: latest.currency, priceMinor: latest.priceMinor,
    referencePriceMinor: latest.referencePriceMinor,
  }, previous ? {
    variantId: offer.variantId, channel: offer.channel, condition: offer.condition,
    configuration: offer.configuration, currency: previous.currency, priceMinor: previous.priceMinor,
    referencePriceMinor: previous.referencePriceMinor,
  } : undefined);
  const actionableSignals = signal === "price_drop" ? [signal] : ["purchase_index" as const];
  const result = recommend({
    purchaseIndex, blockingFields: [], evidenceExpired: latest.revalidateBefore < timestamp.slice(0, 10),
    confidence: (proof?.confidence ?? "faible") as "elevee" | "moyenne" | "faible",
    withinBudget: latest.priceMinor <= need.budgetMinor, actionableSignals,
  });
  const evaluationId = randomUUID();
  await db.insert(schema.evaluations).values({
    id: evaluationId, targetType: "offer", targetId: offerId, kind: "purchase_index",
    version: "purchase_index_v1", inputsJson: JSON.stringify(scores), weightsJson: JSON.stringify(INDEX_WEIGHTS),
    formula: "Σ(note × poids) / 10", result: purchaseIndex, missingJson: "[]", createdAt: timestamp,
  });
  await db.insert(schema.recommendations).values({
    id: randomUUID(), needId: need.id, offerId, evaluationId, state: result.state, version: result.version,
    rule: result.rule, reasonsJson: JSON.stringify(result.reasons), risksJson: JSON.stringify(result.risks),
    missingJson: JSON.stringify(result.missing), nextAction: result.nextAction, createdAt: timestamp,
  });
  revalidatePath("/");
  return { ok: true, message: `Indice ${purchaseIndex}/100 — recommandation : ${result.state}.` };
}
