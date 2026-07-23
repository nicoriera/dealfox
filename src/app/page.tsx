import { getDashboard } from "@/db/queries";
import { calculateBoardScore } from "@/domain/decision";
import { importDemo } from "./demo-action";
import { EvaluationForm, NeedForm, OfferForm, ProductForm } from "./components/forms";

export const dynamic = "force-dynamic";

const money = (minor: number, currency = "EUR") => new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(minor / 100);
const parse = (json: string) => JSON.parse(json) as string[];

export default async function Home() {
  const data = await getDashboard();
  const variantLabels = data.variants.map((variant) => {
    const product = data.products.find((item) => item.id === variant.productId);
    return { id: variant.id, label: `${product?.brand} ${product?.model} — ${variant.name}` };
  });
  const latestFor = (offerId: string) => data.observations.find((observation) => observation.offerId === offerId);
  const latestRecommendation = (offerId: string) => data.recommendations.find((recommendation) => recommendation.offerId === offerId);
  const latestEvaluation = (offerId: string) => data.evaluations.find((evaluation) => evaluation.targetId === offerId);

  return <main>
    <header className="hero">
      <nav><a className="brand" href="#">deal<span>fox</span></a><div><a href="#decisions">Décisions</a><a href="#offers">Offres</a><a href="#review">Examiner</a></div></nav>
      <div className="hero-copy"><p className="eyebrow">Décider avec les faits</p><h1>Le bon achat,<br /><em>au bon moment.</em></h1><p>Comparez la valeur réelle, rendez les inconnues visibles et gardez chaque recommandation vérifiable.</p><div className="hero-actions"><a className="button" href="#new">Créer une décision</a><form action={importDemo}><button className="ghost">Importer la démo cargo</button></form></div></div>
      <div className="trust"><span>100 % local</span><span>Calculs versionnés</span><span>Preuves datées</span></div>
    </header>

    <section id="decisions" className="section">
      <div className="section-heading"><div><p className="eyebrow">Vue d’ensemble</p><h2>Mes décisions</h2></div><span className="count">{data.needs.length} active{data.needs.length > 1 ? "s" : ""}</span></div>
      {data.needs.length === 0 ? <div className="empty"><span>01</span><h3>Cadrez le besoin avant de regarder les offres.</h3><p>Le budget, les usages et le risque deviennent la boussole de chaque comparaison.</p></div> :
        <div className="decision-grid">{data.needs.map((need) => {
          const board = data.boards.find((item) => item.needId === need.id);
          const boardCriteria = data.criteria.filter((item) => item.boardId === board?.id);
          const relatedProducts = data.products.filter((product) => product.needId === need.id);
          const relatedVariants = data.variants.filter((variant) => relatedProducts.some((product) => product.id === variant.productId));
          const relatedOffers = data.offers.filter((offer) => relatedVariants.some((variant) => variant.id === offer.variantId));
          return <article className="decision-card" key={need.id}><div className="card-top"><span className="status-dot" />Active <span>{need.category}</span></div><h3>{need.title}</h3><p>{need.usages}</p><dl><div><dt>Budget</dt><dd>{money(need.budgetMinor, need.currency)}</dd></div><div><dt>Lieu</dt><dd>{need.location}</dd></div><div><dt>Offres</dt><dd>{relatedOffers.length}</dd></div></dl><div className="progress"><span style={{ width: `${Math.min(100, relatedOffers.length * 20 + (boardCriteria.length ? 25 : 0))}%` }} /></div><small>{boardCriteria.reduce((sum, criterion) => sum + criterion.weight, 0)} points de poids · {board?.version}</small></article>;
        })}</div>}
    </section>

    <section id="new" className="section split"><div><p className="eyebrow">Étape 1</p><h2>Exprimer le besoin</h2><p className="intro">Une décision solide commence sans produit ni promotion en tête.</p></div><div className="panel"><NeedForm /></div></section>
    {data.needs.length > 0 && <section className="section split"><div><p className="eyebrow">Étape 2</p><h2>Ajouter les candidats</h2><p className="intro">Le produit reste indépendant de ses vendeurs et de leurs prix.</p></div><div className="panel"><ProductForm needs={data.needs} /></div></section>}
    {data.variants.length > 0 && <section id="offers" className="section split"><div><p className="eyebrow">Étape 3</p><h2>Prouver une offre</h2><p className="intro">Une URL, une date et un fait observé accompagnent toujours le prix.</p></div><div className="panel"><OfferForm variants={variantLabels} /></div></section>}

    <section id="review" className="section dark">
      <div className="section-heading"><div><p className="eyebrow">Étape 4</p><h2>Examiner sans angle mort</h2></div><span className="version">purchase_index_v1</span></div>
      {data.offers.length === 0 ? <p className="muted">Ajoutez une offre pour commencer l’examen.</p> :
      <div className="offer-list">{data.offers.map((offer) => {
        const variant = data.variants.find((item) => item.id === offer.variantId);
        const product = data.products.find((item) => item.id === variant?.productId);
        const observation = latestFor(offer.id);
        const proof = data.proofs.find((item) => item.observationId === observation?.id);
        const recommendation = latestRecommendation(offer.id);
        const evaluation = latestEvaluation(offer.id);
        const expired = observation && observation.revalidateBefore < new Date().toISOString().slice(0, 10);
        return <article className="offer-row" key={offer.id}>
          <div className="offer-main"><div className="card-top"><span className={`pill ${offer.status}`}>{expired ? "expirée" : offer.status.replace("_", " ")}</span><span>{offer.seller}</span></div><h3>{product?.brand} {product?.model}</h3><p>{offer.configuration}</p>{proof && <a href={proof.sourceUrl} target="_blank" rel="noreferrer">Voir la preuve ↗</a>}</div>
          <div className="offer-price"><strong>{observation ? money(observation.priceMinor, observation.currency) : "Prix inconnu"}</strong><small>{observation ? `observé le ${new Date(observation.observedAt).toLocaleDateString("fr-FR")}` : "brouillon"}</small></div>
          <div className="verdict">{evaluation?.result != null && <div className="index"><strong>{evaluation.result}</strong><span>/100</span></div>}{recommendation ? <><span className={`state ${recommendation.state}`}>{recommendation.state}</span><p>{recommendation.nextAction}</p>{parse(recommendation.missingJson).length > 0 && <details><summary>{parse(recommendation.missingJson).length} données bloquantes</summary><ul>{parse(recommendation.missingJson).map((item) => <li key={item}>{item}</li>)}</ul></details>}</> : <span className="state verifier">à évaluer</span>}</div>
          {observation && <details className="evaluate"><summary>Noter les 7 dimensions</summary><EvaluationForm offerId={offer.id} /></details>}
        </article>;
      })}</div>}
    </section>
    <footer><a className="brand" href="#">deal<span>fox</span></a><p>Chaque résultat conserve ses données, sa formule et sa version.</p></footer>
  </main>;
}
