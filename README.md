# DealFox

Application locale de décision d’achat : elle cadre le besoin d’un foyer, sépare
produits, offres et observations, puis produit une recommandation explicable à
partir de preuves datées.

## Démarrer

Prérequis : Node.js 20 LTS ou 22 LTS.

```bash
npm install
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000). La base SQLite
est créée automatiquement dans `data/dealfox.db`. Le bouton « Importer la démo
cargo » ajoute le besoin d’Anglet et les cinq offres historiques documentées
dans `research/`.

## Vérifier

```bash
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Le domaine pur se trouve dans `src/domain`, le schéma Drizzle dans `src/db` et
les Server Actions ainsi que le parcours Next.js dans `src/app`.
