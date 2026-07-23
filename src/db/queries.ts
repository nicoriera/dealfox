import { desc, eq } from "drizzle-orm";
import { db, ensureDatabase, schema } from "./index";

export async function getDashboard() {
  await ensureDatabase();
  const needs = await db.select().from(schema.purchaseNeeds).orderBy(desc(schema.purchaseNeeds.createdAt));
  const products = await db.select().from(schema.products);
  const variants = await db.select().from(schema.variants);
  const offers = await db.select().from(schema.offers);
  const observations = await db.select().from(schema.observations).orderBy(desc(schema.observations.observedAt));
  const proofs = await db.select().from(schema.evidence);
  const boards = await db.select().from(schema.decisionBoards);
  const boardCriteria = await db.select().from(schema.criteria).orderBy(schema.criteria.position);
  const scores = await db.select().from(schema.boardScores);
  const evaluations = await db.select().from(schema.evaluations).orderBy(desc(schema.evaluations.createdAt));
  const recommendations = await db.select().from(schema.recommendations).orderBy(desc(schema.recommendations.createdAt));
  return { needs, products, variants, offers, observations, proofs, boards, criteria: boardCriteria, scores, evaluations, recommendations };
}

export async function variantsForNeed(needId: string) {
  await ensureDatabase();
  const products = await db.select().from(schema.products).where(eq(schema.products.needId, needId));
  const all = await db.select().from(schema.variants);
  return all.filter((variant) => products.some((product) => product.id === variant.productId));
}
