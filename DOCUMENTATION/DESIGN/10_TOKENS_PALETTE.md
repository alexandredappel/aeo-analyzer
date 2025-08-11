# Design Tokens — Palette, Typo, Spacing, Motion

## Couleurs (utilisation et classes Tailwind)
- **Primaire (Action/Info)**: Bleu
  - Texte/accents: `text-blue-400/600/700`
  - Boutons: `bg-blue-600 hover:bg-blue-700`
  - Bordures/états: `border-blue-700`, badges: `bg-blue-50 text-blue-700`
- **Surfaces (Report/Mode sombre)**:
  - Contenant principal: `bg-gray-950` (sections)
  - Cartes secondaires: `bg-gray-900` (drawers)
  - Cartes métriques: `bg-gray-800`
  - Bordures: `border-gray-800/700/600`
- **Texte (sombre)**: `text-white`, `text-gray-200/300/400`
- **Texte (clair)**: `text-gray-900/700/600`
- **Feedback/Statuts**:
  - Success/Excellent: `text-green-400`, surfaces positives: `bg-green-900/20`, `border-green-700/50`
  - Info/Good: `text-blue-400`
  - Warning: `text-orange-400`, surfaces: `bg-yellow-900/20`, `border-yellow-700`
  - Error: `text-red-400`, surfaces: `bg-red-900/20`, `border-red-700`

## Typographie
- **Familles**: Geist Sans (par défaut), Geist Mono (mono)
- **Tailles fréquentes**:
  - Titres section: `text-2xl`
  - Score global: `text-6xl md:text-7xl`
  - Sous-scores: `text-lg` (valeurs) + `text-xs` (labels)
  - Corps: `text-sm` à `text-base`
- **Poids**: `font-semibold`, `font-bold` pour titres et valeurs clés
- **Mono**: utilisé pour les URLs et logs

## Spacing & Layout
- **Containers**: `max-w-4xl` (report), `max-w-6xl` (header/footer)
- **Padding**: `p-6`, `p-8` (sections), `p-4` (cartes)
- **Margins/Stacks**: `mb-6`, `space-y-6` (sections), `space-y-4` (drawers), `space-y-2` (cartes)
- **Grilles**: sous-scores `grid grid-cols-2 sm:grid-cols-5`, badges `grid-cols-2 md:grid-cols-4`

## Radius & Bordures & Ombres
- **Radius**: `rounded-lg` (cartes), `rounded-xl` (sections), `rounded-full` (indicateurs)
- **Bordures**: systématique sur surfaces sombres (délimitation et profondeur)
- **Ombres**: légères sur hover cartes métriques `hover:shadow-lg`

## Iconographie
- **StatusIcon** (mapping):
  - excellent → ✅ + `text-green-400`
  - good → ℹ️ + `text-blue-400`
  - warning → ⚠️ + `text-orange-400`
  - error → ❌ + `text-red-400`
- **Émojis**: utilisés pour les sections (en-têtes) et signaux visuels légers

## Motion & États
- **Transitions**: `transition-colors duration-200` (boutons/cartes), `transition-all duration-300 ease-in-out` (drawers)
- **Animations**: `animate-spin` (spinner), `animate-pulse` (skeletons)
- **Expansion Drawers**: `max-h-0` → `max-h-[2000px]` + fade (opacity)
