# DealFox — Formulaire de saisie d'une offre

## But

Permettre au foyer unique de transformer une page vendeur en une offre structurée, traçable et comparable. Le formulaire est l'entrée P0 : il n'extrait pas automatiquement une URL et n'importe pas de CSV.

## Statuts de saisie

| Statut | Signification | Ce qui est autorisé |
|---|---|---|
| Brouillon | L'utilisateur commence à capturer une offre. | Sauvegarde et reprise de saisie. |
| Prouvée | Les données minimales et la preuve datée sont présentes. | Comparaison et conservation dans l'historique. |
| À compléter | Une information importante est inconnue. | Visible dans le board, mais pas d'indice ni de recommandation finale. |
| Expirée | La date de revalidation est dépassée. | Consultation historique ; revalidation requise avant tout nouveau calcul. |

## Sections et champs

### 1. Identification de l'offre

| Champ | Obligatoire pour `prouvée` | Validation |
|---|---|---|
| Produit | Oui | Sélection ou création d'un produit déjà rattaché au besoin. |
| Variante / configuration | Oui | Texte descriptif ; inclut année, taille ou configuration famille si connue. |
| Vendeur | Oui | Nom du vendeur ou de la plateforme. |
| Canal | Oui | `constructeur`, `revendeur`, `reconditionneur` ou `particulier`. |
| État | Oui | `neuf`, `reconditionné constructeur`, `reconditionné tiers` ou `occasion`. |

### 2. Prix et conditions commerciales

| Champ | Obligatoire pour `prouvée` | Validation |
|---|---|---|
| Prix actuel | Oui | Montant strictement positif et devise requise. |
| Prix de référence | Non | Montant et date/source du prix si renseigné ; n'est jamais inventé. |
| Livraison | Non | Montant, incluse ou inconnue. |
| Garantie | Non | Durée et conditions ; `inconnue` est une valeur explicite. |
| Financement | Non | Offre, coût total et conditions ; ne compte pas dans le TCO sans données complètes. |
| Accessoires inclus | Non | Liste des accessoires ; distincte des accessoires seulement compatibles. |

### 3. Preuve et fraîcheur

| Champ | Obligatoire pour `prouvée` | Validation |
|---|---|---|
| URL source | Oui | URL HTTP(S) complète, ouverte par l'utilisateur dans le navigateur. |
| Date d'observation | Oui | Ne peut pas être dans le futur. |
| Fait observé | Oui | Résumé court du prix, stock ou condition vu sur la source. |
| Niveau de confiance | Oui | `élevée`, `moyenne` ou `faible`, avec justification si inférieur à élevée. |
| Revalidation avant le | Oui | Date postérieure ou égale à l'observation. |

### 4. Données de décision

| Champ | Obligatoire pour l'indice v1 | Règle |
|---|---|---|
| Disponibilité locale | Oui | `confirmée`, `non confirmée` ou `inconnue`. |
| Compatibilité avec le besoin | Oui | Éléments de configuration pertinents pour la catégorie, par exemple deux enfants pour le cargo. |
| SAV / réparabilité | Oui | Niveau et preuve ; le support constructeur et le service local sont séparés. |
| TCO | Oui | Prix, accessoires, entretien, valeur de revente et hypothèses documentées. |
| Revente estimée | Oui | Valeur et hypothèse ou statut `inconnue`. |

## Comportement de validation

- Le bouton « enregistrer le brouillon » reste toujours disponible.
- Le statut `prouvée` exige les champs obligatoires des sections 1 à 3.
- L'indice v1 est désactivé tant qu'un champ de la section 4 est inconnu ou non justifié.
- Une URL, un prix ou une date modifiés créent une nouvelle observation ; ils ne remplacent pas l'observation précédente.
- Un prix de référence inférieur au prix actuel est autorisé, mais il interdit de présenter l'offre comme une promotion sans explication.
- L'interface doit nommer les champs bloquants, sans message générique du type « formulaire invalide ».

## Cas de démo

Le foyer saisit l'offre BTWIN R500E : prix actuel 1 999,99 €, prix de référence 2 499,99 €, URL Decathlon et observation datée. Tant que le retrait à Anglet et les accessoires inclus ne sont pas confirmés, l'offre peut être prouvée mais l'indice reste `à compléter`. La prochaine action est formulée explicitement : « confirmer le retrait local et le panier famille ».

## Hors P0

- préremplissage ou scraping depuis l'URL ;
- import de tableur ;
- reconnaissance d'image, OCR ou extension navigateur ;
- synchronisation automatique de stock ou de prix.
