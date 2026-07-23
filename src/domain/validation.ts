import { z } from "zod";
import { CHANNELS, CONDITIONS, CONFIDENCES } from "./types";

const requiredText = (label: string) => z.string().trim().min(1, `${label} est obligatoire.`);

export const needSchema = z.object({
  title: requiredText("Le titre"),
  category: requiredText("La catégorie"),
  usages: requiredText("Les usages"),
  budgetMinor: z.coerce.number().int().positive("Le budget doit être positif."),
  currency: z.string().length(3).transform((value) => value.toUpperCase()),
  horizon: requiredText("L’horizon"),
  location: requiredText("La localisation"),
  riskTolerance: z.enum(["faible", "moyenne", "elevee"]),
});

export const offerSchema = z.object({
  variantId: requiredText("La variante"),
  seller: requiredText("Le vendeur"),
  channel: z.enum(CHANNELS),
  condition: z.enum(CONDITIONS),
  configuration: requiredText("La configuration"),
  priceMinor: z.coerce.number().int().positive("Le prix doit être strictement positif."),
  currency: z.string().length(3).transform((value) => value.toUpperCase()),
  sourceUrl: z.url("L’URL source doit être une URL HTTP(S) complète.").refine(
    (url) => ["http:", "https:"].includes(new URL(url).protocol),
    "L’URL source doit utiliser HTTP(S).",
  ),
  observedAt: z.iso.date().refine(
    (date) => new Date(`${date}T23:59:59`) <= new Date(),
    "La date d’observation ne peut pas être dans le futur.",
  ),
  observedFact: requiredText("Le fait observé"),
  confidence: z.enum(CONFIDENCES),
  confidenceReason: z.string().trim().optional(),
  revalidateBefore: z.iso.date(),
}).superRefine((value, context) => {
  if (value.revalidateBefore < value.observedAt) {
    context.addIssue({
      code: "custom",
      path: ["revalidateBefore"],
      message: "La revalidation doit être postérieure ou égale à l’observation.",
    });
  }
  if (value.confidence !== "elevee" && !value.confidenceReason) {
    context.addIssue({
      code: "custom",
      path: ["confidenceReason"],
      message: "Justifiez une confiance moyenne ou faible.",
    });
  }
});

export function issuesFromZod(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    code: issue.code,
    message: issue.message,
  }));
}
