# 📁 Structure du Projet AEO Analyzer

## 🏠 Structure Racine
```
aeo-analyzer/
├── 📄 README.md                           # Documentation principale du projet
├── 📄 CHANGELOG.md                        # Historique des changements
├── 📄 architecture.md                     # Architecture technique détaillée
├── 📄 DESIGN.md                          # Guide du design system et UI/UX
├── 📄 COMPONENTS.md                       # Documentation des composants React
├── 📄 PROJECT-STATUS.md                  # État actuel du projet et roadmap
├── 📄 OPTIMIZATION-COMPLETE-CLEANUP.md   # Notes d'optimisation et nettoyage
├── 📄 LLM-FORMATTING-FIX.md              # Corrections spécifiques au formatage LLM
│
├── ⚙️ Configuration
│   ├── 📄 package.json                   # Dépendances npm et scripts de build
│   ├── 📄 package-lock.json              # Lock des versions exactes des dépendances
│   ├── 📄 tsconfig.json                  # Configuration TypeScript et compilation
│   ├── 📄 next.config.ts                 # Configuration Next.js et optimisations
│   ├── 📄 eslint.config.mjs              # Configuration ESLint pour la qualité du code
│   ├── 📄 .eslintrc.json                 # Règles ESLint supplémentaires
│   ├── 📄 postcss.config.mjs             # Configuration PostCSS pour les styles
│   ├── 📄 .gitignore                     # Fichiers et dossiers ignorés par Git
│   └── 📄 next-env.d.ts                  # Types TypeScript pour Next.js
│
└── 📚 Documentation des Étapes de Développement
    ├── 📄 STEP2-REPORT.md                # Documentation de la génération de rapports
    ├── 📄 STEP3A-BACKEND.md              # Implémentation du backend API
    ├── 📄 STEP3B-DATA-COLLECTION.md      # Système de collecte de données web
    ├── 📄 STEP3C-FRONTEND-INTEGRATION.md # Intégration frontend avec l'API
    ├── 📄 STEP4A-DISCOVERABILITY-ANALYZER.md # Analyse de la découvrabilité SEO
    ├── 📄 STEP4C-DISCOVERABILITY-DISPLAY.md # Affichage des résultats de découvrabilité
    ├── 📄 STEP5A-STRUCTURED-DATA-ANALYZER.md # Analyse des données structurées
    ├── 📄 STEP5B-STRUCTURED-DATA-DISPLAY.md # Affichage des données structurées
    ├── 📄 STEP5C-ADVANCED-STRUCTURED-DATA.md # Fonctionnalités avancées des données structurées
    ├── 📄 STEP6A-LLM-FORMATTING-ANALYZER.md # Analyse du formatage pour les LLM
    ├── 📄 STEP6B-LLM-FORMATTING-DISPLAY.md # Affichage des résultats de formatage LLM
    ├── 📄 STEP6C-ADVANCED-LLM-FORMATTING.md # Fonctionnalités avancées de formatage LLM
    ├── 📄 STEP7A-ACCESSIBILITY-ANALYZER.md # Analyse de l'accessibilité web
    ├── 📄 STEP7B-ACCESSIBILITY-FRONTEND.md # Interface utilisateur pour l'accessibilité
    ├── 📄 STEP8A-READABILITY-BACKEND.md # Backend pour l'analyse de lisibilité
    ├── 📄 STEP8B-READABILITY-FRONTEND.md # Frontend pour l'analyse de lisibilité
    ├── 📄 STEP10A-AEO-SCORE-BACKEND.md # Calcul du score AEO global
    └── 📄 STEP10B-AEO-SCORE-FRONTEND.md # Affichage du score AEO
```

