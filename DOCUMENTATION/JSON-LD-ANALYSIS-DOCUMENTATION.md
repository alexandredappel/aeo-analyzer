# 📋 Analyse JSON-LD - Documentation Complète

## 🎯 Vue d'Ensemble

L'analyse JSON-LD est une **analyse sémantique profonde** qui évalue la richesse et la connectivité des données structurées Schema.org. Contrairement aux anciennes analyses basées sur la simple présence de champs, cette nouvelle approche simule comment un **LLM (Large Language Model)** comprendrait le graphe de connaissances d'une page.

### 🏗️ Architecture Modulaire

L'analyse JSON-LD est divisée en **4 catégories distinctes** :

| Catégorie | Score Max | Description |
|-----------|-----------|-------------|
| **Identity & Structure Foundation** | 30 pts | Qui êtes-vous ? Qu'est-ce que ce site ? Comment est-il structuré ? |
| **Main Entity Analysis** | 50 pts | Analyse approfondie du contenu principal (Article, Product, Service, etc.) |
| **Content Enrichment Schemas** | 20 pts | Contenu bonus (FAQ, HowTo) qui enrichit l'expérience |
| **Knowledge Graph Connectivity** | 10 pts | Vérification des liens `@id` entre entités |

**Total : 110 points** (sur 170 points pour toute la section Structured Data)

---

## 🔧 Explication Technique

### 📊 Processus d'Analyse

#### **1. Parsing et Normalisation**
```typescript
function parseAndNormalizeEntities(html: string): SchemaEntity[]
```
- **Extraction** : Trouve tous les scripts `<script type="application/ld+json">`
- **Parsing** : Parse le JSON et gère les erreurs robustement
- **Normalisation** : Aplatit les structures complexes (`@graph`, arrays, objets uniques)
- **Résultat** : Liste plate de toutes les entités Schema.org

#### **2. Analyse Sémantique par Catégorie**

##### **A. Identity & Structure Foundation (30 pts)**
```typescript
function analyzeIdentityAndStructure(entities: SchemaEntity[]): MetricCard
```
**Vérifications :**
- **Organization/Person** (15 pts) : `name`, `url`, `logo`, `sameAs`, champs bonus
- **WebSite** (10 pts) : `potentialAction` avec `SearchAction`
- **BreadcrumbList** (5 pts) : Navigation hiérarchique

##### **B. Main Entity Analysis (50 pts)**
```typescript
function analyzeMainEntity(entities: SchemaEntity[]): MetricCard
```
**Types supportés :** `Article`, `BlogPosting`, `NewsArticle`, `Product`, `LocalBusiness`, `Service`

**Analyse contextuelle :**
- **Articles** : `headline`, `image`, `author` (objet), `publisher` (objet)
- **Products** : `name`, `description`, `offers`, `aggregateRating`, `brand`
- **Services** : `name`, `description`, `provider` (objet), `areaServed`
- **LocalBusiness** : `name`, `address`, `telephone`, `openingHours`

##### **C. Content Enrichment Schemas (20 pts)**
```typescript
function analyzeEnrichmentSchemas(entities: SchemaEntity[]): MetricCard | null
```
**Schemas analysés :**
- **FAQPage** : `mainEntity` avec `Question`/`Answer` structurés
- **HowTo** : `step` array avec `text`/`name`, `totalTime`

##### **D. Knowledge Graph Connectivity (10 pts)**
```typescript
function analyzeGraphConnectivity(entities: SchemaEntity[]): MetricCard
```
**Vérifications :**
- Présence d'`@id` sur les entités principales
- Liens entre entités via références `@id`
- Connectivité du graphe de connaissances

#### **3. Génération des Perfect Items**
```typescript
function generateJsonLdPerfectItems(entities: SchemaEntity[], cards: MetricCard[]): string[]
```
- Analyse les cartes sans recommandations
- Génère des messages positifs pour les éléments réussis
- Inclut les succès partiels même avec des recommandations

---

## 📋 Problèmes et Solutions Exhaustifs

### 🔍 **Identity & Structure Foundation**

