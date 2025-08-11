# Page Report — Application du Design

## En-tête d’action
- Rangée supérieure: `BackButton` (gauche) + contrôles d’analyse (droite)
  - États boutons: `Start Analysis` (idle), `Retry Analysis` (erreur), `Run Again` (terminé)
  - Styles: boutons pleins (bleu, gris, vert) avec `transition-colors`

## Bloc URL & Métadonnées
- Carte sombre `bg-gray-800 border border-gray-700 rounded-lg p-6`
- Titre "Analysis for:" + URL monospace bleu `text-blue-400`
- Métadonnées (si dispo): titre et description dans un bloc avec ligne de gauche

## Score Global AEO
- `AEOScoreDisplay`: grand score, barre de progression, grille de sous-scores
- Couleurs dynamiques selon pourcentage (vert/orange/rouge)

## Sections d’Analyse (Hiérarchie)
- `MainSectionComponent` par catégorie (Discoverability, Structured Data, LLM Formatting, Accessibility, Readability)
- Ordre d’affichage: après le score global
- Chaque section: en-tête gradient + score + description + statut
- Pénalités globales (contextuelles): encart d’alerte sous l’en-tête

## Drawers (Sous-sections)
- Headers cliquables avec chevron rotatif
- Dépliage animé: `max-h-0 → max-h-[2000px]` + fade
- Contenu:
  - "What’s Perfect" (si fourni): liste verte
  - Pile de `MetricCard`

## Cartes Métriques
- Explication en tête
- Affichage conditionnel:
  - ✅ Succès (message)
  - 🔍 Recommandations (nouveau format: Problem/Solution + explication)
  - ⚠️/💡 Ancien format: listes Problems/Solutions

## États de Processus
- Idle: placeholder "Preparing analysis..." (bloc jaune pâle avec spinner)
- Loading: skeletons (shimmers) pour les entêtes et tiroirs
- Erreur réseau: `ErrorMessage` dédiée (texte et encart rouges)
- Erreur d’analyse: `ErrorMessage` générique
- Terminé: sections affichées et score présent

## Accessibilité & Sémantique
- Boutons de drawer: `aria-expanded`, `aria-controls`
- Icônes avec `role="img"` + `aria-label`
- Contrastes élevés sur mode sombre

## Contraintes & RWD
- Largeur: `max-w-4xl`, padding `px-4 py-8`
- Grilles responsives pour sous-scores
- Espacements verticaux cohérents `space-y-6/4/2`
