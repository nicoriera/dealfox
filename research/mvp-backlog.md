# DealFox — Backlog MVP

Ce backlog rend le périmètre MVP livrable sans introduire d'automatisation de marché prématurée. Il s'appuie sur [`mvp-scope.md`](mvp-scope.md), la [`decision-methodology.md`](decision-methodology.md) et les [offres vérifiées](market/cargo-longtail/verified-offers-2026-07-17.md).

## Démo cible

Un foyer à Anglet compare le BTWIN R500E, le Fiido T2 et les offres Moma E-LONGTAIL. Il saisit les offres depuis leurs pages vendeur, visualise les données manquantes, calcule une recommandation expliquée et peut distinguer :

- **agir** sur une promotion réellement qualifiée ;
- **vérifier** une offre attractive qui présente encore un risque ou une donnée manquante ;
- **attendre** lorsqu'aucun changement comparable ne rend l'achat opportun.

Le MVP opère dans un contexte mono-foyer : aucun compte, rôle, invitation ou partage ne fait partie du flux initial.

## Séquence de livraison

| Lot | Objectif | Condition de sortie |
|---|---|---|
| 0 — Décision | Créer le besoin, le profil et les critères | Un board est lisible et ses poids totalisent 100. |
| 1 — Offre prouvée | Saisir produits, variantes, offres et observations | Un prix est impossible à présenter sans date et source. |
| 2 — Évaluation | Calculer score, indice et état de donnée | Chaque résultat conserve notes, poids, version et données manquantes. |
| 3 — Recommandation | Rendre une action compréhensible | Le foyer sait quoi faire ensuite et pourquoi. |
| 4 — Historique | Comparer les observations dans le temps | Une baisse n'est affichée que pour deux observations comparables. |

## Backlog priorisé

| ID | Priorité | User story | Critères d'acceptation | Dépend de |
|---|---|---|---|---|
| DF-01 | P0 | En tant que foyer unique, je crée un besoin d'achat contextualisé. | Catégorie, usages, budget, horizon, localisation et tolérance au risque sont enregistrés dans le contexte unique du foyer. | — |
| DF-02 | P0 | En tant que décideur, je définis des critères et leurs poids. | Les poids totalisent 100 ; une erreur est visible sinon ; chaque critère a une explication. | DF-01 |
| DF-03 | P0 | En tant que décideur, j'ajoute un produit et sa variante. | Le produit est distinct de l'offre ; une variante peut être comparée à plusieurs offres. | DF-01 |
| DF-04 | P0 | En tant que décideur, je saisis une offre depuis une page vendeur avec un formulaire structuré. | Vendeur, canal, état, prix, devise, URL, date et confiance sont obligatoires ; les validations sont définies dans `offer-entry-form.md`. | DF-03 |
| DF-05 | P0 | En tant que décideur, je vois les données qui bloquent une recommandation. | Garantie, configuration, disponibilité, accessoires et SAV peuvent être `inconnus` ; ces états ne sont pas convertis en zéro silencieux. | DF-04 |
| DF-06 | P0 | En tant que décideur, je compare les candidats dans un board. | Le score est calculé par somme pondérée, avec les valeurs et l'arrondi visibles. | DF-02, DF-03 |
| DF-07 | P0 | En tant que décideur, j'évalue une offre actuelle. | L'indice v1 conserve ses sept dimensions, leurs poids, le résultat et la version `v1`. | DF-04, DF-05 |
| DF-08 | P0 | En tant que décideur, je reçois une recommandation explicable. | La recommandation est `agir`, `vérifier` ou `attendre` ; elle liste preuves, risques, données manquantes et prochaine action. | DF-06, DF-07 |
| DF-09 | P0 | En tant que décideur, je conserve les observations successives. | Une nouvelle observation n'écrase pas l'ancienne ; la comparabilité est vérifiée avant tout delta de prix. | DF-04 |
| DF-10 | P0 | En tant que décideur, je distingue une promotion de baseline d'une baisse. | La première observation promotionnelle porte le statut `baseline_promotion`, jamais `price_drop`. | DF-09 |
| DF-11 | P1 | En tant que foyer, je garde l'offre ou le produit en suivi. | L'objectif de suivi est `achat`, `benchmark` ou `possession`. | DF-08 |
| DF-12 | P1 | En tant que foyer, je passe une offre sélectionnée en actif possédé. | L'achat conserve l'offre source, la date et le coût réel ; il n'altère pas les observations marché. | DF-11 |

## Contrat de données minimal

| Objet | Champs P0 indispensables | Règle importante |
|---|---|---|
| Besoin | foyer, catégorie, usages, budget, horizon, localisation, risque | Porte le contexte ; il ne dépend d'aucune offre. |
| Critère | libellé, poids, définition, board | Les poids d'un board totalisent 100. |
| Produit / variante | marque, modèle, variante, année/configuration | N'inclut ni prix ni vendeur. |
| Offre | variante, vendeur, canal, état, prix, devise, configuration | Désigne une proposition achetable, pas un fait historique. |
| Observation | offre, observée le, valeur, disponibilité, conditions | Est immuable et comparable seulement avec le même produit, canal, état et configuration. |
| Preuve | URL, extrait/fait, date, confiance, révision attendue | Toute donnée d'évaluation doit pointer vers une preuve. |
| Évaluation | cible, notes, poids, formule, version, résultat | Ne peut être recalculée implicitement après changement de formule. |
| Recommandation | état, motifs, risques, données manquantes, prochaine action | Ne doit jamais présenter une inconnue comme un fait favorable. |

## Règles de garde-fou

- Une offre sans URL ou date reste brouillon et n'entre pas dans l'indice.
- Un prix ne produit un delta que si devise, état, configuration et canal sont comparables.
- Une donnée expirée ou non confirmée abaisse la confiance, mais ne réécrit pas l'historique.
- Un indice supérieur ou égal à 90 ne contourne pas les champs bloquants définis par le foyer.
- Une recommandation d'achat ne doit pas être utilisée pour un actif déjà possédé ; celui-ci passe en objectif `benchmark` ou `possession`.

## Questions de produit à trancher avant le code

1. Quels champs sont universellement bloquants et lesquels dépendent de la catégorie ?
2. Quel résultat de test permettra de considérer le MVP validé : rapidité de décision, qualité d'explication ou taux d'alertes utiles ?

## Hors backlog initial

L'extraction automatique depuis les sites vendeur, les alertes planifiées, les intégrations d'aides/financement et le suivi détaillé de possession restent hors P0. Ils dépendent d'abord de la validation de ce flux avec les cinq offres déjà qualifiées.
