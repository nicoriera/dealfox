# Méthode de décision et de signal — v1

_Entrée en vigueur : 17 juillet 2026_

## Objectif

Rendre une recommandation reproductible, sans confondre la qualité d'un produit, la qualité d'une offre et le moment d'achat.

## Trois mesures distinctes

| Mesure | Question traitée | Formule / statut |
|---|---|---|
| Score du board | Quel produit répond le mieux au besoin, toutes offres confondues ? | Somme des notes de critères pondérées ; les poids totalisent 100 et le résultat est arrondi à l'entier le plus proche. |
| Indice d'achat v1 | Cette offre est-elle actionnable maintenant pour ce profil ? | Prix et qualité de l'offre 25 %, adéquation famille 20 %, SAV/réparabilité 15 %, TCO cinq ans 15 %, accessoires 10 %, revente 10 %, disponibilité 5 %. Chaque dimension est notée sur 10. |
| Décision | Faut-il agir ? | Une recommandation explique l'indice, les preuves, les risques non résolus et le budget du foyer ; elle ne se déduit pas mécaniquement d'un score seul. |

Les indices figurant dans les relevés antérieurs au 17 juillet 2026 sont des **estimations exploratoires historiques**. Ils ne sont pas des calculs v1 et ne doivent ni être comparés à un indice v1 ni déclencher une nouvelle alerte sans recalcul.

## Données minimales d'une offre

- produit, variante, année/modèle et configuration famille ;
- vendeur, canal, état, prix actuel, prix de référence et date d'observation ;
- garantie, kilométrage et santé de batterie pour une occasion ou un reconditionné ;
- accessoires inclus, coût de livraison et financement ;
- disponibilité, localisation et preuve source ;
- niveau de confiance et date limite de revalidation.

Une observation sans prix ou date vérifiable reste une hypothèse de veille, pas une entrée de calcul.

## Politique d'alerte

Une alerte est actionnable lorsqu'au moins une condition est vraie :

1. baisse vérifiée par rapport à une observation précédente comparable ;
2. offre premium qui respecte un seuil défini par état et dossier ;
3. indice d'achat v1 supérieur ou égal à 90/100 ;
4. aide ou financement qui améliore significativement le TCO ;
5. disponibilité de la bonne taille/configuration lorsque celle-ci bloque la décision.

Lorsqu'un premier relevé montre déjà une promotion, le signal doit être libellé **« promotion observée à la baseline »** et non **« baisse jour sur jour »**.

## Seuil Tern GSD

| Qualification de l'offre | Seuil de surveillance |
|---|---:|
| État standard documenté | <= 3 800 € |
| Très bon état, facture, batterie saine, historique et accessoires famille | <= 4 200 € |
| Modèle récent, état exceptionnel et dossier complet | <= 4 800 € |

## Cycle de décision

`besoin` → `board` → `produit/variante` → `offre observée` → `indice` → `alerte/recommandation` → `achat` → `actif possédé`.

L'actif possédé est suivi dans un contexte distinct : entretien, SAV, pièces, sécurité et immobilisation. Une veille peut ensuite rester active comme benchmark, mais son objectif doit être libellé `achat`, `benchmark` ou `possession`.
