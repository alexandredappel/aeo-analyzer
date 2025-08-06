## 📱 Analyse des "Social Meta" pour les LLMs

### **Objectif Stratégique**

L'analyse des "Social Meta" (Open Graph et Twitter Cards) n'est plus seulement une question de prévisualisation sur les réseaux sociaux. Pour un LLM, ces balises constituent une **source de métadonnées de haute qualité, explicite et concise**. Elles servent de "résumé pour robots" qui corrobore et complète les informations du JSON-LD et du contenu de la page.

Notre analyse doit donc aller au-delà de la simple "présence" et évaluer la **richesse**, la **cohérence** et la **précision** de ces balises.

---

### 1. Les Balises Essentielles pour un LLM

Pour nourrir un LLM, nous devons nous concentrer sur les balises qui définissent sans ambiguïté **l'identité et le sujet** du contenu partagé.

#### **A. Les Fondations (Open Graph Core)**
*   **`og:title`** : Le titre. C'est l'information la plus directe sur le sujet de la page.
*   **`og:description`** : Le résumé. Un LLM utilise ce texte pour avoir un aperçu concis du contenu.
*   **`og:image`** : Le contexte visuel. C'est la première impression visuelle.
*   **`og:url`** : L'URL canonique. Essentiel pour éviter la duplication de contenu et consolider l'identité de la page.
*   **`og:type`** : La nature du contenu. Est-ce un `article`, un `product`, un `website` ? C'est une information de classification fondamentale.

#### **B. Le Contexte Twitter (Twitter Cards)**
*   **`twitter:card`** : La balise la plus importante. Elle dicte comment le contenu est affiché sur Twitter. La valeur `summary_large_image` est la plus impactante.
*   **`twitter:site`** : Le compte Twitter de l'organisation/du site. Crée un lien d'attribution vers l'entité `Organization`.
*   **`twitter:creator`** : Le compte Twitter de l'auteur. Crée un lien d'attribution vers l'entité `Person`.

#### **C. L'Enrichissement de l'Image (Image Details)**
*   **`og:image:alt`** : **Crucial pour un LLM**. C'est une description textuelle de l'image, lui permettant de comprendre le contenu visuel sans avoir à "voir" l'image.
*   **`og:image:width` & `og:image:height`** : Assure un affichage correct et rapide, un signal de qualité technique.

#### **D. Le Contexte du Site**
*   **`og:site_name`** : Renforce l'identité de la marque ou du site à chaque partage.

---

### 2. La Logique d'Analyse Universelle

L'analyse doit être modulaire et produire des recommandations précises basées sur notre `Knowledge Base`.

**Étape 1 : Extraction**
*   Utiliser `cheerio` pour extraire toutes les balises `meta` avec une propriété `property` (pour Open Graph) ou `name` (pour Twitter).
*   Stocker les résultats dans un simple objet clé-valeur pour un accès facile (ex: `{'og:title': 'Titre de la page', 'twitter:card': 'summary_large_image'}`).

**Étape 2 : Analyse et Recommandations**
Chaque check raté doit générer une `Recommendation` (`{problem, solution}`).

1.  **Check du Titre (`og:title`) :**
    *   **Problème :** Manquant.
    *   **Solution :** Ajouter une balise `og:title` pour définir le titre du contenu lors du partage.
2.  **Check de la Description (`og:description`) :**
    *   **Problème :** Manquante.
    *   **Solution :** Ajouter une balise `og:description` pour fournir un résumé concis de la page.
3.  **Check de l'Image (`og:image`) :**
    *   **Problème :** Manquante.
    *   **Solution :** Ajouter une balise `og:image` avec une URL complète vers une image représentative.
4.  **Check de l'URL (`og:url`) :**
    *   **Problème :** Manquante.
    *   **Solution :** Spécifier l'URL canonique de la page avec la balise `og:url` pour éviter la duplication.
5.  **Check du Type (`og:type`) :**
    *   **Problème :** Manquant.
    *   **Solution :** Définir la nature du contenu avec `og:type` (ex: `website`, `article`, `product`).
6.  **Check de la Carte Twitter (`twitter:card`) :**
    *   **Problème :** Manquante.
    *   **Solution :** Ajouter une balise `twitter:card` pour contrôler l'affichage sur Twitter (`summary_large_image` est recommandé).
7.  **Check de Richesse de l'Image (`og:image:alt`) :**
    *   **Problème :** `og:image` est présent mais `og:image:alt` est manquant.
    *   **Solution :** Ajouter une balise `og:image:alt` pour décrire l'image aux IA et aux lecteurs d'écran.
8.  **Check d'Attribution (`twitter:site` & `twitter:creator`) :**
    *   **Problème :** Balise `twitter:site` manquante.
    *   **Solution :** Lier votre contenu à votre compte Twitter principal en utilisant la balise `twitter:site`.
    *   **Problème :** Balise `twitter:creator` manquante (pour les articles).
    *   **Solution :** Donner le crédit à l'auteur en liant son compte Twitter avec la balise `twitter:creator`.

---

### 3. Le Système de Scoring (sur 100 points)

Le score doit refléter l'impact de chaque balise sur la compréhension d'un LLM et l'engagement social.

| Catégorie | Balise(s) | Points Max | Justification |
| :--- | :--- | :--- | :--- |
| **Fondamentaux du Contenu** | `og:title` | 20 | **Essentiel.** Le sujet principal. Pas de titre, pas de contexte. |
| (65 points) | `og:description` | 15 | **Essentiel.** Le résumé pour comprendre rapidement le contenu. |
| | `og:image` | 20 | **Impact majeur.** Le contexte visuel est primordial pour l'engagement et la compréhension. |
| | `og:url` | 10 | **Important.** Assure la cohérence et l'unicité de la page. |
| | | | |
| **Contexte & Classification**| `og:type` | 15 | **Très important.** Dit au LLM si c'est un site, un article, un produit. C'est la classification de base. |
| (35 points) | `twitter:card` | 10 | **Très important.** La clé de voûte de l'affichage sur une plateforme majeure. |
| | `og:image:alt` | 5 | **Haute valeur.** Information directe pour le LLM sur le contenu de l'image. |
| | `og:site_name`, `twitter:site`, `twitter:creator` | 5 | **Utile.** Signaux de confiance et d'attribution qui renforcent le graphe d'entités. |
| **Total** | | **100** | |

Ce système de score est pondéré pour que les balises définissant le **cœur du contenu (`title`, `description`, `image`)** aient le plus grand impact, suivies de près par celles qui le **classifient (`type`, `card`)**.