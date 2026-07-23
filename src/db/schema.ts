import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
};

export const households = sqliteTable("households", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ...timestamps,
});

export const purchaseNeeds = sqliteTable("purchase_needs", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull().references(() => households.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  usages: text("usages").notNull(),
  budgetMinor: integer("budget_minor").notNull(),
  currency: text("currency").notNull(),
  horizon: text("horizon").notNull(),
  location: text("location").notNull(),
  riskTolerance: text("risk_tolerance").notNull(),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const decisionBoards = sqliteTable("decision_boards", {
  id: text("id").primaryKey(),
  needId: text("need_id").notNull().references(() => purchaseNeeds.id),
  name: text("name").notNull(),
  version: text("version").notNull(),
  ...timestamps,
});

export const criteria = sqliteTable("criteria", {
  id: text("id").primaryKey(),
  boardId: text("board_id").notNull().references(() => decisionBoards.id),
  label: text("label").notNull(),
  definition: text("definition").notNull(),
  weight: integer("weight").notNull(),
  position: integer("position").notNull(),
  ...timestamps,
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  needId: text("need_id").notNull().references(() => purchaseNeeds.id),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  ...timestamps,
});

export const variants = sqliteTable("variants", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id),
  name: text("name").notNull(),
  configuration: text("configuration").notNull(),
  year: text("year"),
  ...timestamps,
});

export const offers = sqliteTable("offers", {
  id: text("id").primaryKey(),
  variantId: text("variant_id").notNull().references(() => variants.id),
  seller: text("seller").notNull(),
  channel: text("channel").notNull(),
  condition: text("condition").notNull(),
  configuration: text("configuration").notNull(),
  status: text("status").notNull(),
  trackingGoal: text("tracking_goal").notNull().default("achat"),
  categoryProfile: text("category_profile").notNull().default("cargo_longtail"),
  ...timestamps,
});

export const observations = sqliteTable("observations", {
  id: text("id").primaryKey(),
  offerId: text("offer_id").notNull().references(() => offers.id),
  priceMinor: integer("price_minor").notNull(),
  referencePriceMinor: integer("reference_price_minor"),
  currency: text("currency").notNull(),
  observedAt: text("observed_at").notNull(),
  availability: text("availability").notNull().default("inconnue"),
  revalidateBefore: text("revalidate_before").notNull(),
  deliveryMinor: integer("delivery_minor"),
  immutableHash: text("immutable_hash").notNull(),
  createdAt: text("created_at").notNull(),
});

export const evidence = sqliteTable("evidence", {
  id: text("id").primaryKey(),
  observationId: text("observation_id").notNull().references(() => observations.id),
  sourceUrl: text("source_url").notNull(),
  observedFact: text("observed_fact").notNull(),
  confidence: text("confidence").notNull(),
  confidenceReason: text("confidence_reason"),
  createdAt: text("created_at").notNull(),
});

export const evaluations = sqliteTable("evaluations", {
  id: text("id").primaryKey(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  kind: text("kind").notNull(),
  version: text("version").notNull(),
  inputsJson: text("inputs_json").notNull(),
  weightsJson: text("weights_json").notNull(),
  formula: text("formula").notNull(),
  result: integer("result"),
  missingJson: text("missing_json").notNull(),
  createdAt: text("created_at").notNull(),
});

export const recommendations = sqliteTable("recommendations", {
  id: text("id").primaryKey(),
  needId: text("need_id").notNull().references(() => purchaseNeeds.id),
  offerId: text("offer_id").notNull().references(() => offers.id),
  evaluationId: text("evaluation_id").references(() => evaluations.id),
  state: text("state").notNull(),
  version: text("version").notNull(),
  rule: text("rule").notNull(),
  reasonsJson: text("reasons_json").notNull(),
  risksJson: text("risks_json").notNull(),
  missingJson: text("missing_json").notNull(),
  nextAction: text("next_action").notNull(),
  createdAt: text("created_at").notNull(),
});

export const boardScores = sqliteTable("board_scores", {
  id: text("id").primaryKey(),
  boardId: text("board_id").notNull().references(() => decisionBoards.id),
  variantId: text("variant_id").notNull().references(() => variants.id),
  criterionId: text("criterion_id").notNull().references(() => criteria.id),
  score: integer("score").notNull(),
  evidenceNote: text("evidence_note"),
  ...timestamps,
}, (table) => [
  uniqueIndex("board_variant_criterion").on(table.boardId, table.variantId, table.criterionId),
]);