| Problème | Solution |
|----------|----------|
| `No 'Organization' or 'Person' entity was found to define the site owner.` | `Add an 'Organization' schema for a company or a 'Person' schema for an individual.` |
| `The '[ownerType]' entity is missing a 'name'.` | `Provide a 'name' for your '[ownerType]' to state who you are.` |
| `The '[ownerType]' entity is missing a 'url'.` | `Add a 'url' property pointing to your homepage to link your entity to your site.` |
| `The 'Organization' entity is missing a 'logo'.` | `Add a 'logo' property with a full URL to your logo image to improve brand recognition.` |
| `The '[ownerType]' entity is missing 'sameAs' links to social or professional profiles.` | `Add a 'sameAs' array with URLs to your social profiles to consolidate your identity.` |
| `No 'WebSite' entity was found.` | `Add a 'WebSite' schema to describe the site itself and its functionalities.` |
| `The 'WebSite' entity is missing the 'potentialAction' property.` | `Add a 'potentialAction' property containing a 'SearchAction' to define your internal site search.` |
| `The 'WebSite' entity's 'potentialAction' is not a 'SearchAction'.` | `Ensure the 'potentialAction' property contains an object with '@type': 'SearchAction'.` |
| `No 'BreadcrumbList' entity was found on this page.` | `Implement a 'BreadcrumbList' to show the page's location within the site hierarchy.` |

### 🎯 **Main Entity Analysis**

#### **Articles (Article, BlogPosting, NewsArticle)**
| Problème | Solution |
|----------|----------|
| `The '[articleType]' is missing a 'headline'.` | `Add a 'headline' property with the main title of the content.` |
| `The '[articleType]' is missing an 'image'.` | `Add an 'image' property with a URL to a relevant high-quality image.` |
| `The '[articleType]' author is plain text instead of a linked 'Person' entity.` | `Change the 'author' from a simple name to a nested 'Person' schema to establish expertise.` |
| `The '[articleType]' is missing an 'author'.` | `Specify the content's 'author' using a nested 'Person' schema.` |
| `The '[articleType]' publisher is plain text instead of a linked 'Organization' entity.` | `Change the 'publisher' to a nested 'Organization' schema to clarify who published the content.` |
| `The '[articleType]' is missing a 'publisher'.` | `Specify the content's 'publisher' using a nested 'Organization' schema.` |
| `The '[articleType]' is missing 'datePublished' information.` | `Add a 'datePublished' property in ISO 8601 format (e.g., '2023-10-28T12:00:00Z').` |

#### **Products**
| Problème | Solution |
|----------|----------|
| `The 'Product' is missing a 'name'.` | `Add a 'name' property with the full name of the product.` |
| `The 'Product' is missing a 'description'.` | `Add a 'description' property with a compelling summary of the product.` |
| `The 'Product' is missing an 'image'.` | `Add an 'image' property with a URL to a high-quality product photo.` |
| `The 'Product' is missing the 'offers' property.` | `Add an 'offers' property containing an 'Offer' schema to provide price and availability.` |
| `The 'Offer' within the 'Product' is missing a 'price'.` | `Add a 'price' property inside your 'Offer' schema.` |
| `The 'Offer' within the 'Product' is missing its 'priceCurrency'.` | `Add a 'priceCurrency' property (e.g., 'USD', 'EUR') inside your 'Offer' schema.` |
| `The 'Offer' within the 'Product' is missing 'availability' information.` | `Add an 'availability' property with a valid Schema URL (e.g., 'InStock').` |
| `The 'Product' is missing 'aggregateRating' or 'review' information.` | `Add an 'aggregateRating' or 'review' schema to display customer feedback.` |
| `The 'Product' is missing a 'brand'.` | `Add a 'brand' property, ideally as a nested 'Organization' schema.` |

