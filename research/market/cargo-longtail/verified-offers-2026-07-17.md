# Offres longtail vérifiées — 17 juillet 2026

Ce relevé transforme les pages vendeur en observations exploitables pour DealFox. Une donnée est soit **vérifiée**, soit **à compléter** ; elle ne devient pas une recommandation par défaut.

## Offres actionnables ou à revalider au checkout

| Offre | État | Prix observé | Référence | Signal | Confiance | Informations encore requises |
|---|---|---:|---:|---|---|---|
| BTWIN R500E, Decathlon | Neuf | 1 999,99 € | 2 499,99 € | -500 € ; promotion annoncée jusqu'au 20/07 | Élevée | Stock/retrait à Anglet, accessoires réellement inclus, frais de livraison. |
| Fiido T2, Fiido France | Neuf | 1 399 € | 1 499 € observés les 9–13/07 ; 1 799 € précédemment affichés | Nouveau plus bas observé ; vérifier au panier | Moyenne | Conditions exactes de promotion, stock France, accessoires inclus, réparabilité locale. |
| Moma E-LONGTAIL, Moma | Reconditionné constructeur | 1 999,99 € | 4 000 € affichés | 18 unités affichées en stock | Moyenne | Conditions de garantie en France, état détaillé, coût/livraison, confirmation du stock au checkout. |
| Moma E-LONGTAIL, Moma | Neuf | 2 299,99 € | 4 000 € affichés | Prix catalogue promotionnel observé | Moyenne | Stock, configuration réellement livrée, garantie et accessoires. |
| BTWIN E-Three 500, Decathlon | Neuf | 2 499,99 € | — | Prix actuel observé, pas de promotion qualifiée | Moyenne | Stock/retrait local, compatibilité enfants et coût des accessoires. |

## Preuves et faits utilisables

### BTWIN R500E

- Source : [page produit Decathlon](https://www.decathlon.fr/p/velocargo-electrique-longtail-chargement-arriere-r500e/_/R-p-349924).
- Prix observé : 1 999,99 € au lieu de 2 499,99 € ; promotion annoncée du 23/06/2026 au 20/07/2026.
- Faits affichés : deux enfants ou un adulte, 170 kg de charge hors poids du vélo, garantie deux ans.
- Lecture DealFox : le prix et l'échéance rendent l'offre actionnable, sous réserve de disponibilité pour le foyer.

### Fiido T2

- Source : [page produit Fiido France](https://fr.fiido.com/products/fiido-t2-longtail-cargo-ebike-for-versatile-all-terrain).
- Prix observé : 1 399 € ; le relevé précédent retenait 1 499 €.
- Faits affichés : batterie 998,4 Wh, charge utile 200 kg, configuration possible pour un à deux enfants, livraison gratuite, garantie deux ans et retour sous 30 jours.
- Lecture DealFox : signal de prix à revalider au checkout ; le risque de SAV et de réparabilité locale reste ouvert et ne doit pas être masqué par la promotion.

### Moma E-LONGTAIL reconditionné

- Source : [page Moma reconditionné](https://momabikes.com/products/sv-bicicleta-electrica-e-longtail).
- Prix et stock observés : 1 999,99 € et 18 unités.
- Faits affichés : batterie amovible 624 Wh, moteur 70 Nm, transmission Shimano Altus, fourche RST ; cadre garanti à vie selon la page.
- Lecture DealFox : référence de valeur élevée, mais statut de garantie, état et capacité de service autour d'Anglet sont des champs bloquants pour une alerte de faible risque.

### Moma E-LONGTAIL neuf

- Source : [page Moma France](https://momabikes.fr/products/velo-electrique-ebike-longtail).
- Prix observé : 2 299,99 € au lieu de 4 000 € affichés.
- Lecture DealFox : observation de marché, non comparable au reconditionné sans détail de configuration, garantie et disponibilité.

### BTWIN E-Three 500

- Source : [page produit Decathlon](https://www.decathlon.fr/p/_/R-p-356181).
- Prix observé : 2 499,99 €.
- Lecture DealFox : candidat solide à qualifier, mais pas une offre promotionnelle tant que le prix de référence, la disponibilité locale et le panier famille ne sont pas confirmés.

## Référence non actionnable

Une [Tern GSD 10 2020 reconditionnée](https://upway.fr/products/tern-gsd-10-rr4wh2) a été observée à 2 449 €, mais la page indique qu'elle est vendue. Ses données (8 099 km, batterie d'origine 400 Wh, 84 cycles) sont utiles pour calibrer les comparables d'occasion ; elles ne doivent pas produire une alerte.

## Décision de données

Les cinq offres ci-dessus sont prêtes à être saisies dans l'objet `offre` avec leur URL, date, condition et niveau de confiance. Elles ne sont **pas encore toutes scorables** avec la méthode v1 : une alerte exige les champs bloquants de l'offre et du profil de décision, notamment disponibilité locale, accessoires et serviceabilité.
