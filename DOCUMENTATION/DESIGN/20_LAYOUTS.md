# Layouts — Global, Home, Report

## Root Layout (`src/app/layout.tsx`)
- **Fonts**: Geist Sans & Mono via variables CSS
- **Langue**: `html lang="en"`
- **Analytics**: script Umami chargé en prod
- **Body**: `antialiased`, thème basé sur variables `--background`/`--foreground`

## Header & Footer
- **Header**: `bg-white border-b border-gray-200`, titre `text-blue-600`, conteneur `max-w-6xl`
- **Footer**: `bg-white border-t border-gray-200`, texte centré `text-gray-600`, `max-w-6xl`

## Home Page (`src/app/page.tsx`)
- **Page**: `min-h-screen bg-gray-50 text-gray-900`
- **Main**: centré verticalement, `px-4 py-12`
- **Contenu**: `max-w-4xl`, Hero + Formulaire URL + Examples + Feature badges + Logos
- **Formulaire URL**: input large + CTA bleu primaire

## Report Layout (`src/components/layouts/ReportLayout.tsx`)
- **Page**: `min-h-screen bg-gray-900 text-white flex flex-col`
- **Header/Footer**: mêmes composants (fond clair) — contraste volontaire avec le contenu sombre
- **Main**: `px-4 py-8`, conteneur `max-w-4xl mx-auto`

## Cartes & Sections (Report)
- **Section principale**: `bg-gray-950 rounded-xl border border-gray-800`
- **Drawer**: `bg-gray-900 rounded-lg border border-gray-700`
- **Carte métrique**: `bg-gray-800 rounded-lg border border-gray-700`

## Grilles & Contraintes
- **Sous-scores**: `grid grid-cols-2 sm:grid-cols-5`
- **Badges**: `grid grid-cols-2 md:grid-cols-4`
- **Contrainte largeur**: 4xl pour le report, 6xl pour header/footer
