# Composants — UI de base et Analyse

## Base UI

### Header
- Fond blanc, bordure inférieure grise, titre bleu `text-blue-600`
- Conteneur: `max-w-6xl mx-auto px-4 py-4`

### Footer
- Fond blanc, bordure supérieure grise, texte centré gris
- Conteneur: `max-w-6xl mx-auto px-4 py-6`

### BackButton
- Bouton secondaire sombre: `bg-gray-700 hover:bg-gray-600 text-white rounded-lg`
- Padding `px-4 py-2`, typographie `font-medium`

### ErrorMessage
- Carte d’erreur: `bg-red-900/20 border border-red-700 rounded-lg p-6`
- Titre `text-red-400`, message `text-gray-300`
- Option: bouton retour cohérent avec BackButton

### LoadingSpinner
- Spinner: disque `border-2 border-blue-400 border-t-transparent rounded-full animate-spin`
- Tailles: sm/md/lg via classes (`w-4/6/8 h-4/6/8`)
- Option: texte bleu accompagnant

### HeroSection (Home)
- Badge GEO: `bg-blue-50 text-blue-700` arrondi
- Titre H1 large sombre, sous-titre gris

### UrlForm
- Input large: `bg-white border-2 border-gray-300 rounded-lg`, focus ring bleu
- CTA: `bg-blue-600 hover:bg-blue-700` (disabled: `bg-blue-400`)

### ExampleLink & FeatureBadges & AIEngineLogos
- Liens d’exemple bleus soulignés
- Badges blancs avec ombre légère
- Liste de logos en texte coloré

## Composants d’Analyse

### AEOScoreDisplay
- Bloc principal: `bg-gray-800 border border-blue-700 rounded-lg p-6`
- Score géant (6xl–7xl) + `/100`
- Barre de progression horizontale colorée selon le pourcentage
- Grille 5 sous-scores (dispositions responsives)

### MainSectionComponent
- Section: `bg-gray-950 rounded-xl border border-gray-800`
- En-tête gradient `from-gray-900 to-gray-800`, bordure bas
- Gauche: emoji, titre 2xl blanc, `StatusIcon`, description
- Droite: score `{total}/{max}` 3xl
- Alerte pénalités globales (optionnelle): encart rouge clair
- Corps: liste de `DrawerSubSection`

### DrawerSubSection
- Header cliquable: `StatusIcon`, titre, description, chevron rotatif
- Transitions: `transition-all duration-300 ease-in-out` (height + opacity)
- Contenu: séparateur, bloc "What’s Perfect" (vert), pile de `MetricCard`

### MetricCard
- Carte: `bg-gray-800 rounded-lg border border-gray-700 p-4`
- En-tête: `StatusIcon` + nom
- Explication (texte gris)
- Affichage conditionnel:
  - Succès: message ✅ vert
  - Recommandations (nouvelle structure): cartes avec bordure gauche orange (Problem) + solution
  - Ancienne structure: listes Problems (bordure rouge) / Solutions (bordure verte)

### StatusIcon
- Mapping statut→emoji+couleur: excellent✅ vert, goodℹ️ bleu, warning⚠️ orange, error❌ rouge
- Tailles sm/md/lg
