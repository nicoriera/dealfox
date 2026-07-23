import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:data/dealfox.db";
const client = createClient({ url });

let initialized = false;

export async function ensureDatabase() {
  if (initialized) return;
  await client.executeMultiple(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS households (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS purchase_needs (id TEXT PRIMARY KEY, household_id TEXT NOT NULL REFERENCES households(id), title TEXT NOT NULL, category TEXT NOT NULL, usages TEXT NOT NULL, budget_minor INTEGER NOT NULL, currency TEXT NOT NULL, horizon TEXT NOT NULL, location TEXT NOT NULL, risk_tolerance TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS decision_boards (id TEXT PRIMARY KEY, need_id TEXT NOT NULL REFERENCES purchase_needs(id), name TEXT NOT NULL, version TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS criteria (id TEXT PRIMARY KEY, board_id TEXT NOT NULL REFERENCES decision_boards(id), label TEXT NOT NULL, definition TEXT NOT NULL, weight INTEGER NOT NULL, position INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, need_id TEXT NOT NULL REFERENCES purchase_needs(id), brand TEXT NOT NULL, model TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS variants (id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id), name TEXT NOT NULL, configuration TEXT NOT NULL, year TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS offers (id TEXT PRIMARY KEY, variant_id TEXT NOT NULL REFERENCES variants(id), seller TEXT NOT NULL, channel TEXT NOT NULL, condition TEXT NOT NULL, configuration TEXT NOT NULL, status TEXT NOT NULL, tracking_goal TEXT NOT NULL DEFAULT 'achat', category_profile TEXT NOT NULL DEFAULT 'cargo_longtail', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS observations (id TEXT PRIMARY KEY, offer_id TEXT NOT NULL REFERENCES offers(id), price_minor INTEGER NOT NULL, reference_price_minor INTEGER, currency TEXT NOT NULL, observed_at TEXT NOT NULL, availability TEXT NOT NULL DEFAULT 'inconnue', revalidate_before TEXT NOT NULL, delivery_minor INTEGER, immutable_hash TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS evidence (id TEXT PRIMARY KEY, observation_id TEXT NOT NULL REFERENCES observations(id), source_url TEXT NOT NULL, observed_fact TEXT NOT NULL, confidence TEXT NOT NULL, confidence_reason TEXT, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS evaluations (id TEXT PRIMARY KEY, target_type TEXT NOT NULL, target_id TEXT NOT NULL, kind TEXT NOT NULL, version TEXT NOT NULL, inputs_json TEXT NOT NULL, weights_json TEXT NOT NULL, formula TEXT NOT NULL, result INTEGER, missing_json TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS recommendations (id TEXT PRIMARY KEY, need_id TEXT NOT NULL REFERENCES purchase_needs(id), offer_id TEXT NOT NULL REFERENCES offers(id), evaluation_id TEXT REFERENCES evaluations(id), state TEXT NOT NULL, version TEXT NOT NULL, rule TEXT NOT NULL, reasons_json TEXT NOT NULL, risks_json TEXT NOT NULL, missing_json TEXT NOT NULL, next_action TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS board_scores (id TEXT PRIMARY KEY, board_id TEXT NOT NULL REFERENCES decision_boards(id), variant_id TEXT NOT NULL REFERENCES variants(id), criterion_id TEXT NOT NULL REFERENCES criteria(id), score INTEGER NOT NULL, evidence_note TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE UNIQUE INDEX IF NOT EXISTS board_variant_criterion ON board_scores(board_id, variant_id, criterion_id);
  `);
  const now = new Date().toISOString();
  await client.execute({
    sql: "INSERT OR IGNORE INTO households (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
    args: ["household-default", "Mon foyer", now, now],
  });
  initialized = true;
}

export const db = drizzle(client, { schema });
export { schema };