#### **Services**
| Problème | Solution |
|----------|----------|
| `The 'Service' is missing a 'name'.` | `Add a 'name' property to clearly state the name of the service offered.` |
| `The 'Service' is missing a 'description'.` | `Add a 'description' property to explain what the service entails.` |
| `The 'Service' 'provider' should be a linked 'Organization' or 'Person' entity.` | `Change the 'provider' property to link to your main 'Organization' or 'Person' entity.` |
| `The 'Service' is missing an 'areaServed' property.` | `Specify the geographic area you serve using the 'areaServed' property.` |

#### **LocalBusiness**
| Problème | Solution |
|----------|----------|
| `The 'LocalBusiness' is missing a 'name'.` | `Add a 'name' property with the official name of the business.` |
| `The 'LocalBusiness' is missing an 'address'.` | `Add an 'address' property, ideally as a nested 'PostalAddress' schema.` |
| `The 'LocalBusiness' is missing a 'telephone' number.` | `Add a 'telephone' property with your primary business phone number.` |
| `The 'LocalBusiness' is missing its 'openingHours'.` | `Add an 'openingHours' property to specify your hours of operation.` |

#### **Entité Principale Manquante**
| Problème | Solution |
|----------|----------|
| `No main entity (e.g., Article, Product, Service) was found on this page.` | `Add a primary schema that accurately describes the main content of this page.` |

### 🎁 **Content Enrichment Schemas**

#### **FAQPage**
| Problème | Solution |
|----------|----------|
| `The 'FAQPage' exists but is missing well-structured questions and answers.` | `Add a 'mainEntity' array containing 'Question' entities with 'acceptedAnswer' properties.` |

#### **HowTo**
| Problème | Solution |
|----------|----------|
| `The 'HowTo' guide is missing its sequence of 'step's.` | `Add a 'step' property containing an array of 'HowToStep' items.` |
| `A 'HowToStep' is missing its 'text' or 'name' description.` | `Ensure every item in your 'step' array has a 'text' property describing the instruction.` |
| `The 'HowTo' guide is missing the 'totalTime' property.` | `Add a 'totalTime' property in ISO 8601 duration format (e.g., 'PT2H30M').` |

### 🔗 **Knowledge Graph Connectivity**

| Problème | Solution |
|----------|----------|
| `The '[EntityType]' entity is missing a unique identifier ('@id').` | `Add an '@id' with the page's unique URL to this entity. Think of it as a unique 'address' that allows other schemas (like an author linking to an article or organization linking to its homepage) to connect to it, creating a rich knowledge graph for AIs.` |
| `Entities are not linking to each other using '@id' references.` | `Use '@id' properties to create connections between related entities (e.g., author linking to Organization).` |

---

## ✨ "What's Perfect" - Messages Positifs

### 🏆 **Succès Complets (Aucune recommandation)**

#### **Identity & Structure Foundation**
- `Organization entity with complete identity information`
- `Person entity with complete identity information`
- `WebSite with functional search capability`
- `BreadcrumbList for clear site navigation`

#### **Main Entity Analysis**
- `Well-structured Article as main content entity`
- `Well-structured BlogPosting as main content entity`
- `Well-structured NewsArticle as main content entity`
- `Well-structured Product as main content entity`
- `Well-structured LocalBusiness as main content entity`
- `Well-structured Service as main content entity`

#### **Content Enrichment Schemas**
- `FAQPage providing helpful Q&A content`
- `HowTo guide with clear step-by-step instructions`

#### **Knowledge Graph Connectivity**
- `3 entities with proper @id identifiers for connectivity`
- `4 entities with proper @id identifiers for connectivity`
- `5 entities with proper @id identifiers for connectivity`

### 🎯 **Succès Partiels (Malgré des recommandations)**

#### **Identity & Structure Foundation**
- `Organization entity found and properly named`
- `Person entity found and properly named`

#### **Main Entity Analysis**
- `Article detected as main page content`
- `BlogPosting detected as main page content`
- `NewsArticle detected as main page content`
- `Product detected as main page content`
- `LocalBusiness detected as main page content`
- `Service detected as main page content`

---

## 📁 Fichiers Reliés à l'Analyse JSON-LD

### 🔧 **Backend - Analyse**