## 🎨 Frontend - Next.js 15 (src/)
```
src/
├── 📱 app/                               # App Router Next.js 15
│   ├── 📄 layout.tsx                    # Layout racine avec métadonnées et providers
│   ├── 📄 page.tsx                      # Page d'accueil avec formulaire d'analyse
│   ├── 📄 globals.css                   # Styles CSS globaux et variables CSS
│   ├── 📄 favicon.ico                   # Icône de l'application
│   ├── 📁 api/                          # Routes API Next.js
│   │   ├── 📁 collect-data/
│   │   │   └── 📄 route.ts              # API endpoint pour collecter et analyser les données
│   │   └── 📁 health/
│   │       ├── 📄 route.ts              # Health check principal
│   │       └── 📁 ping/
│   │           └── 📄 route.ts          # Endpoint ping simple
│   └── 📁 report/
│       └── 📄 page.tsx                  # Page de rapport d'analyse complète
│
├── 🧩 components/                        # Composants React réutilisables
│   ├── 📄 index.ts                      # Exports centralisés de tous les composants
│   │
│   ├── 🎨 ui/                          # Composants d'interface utilisateur
│   │   ├── 📄 index.ts                 # Exports des composants UI
│   │   ├── 📄 CollectionResults.tsx    # Affichage principal des résultats d'analyse
│   │   ├── 📄 Header.tsx               # En-tête de l'application avec navigation
│   │   ├── 📄 Footer.tsx               # Pied de page avec liens et informations
│   │   ├── 📄 HeroSection.tsx          # Section hero de la page d'accueil
│   │   ├── 📄 LoadingSpinner.tsx       # Indicateur de chargement animé
│   │   ├── 📄 ErrorMessage.tsx         # Affichage des messages d'erreur
│   │   ├── 📄 BackButton.tsx           # Bouton de retour avec navigation
│   │   ├── 📄 ExampleLink.tsx          # Liens vers des exemples d'analyse
│   │   ├── 📄 AnalysisPlaceholder.tsx  # Placeholder pendant l'analyse
│   │   ├── 📄 AnalysisLogs.tsx         # Affichage des logs d'analyse en temps réel
│   │   ├── 📄 AEOScoreDisplay.tsx      # Affichage du score AEO global
│   │   ├── 📄 AIEngineLogos.tsx        # Logos des moteurs d'IA supportés
│   │   ├── 📄 FeatureBadges.tsx        # Badges des fonctionnalités analysées
│   │   └── 📁 analysis/                # Composants spécifiques à l'analyse
│   │       ├── 📄 index.ts             # Exports des composants d'analyse
│   │       ├── 📄 MainSectionComponent.tsx # Section principale d'analyse
│   │       ├── 📄 MetricCard.tsx       # Carte d'affichage des métriques
│   │       ├── 📄 StatusIcon.tsx       # Icônes de statut pour les métriques
│   │       └── 📄 DrawerSubSection.tsx # Sous-sections dans les tiroirs d'analyse
│   │
│   ├── 📝 forms/                       # Composants de formulaires
│   │   ├── 📄 index.ts                 # Exports des composants de formulaires
│   │   └── 📄 UrlForm.tsx             # Formulaire de saisie d'URL avec validation
│   │
│   └── 🏗️ layouts/                     # Composants de mise en page
│       ├── 📄 index.ts                 # Exports des composants de layout
│       └── 📄 ReportLayout.tsx         # Layout spécifique pour les rapports
│
├── 🪝 hooks/                           # Hooks React personnalisés
│   └── 📄 useAnalysis.ts               # Hook principal pour la gestion de l'analyse AEO
│
├── 🔧 services/                        # Services métier et logique applicative
│   ├── 📄 index.ts                     # Exports centralisés des services
│   ├── 📄 crawler.ts                   # Service de crawling web et extraction de contenu
│   ├── 📄 aeo-score-calculator.ts      # Calculateur du score AEO global
│   ├── 📄 discoverability-analyzer.ts  # Analyse de la découvrabilité SEO
│   ├── 📄 structured-data-analyzer.ts  # Analyse des données structurées (JSON-LD, Schema.org)
│   ├── 📄 llm-formatting-analyzer.ts   # Analyse du formatage pour les LLM
│   ├── 📄 accessibility-analyzer.ts    # Analyse de l'accessibilité web
│   ├── 📄 readability-analyzer.ts      # Analyse de la lisibilité du contenu
│   ├── 📄 performance-config.ts        # Configuration des performances et métriques
│   └── 📁 shared/                      # Services partagés
│       ├── 📄 index.ts                 # Exports des services partagés
│       └── 📄 semantic-html5-analyzer.ts # Analyse sémantique HTML5
│
├── 🔄 transformers/                    # Transformateurs de données
│   ├── 📄 index.ts                     # Exports des transformateurs
│   ├── 📄 accessibility-transformer.ts # Transformation des données d'accessibilité
│   ├── 📄 discoverability-transformer.ts # Transformation des données de découvrabilité
│   ├── 📄 llm-formatting-transformer.ts # Transformation des données de formatage LLM
│   ├── 📄 readability-transformer.ts   # Transformation des données de lisibilité
│   └── 📄 structured-data-transformer.ts # Transformation des données structurées
│
├── 📋 types/                           # Définitions TypeScript
│   └── 📄 analysis-architecture.ts     # Types pour l'architecture d'analyse
│
└── 🛠️ utils/                           # Utilitaires et helpers
    ├── 📄 index.ts                     # Exports des utilitaires
    ├── 📄 analytics.ts                 # Utilitaires pour l'analytics
    └── 📄 logger.ts                    # Système de logging centralisé
```

## 🎯 Assets Publics (public/)
```
public/
├── 📄 file.svg                         # Icône de fichier pour l'interface
├── 📄 globe.svg                        # Icône de globe pour les liens externes
├── 📄 next.svg                         # Logo Next.js
├── 📄 vercel.svg                       # Logo Vercel
└── 📄 window.svg                       # Icône de fenêtre pour l'interface
```

## 📊 Rôles et Responsabilités

### 🏗️ **Architecture Générale**
- **Next.js 15** : Framework React avec App Router pour le rendu côté serveur
- **TypeScript** : Typage statique pour la robustesse du code
- **API Routes** : Endpoints backend intégrés dans Next.js
- **Services** : Logique métier séparée et réutilisable

### 🎨 **Interface Utilisateur**
- **Design System** : Composants UI cohérents et réutilisables
- **Responsive Design** : Adaptation mobile et desktop
- **Accessibilité** : Conformité WCAG et bonnes pratiques
- **Performance** : Optimisation des temps de chargement

### 🔍 **Analyse AEO (AI Engine Optimization)**
- **Crawling** : Extraction intelligente du contenu web
- **Métriques Multiples** : Découvrabilité, données structurées, formatage LLM, accessibilité, lisibilité
- **Score Global** : Calcul d'un score AEO unifié
- **Rapports Détaillés** : Visualisation claire des résultats

### 🚀 **Performance et Scalabilité**
- **SSR/SSG** : Rendu côté serveur pour les performances
- **API Optimisée** : Endpoints rapides et efficaces
- **Cache Intelligent** : Mise en cache des analyses
- **Monitoring** : Logs et métriques de performance