"use client";

import { useActionState } from "react";
import { createNeed, createProduct, evaluateOffer, saveOffer, type ActionState } from "../actions";

const initial: ActionState = { ok: false };

function Feedback({ state }: { state: ActionState }) {
  if (state.message) return <p className="success" role="status">{state.message}</p>;
  if (!state.issues?.length) return null;
  return <ul className="errors" role="alert">{state.issues.map((issue, index) => <li key={`${issue.field}-${index}`}><strong>{issue.field}</strong> — {issue.message}</li>)}</ul>;
}

export function NeedForm() {
  const [state, action, pending] = useActionState(createNeed, initial);
  return <form action={action} className="form-grid">
    <label className="wide">Nom de la décision<input name="title" placeholder="Vélo cargo familial" required /></label>
    <label>Catégorie<input name="category" defaultValue="cargo_longtail" required /></label>
    <label>Budget (€)<input name="budget" type="number" min="1" step=".01" defaultValue="2500" required /></label>
    <label className="wide">Usages<textarea name="usages" placeholder="École, courses, loisirs…" required /></label>
    <label>Localisation<input name="location" defaultValue="Anglet, France" required /></label>
    <label>Horizon<input name="horizon" defaultValue="Dans les 3 mois" required /></label>
    <label>Tolérance au risque<select name="riskTolerance" defaultValue="faible"><option value="faible">Faible</option><option value="moyenne">Moyenne</option><option value="elevee">Élevée</option></select></label>
    <input type="hidden" name="currency" value="EUR" />
    <div className="form-footer wide"><button disabled={pending}>{pending ? "Création…" : "Créer la décision"}</button></div>
    <Feedback state={state} />
  </form>;
}

export function ProductForm({ needs }: { needs: Array<{ id: string; title: string }> }) {
  const [state, action, pending] = useActionState(createProduct, initial);
  return <form action={action} className="form-grid compact">
    <label className="wide">Décision<select name="needId" required>{needs.map((need) => <option key={need.id} value={need.id}>{need.title}</option>)}</select></label>
    <label>Marque<input name="brand" required /></label><label>Modèle<input name="model" required /></label>
    <label>Variante<input name="variantName" required /></label><label>Année<input name="year" /></label>
    <label className="wide">Configuration<textarea name="configuration" placeholder="Taille, année, configuration famille…" required /></label>
    <div className="form-footer wide"><button disabled={pending}>Ajouter le produit</button></div><Feedback state={state} />
  </form>;
}

export function OfferForm({ variants }: { variants: Array<{ id: string; label: string }> }) {
  const [state, action, pending] = useActionState(saveOffer, initial);
  const today = new Date().toISOString().slice(0, 10);
  return <form action={action} className="form-grid">
    <label className="wide">Produit / variante<select name="variantId" required><option value="">Sélectionner…</option>{variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select></label>
    <label>Vendeur<input name="seller" required /></label>
    <label>Canal<select name="channel"><option value="constructeur">Constructeur</option><option value="revendeur">Revendeur</option><option value="reconditionneur">Reconditionneur</option><option value="particulier">Particulier</option></select></label>
    <label>État<select name="condition"><option value="neuf">Neuf</option><option value="reconditionne_constructeur">Reconditionné constructeur</option><option value="reconditionne_tiers">Reconditionné tiers</option><option value="occasion">Occasion</option></select></label>
    <label>Prix (€)<input name="price" type="number" min=".01" step=".01" /></label>
    <label className="wide">Configuration<input name="configuration" placeholder="Configuration exacte proposée" /></label>
    <label className="wide">URL source<input name="sourceUrl" type="url" placeholder="https://…" /></label>
    <label>Date observée<input name="observedAt" type="date" defaultValue={today} /></label>
    <label>Revalider avant<input name="revalidateBefore" type="date" defaultValue={today} /></label>
    <label className="wide">Fait observé<textarea name="observedFact" placeholder="Prix, stock ou conditions visibles sur la page" /></label>
    <label>Confiance<select name="confidence"><option value="elevee">Élevée</option><option value="moyenne">Moyenne</option><option value="faible">Faible</option></select></label>
    <label>Justification<input name="confidenceReason" placeholder="Si moyenne ou faible" /></label>
    <input type="hidden" name="currency" value="EUR" />
    <div className="form-footer wide"><button name="intent" value="draft" className="secondary" disabled={pending}>Enregistrer le brouillon</button><button name="intent" value="prove" disabled={pending}>Prouver l’offre</button></div>
    <Feedback state={state} />
  </form>;
}

export function EvaluationForm({ offerId }: { offerId: string }) {
  const [state, action, pending] = useActionState(evaluateOffer, initial);
  const dimensions = [
    ["offerPrice", "Prix / offre"], ["familyFit", "Adéquation famille"], ["serviceability", "SAV"],
    ["tco", "TCO 5 ans"], ["accessories", "Accessoires"], ["resale", "Revente"], ["availability", "Disponibilité"],
  ];
  return <form action={action} className="score-form">
    <input type="hidden" name="offerId" value={offerId} />
    {dimensions.map(([name, label]) => <label key={name}>{label}<input name={name} type="number" min="0" max="10" defaultValue="8" required /></label>)}
    <button disabled={pending}>Calculer l’indice</button><Feedback state={state} />
  </form>;
}
