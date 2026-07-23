"use server";

import { randomUUID, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db, ensureDatabase, schema } from "@/db";

const offers = [
  ["BTWIN", "R500E", "Decathlon", "revendeur", "neuf", 199999, 249999, "https://www.decathlon.fr/p/velocargo-electrique-longtail-chargement-arriere-r500e/_/R-p-349924", "elevee"],
  ["Fiido", "T2", "Fiido France", "constructeur", "neuf", 139900, 149900, "https://fr.fiido.com/products/fiido-t2-longtail-cargo-ebike-for-versatile-all-terrain", "moyenne"],
  ["Moma", "E-LONGTAIL", "Moma", "reconditionneur", "reconditionne_constructeur", 199999, 400000, "https://momabikes.com/products/sv-bicicleta-electrica-e-longtail", "moyenne"],
  ["Moma", "E-LONGTAIL neuf", "Moma France", "constructeur", "neuf", 229999, 400000, "https://momabikes.fr/products/velo-electrique-ebike-longtail", "moyenne"],
  ["BTWIN", "E-Three 500", "Decathlon", "revendeur", "neuf", 249999, null, "https://www.decathlon.fr/p/_/R-p-356181", "moyenne"],
] as const;

export async function importDemo() {
  await ensureDatabase();
  const existing = await db.select().from(schema.purchaseNeeds);
  if (existing.some((need) => need.title === "Vélo cargo familial à Anglet")) return;
  const timestamp = new Date().toISOString();
  const needId = randomUUID();
  await db.insert(schema.purchaseNeeds).values({
    id: needId, householdId: "household-default", title: "Vélo cargo familial à Anglet",
    category: "cargo_longtail", usages: "École, courses, plage, loisirs",
    budgetMinor: 250000, currency: "EUR", horizon: "Cette année", location: "Anglet, France",
    riskTolerance: "faible", status: "active", createdAt: timestamp, updatedAt: timestamp,
  });
  const boardId = randomUUID();
  await db.insert(schema.decisionBoards).values({ id: boardId, needId, name: "Comparatif cargo", version: "board_v1", createdAt: timestamp, updatedAt: timestamp });
  const criterionRows = [
    ["Prix d’achat", "Prix au regard du budget.", 15], ["Équipement d’origine", "Équipement réellement livré.", 10],
    ["Support constructeur", "Qualité du support.", 10], ["Atelier local", "Confiance locale.", 10],
    ["Entretien", "Facilité d’entretien.", 10], ["Pièces", "Disponibilité des pièces.", 10],
    ["Deux enfants", "Compatibilité famille.", 15], ["Évolutivité", "Usage dans le temps.", 10],
    ["Revente", "Valeur résiduelle.", 5], ["Preuves", "Confiance des sources.", 5],
  ] as const;
  await db.insert(schema.criteria).values(criterionRows.map(([label, definition, weight], position) => ({
    id: randomUUID(), boardId, label, definition, weight, position, createdAt: timestamp, updatedAt: timestamp,
  })));
  for (const [brand, model, seller, channel, condition, priceMinor, referencePriceMinor, sourceUrl, confidence] of offers) {
    const productId = randomUUID(), variantId = randomUUID(), offerId = randomUUID(), observationId = randomUUID();
    await db.insert(schema.products).values({ id: productId, needId, brand, model, createdAt: timestamp, updatedAt: timestamp });
    await db.insert(schema.variants).values({ id: variantId, productId, name: model, configuration: "Configuration famille à confirmer", year: "2026", createdAt: timestamp, updatedAt: timestamp });
    await db.insert(schema.offers).values({ id: offerId, variantId, seller, channel, condition, configuration: "Configuration famille à confirmer", status: "expiree", trackingGoal: "achat", categoryProfile: "cargo_longtail", createdAt: timestamp, updatedAt: timestamp });
    await db.insert(schema.observations).values({
      id: observationId, offerId, priceMinor, referencePriceMinor, currency: "EUR",
      observedAt: "2026-07-17", availability: "inconnue", revalidateBefore: "2026-07-20",
      immutableHash: createHash("sha256").update(`${offerId}:2026-07-17:${priceMinor}`).digest("hex"), createdAt: timestamp,
    });
    await db.insert(schema.evidence).values({
      id: randomUUID(), observationId, sourceUrl, observedFact: `Prix observé : ${(priceMinor / 100).toLocaleString("fr-FR")} €`,
      confidence, confidenceReason: confidence === "elevee" ? null : "Conditions à revalider au panier.", createdAt: timestamp,
    });
  }
  revalidatePath("/");
}
