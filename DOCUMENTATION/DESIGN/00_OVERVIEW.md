# AEO Analyzer — Design System (Vue d'ensemble)

## Objectif
Ce document présente les principes, la structure et les conventions de design actuellement utilisées dans l’application AEO Analyzer. Il sert de référence pour comprendre rapidement comment le design est organisé et comment il s’applique, en particulier sur la page de rapport.

## Pile UI
- **Framework**: Next.js (App Router)
- **Styles**: Tailwind CSS (classes utilitaires)
- **Fonts**: Google Fonts (Geist Sans, Geist Mono) injectées via `src/app/layout.tsx`
- **Thème**: 
  - Pages d’accueil et entêtes/pieds: claire (fonds blancs/gris très clair)
  - Rapport (contenu principal): thème sombre (surfaces gris très foncé)

## Hiérarchie et architecture d’écran
- **Niveau 1 — Page**: Layout global (Header, Main, Footer)
- **Niveau 2 — Section principale** (Report): Bloc "Main Section" avec en-tête (emoji, titre, statut, description) + score
- **Niveau 3 — Drawers**: Sous-sections repliables, chacune regroupe des cartes de métriques
- **Niveau 4 — Cartes métriques**: Explication + résultats + recommandations (problèmes/solutions)

## Guiding principles
- **Lisibilité**: contrastes élevés, hiérarchie visuelle claire, typographie nette
- **Modularité**: composants autonomes (Header, Score, Section, Drawer, Card)
- **Cohérence**: palette de couleurs limitée, variations par statut (success/info/warning/error)
- **Progressivité**: skeletons et spinners pour les chargements; transitions discrètes

## Thématisation et couleurs (résumé)
- **Accent primaire**: Bleu (actions principales, liens, éléments d’info)
- **Surfaces dark (report)**: `bg-gray-950`, `bg-gray-900`, `bg-gray-800`
- **Bordures**: `border-gray-800/700/600` selon la profondeur
- **Texte**: `text-white`, `text-gray-200/300/400` sur fond sombre; `text-gray-900/700/600` sur fond clair
- **Statuts**:
  - Success/excellent: `text-green-400`
  - Info/good: `text-blue-400`
  - Warning: `text-orange-400`
  - Error: `text-red-400`

## Typographie
- **Sans**: Geist Sans via CSS variable `--font-geist-sans`
- **Mono**: Geist Mono via `--font-geist-mono` (utilisée pour l’URL et logs)
- **Échelles**: titres 2xl–7xl (score), textes sm–base, smallcaps pour labels

## Composants clés (liste)
- Layouts: `ReportLayout`, `Header`, `Footer`
- Entrée: `UrlForm`, `BackButton`
- Feedback: `ErrorMessage`, `LoadingSpinner`
- Report: `AEOScoreDisplay`, `MainSectionComponent`, `DrawerSubSection`, `MetricCard`

## Particularités de la page Report
- En-tête d’action (retour + contrôles d’analyse)
- Encadré URL + métadonnées (titre, description)
- Score global + sous-scores
- Sections hiérarchiques (drawers + cartes)
- États: en cours (skeletons), terminé, erreur (messages dédiés)