#### **Module Principal**
```
src/services/structured-data-analyzer/
├── index.ts                    # Orchestrateur principal
├── json-ld-analysis.ts        # Analyses JSON-LD (570 lignes)
└── shared/
    ├── types.ts               # Interfaces SchemaEntity, etc.
    ├── constants.ts           # Scoring, weights, entity types
    └── utils.ts               # parseAndNormalizeEntities, etc.
```

#### **Fonctions d'Analyse**
- `analyzeIdentityAndStructure()` - Foundation (30 pts)
- `analyzeMainEntity()` - Content principal (50 pts)
- `analyzeEnrichmentSchemas()` - FAQ/HowTo (20 pts)
- `analyzeGraphConnectivity()` - @id links (10 pts)
- `generateJsonLdPerfectItems()` - Perfect items

### 🎨 **Frontend - Affichage**

#### **Composants UI**
```
src/components/ui/analysis/
├── MetricCard.tsx             # Affichage d'une métrique
├── DrawerSubSection.tsx       # Section "What's Perfect"
└── index.ts                   # Exports des composants
```

#### **Types TypeScript**
```
src/types/analysis-architecture.ts
├── MetricCard                 # Interface métrique
├── DrawerSubSection          # Interface section
├── Recommendation            # Interface problème/solution
└── PerformanceStatus         # excellent/good/warning/error
```

### 🔄 **Transformation des Données**

#### **Transformer**
```
src/transformers/structured-data-transformer.ts
├── StructuredDataTransformer  # Classe principale
├── enhanceCard()             # Unification recommendations
└── transformNewFormat()      # Traitement nouveau format
```

#### **Exports Services**
```
src/services/index.ts
├── analyzeStructuredData     # Fonction principale
├── StructuredDataAnalysisResult  # Type résultat
└── JSONLDData               # Type legacy
```

### 🔗 **Intégration API**

#### **Route API**
```
src/app/api/collect-data/route.ts
├── POST /api/collect-data    # Endpoint principal
└── analyzeStructuredData()   # Appel analyse
```

#### **Hook Frontend**
```
src/hooks/useAnalysis.ts
├── useAnalysis()             # Hook React
└── fetchAnalysis()           # Appel API
```

### 📊 **Flux de Données Complet**

```
1. Frontend (URL) 
   ↓
2. API /api/collect-data 
   ↓
3. analyzeStructuredData() 
   ↓
4. json-ld-analysis.ts (4 analyses)
   ↓
5. structured-data-transformer.ts 
   ↓
6. Frontend Components (MetricCard, DrawerSubSection)
   ↓
7. Affichage "What's Perfect" + Recommendations
```

### 🎯 **Points d'Entrée Principaux**

#### **Pour Développeurs**
```typescript
// Import principal
import { analyzeStructuredData } from '@/services/structured-data-analyzer';

// Import spécifique JSON-LD
import { analyzeJsonLD } from '@/services/structured-data-analyzer/json-ld-analysis';

// Import types
import { StructuredDataAnalysisResult } from '@/services/structured-data-analyzer';
```

#### **Pour Modifications**
- **Ajouter un nouveau type d'entité** : `src/services/structured-data-analyzer/shared/constants.ts`
- **Modifier le scoring** : `src/services/structured-data-analyzer/json-ld-analysis.ts`
- **Ajouter un message "Perfect"** : `generateJsonLdPerfectItems()` dans `json-ld-analysis.ts`
- **Modifier l'affichage** : `src/components/ui/analysis/DrawerSubSection.tsx`

---

## 🎉 **Conclusion**

L'analyse JSON-LD est maintenant une **architecture modulaire robuste** qui :

✅ **Analyse sémantiquement** le contenu (pas juste la présence)  
✅ **Évalue la connectivité** entre entités  
✅ **Fournit des recommandations** spécifiques et actionnables  
✅ **Affiche les succès** pour motiver l'utilisateur  
✅ **S'adapte au contenu** (sections conditionnelles)  
✅ **Maintient la compatibilité** avec l'existant  

Cette documentation sert de **référence complète** pour comprendre, maintenir et étendre l'analyse JSON-LD ! 📚✨ 