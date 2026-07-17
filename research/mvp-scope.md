# MVP DealFox — périmètre fonctionnel

## Résultat à démontrer

Permettre à un foyer de décider, en moins d'une session, si une offre mérite une action immédiate — avec les preuves, les compromis et les inconnues visibles.

Le MVP valide le flux sur les vélos cargo longtail. Il réutilise le noyau décrit dans [`product-domain-map.md`](product-domain-map.md) et la méthode [`decision-methodology.md`](decision-methodology.md), sans présumer que le produit restera limité à cette catégorie.

## Utilisateur initial

Un acheteur individuel ou un foyer qui compare un achat coûteux, avec un budget, une localisation, une fenêtre d'achat et une tolérance au risque explicites.

## Parcours MVP

1. Créer un besoin : catégorie, usages, budget, horizon, localisation et contraintes.
2. Définir les critères et leurs poids, avec une explication de leur rôle.
3. Ajouter manuellement une offre à partir d'une URL : produit/variante, vendeur, état, prix, référence, date, preuve et confiance.
4. Signaler les données manquantes au lieu de les inventer.
5. Calculer le score du board et l'indice d'achat v1 quand toutes les entrées requises sont présentes.
6. Produire une recommandation explicable : agir, attendre ou vérifier, avec les raisons et le prochain fait à collecter.
7. Conserver l'historique des observations pour détecter une baisse réellement comparable.

## Capacités P0

| Capacité | Critère d'acceptation |
|---|---|
| Besoin et profil | Le foyer peut enregistrer budget, usages, localisation, horizon et priorité des critères. |
| Catalogue de décision | Produit, variante et offre sont des objets séparés ; une même variante peut avoir plusieurs offres. |
| Preuve et fraîcheur | Chaque prix a une URL, une date, un niveau de confiance et un statut de revalidation. |
| Comparaison | Le board calcule la somme pondérée et expose les notes sources. |
| Indice d'achat v1 | Le système conserve chaque dimension, son poids, le résultat et la version de la formule. |
| Garde-fous d'alerte | Aucune alerte si une donnée bloquante manque ; une première promotion est libellée comme baseline. |
| Recommandation | Le résultat sépare valeur, risque, coût, données manquantes et prochaine action. |
| Historique | Une observation n'écrase jamais la précédente ; les baisses utilisent deux observations comparables. |

## Hors périmètre MVP

- scraping automatique, connecteurs vendeurs et monitoring temps réel ;
- envoi automatisé d'e-mail, SMS ou push ;
- paiement, financement ou demande d'aide intégrés ;
- prévision de prix, IA de recommandation opaque ou notation communautaire ;
- gestion détaillée de maintenance, incidents et assurance ;
- multi-utilisateur avancé, rôles et synchronisation de parc.

Ces éléments suivent après validation du flux manuel. Le MVP doit d'abord prouver que la qualité des données et l'explication de la décision apportent une valeur réelle.

## Mesures de validation

- au moins cinq offres saisies avec preuve et date ;
- un board dont le calcul est vérifiable à la main ;
- au moins une recommandation `agir`, une `attendre` et une `vérifier` correctement expliquées ;
- aucune alerte issue d'un prix sans source, date ou comparaison valide ;
- décision d'un foyer test plus rapide ou mieux justifiée que son tableau manuel initial.

## Suite proposée après le MVP

1. Import assisté d'URL et extraction sous contrôle utilisateur.
2. Veille planifiée avec déduplication des alertes.
3. Passage de l'achat à l'actif possédé pour mesurer SAV, entretien, batterie et immobilisation réels.
