/**
 * Assets Documentation
 *
 * This file documents all assets used in the marketing website,
 * including images, icons, fonts, and other media files.
 */

// ===== IMAGES =====
export const images = {
  // Placeholder images (used during development)
  placeholders: {
    logo: {
      png: "/placeholder-logo.png",
      svg: "/placeholder-logo.svg",
      description: "Default logo placeholder for development",
    },

    user: {
      jpg: "/placeholder-user.jpg",
      description: "Default user avatar placeholder",
    },

    general: {
      jpg: "/placeholder.jpg",
      svg: "/placeholder.svg",
      description: "General purpose placeholder image",
      dynamicUrl: "/placeholder.svg?height=%7Bheight%7D&width=%7Bwidth%7D",
    },
  },

  // Hero images
  hero: {
    background: "Dynamic from BaseHub CMS",
    overlay: "Optional gradient or color overlay",
    mobile: "Responsive variants for mobile devices",
  },

  // Feature images
  features: {
    screenshots: "Product screenshots from CMS",
    illustrations: "Custom illustrations for features",
    icons: "Feature icons (usually from Lucide React)",
  },

  // Company logos
  companies: {
    logos: "Client/partner company logos from CMS",
    format: "SVG preferred for scalability",
    variants: "Light and dark theme variants",
  },

  // Team/testimonial images
  people: {
    avatars: "Team member and customer photos",
    format: "JPG/WebP optimized",
    sizes: "Multiple sizes for responsive images",
  },

  // Blog/changelog images
  content: {
    featured: "Featured images for blog posts",
    inline: "Images within blog content",
    thumbnails: "Small preview images",
  },
}

// ===== ICONS =====
export const icons = {
  // Lucide React icons (primary icon library)
  lucide: {
    library: "lucide-react",
    version: "^0.454.0",
    usage: "import { ImageIcon as IconName } from 'lucide-react'",
    examples: [
      "ArrowRight",
      "Check",
      "ChevronDown",
      "Menu",
      "X",
      "Search",
      "User",
      "Mail",
      "Phone",
      "MapPin",
      "Calendar",
      "Clock",
      "Star",
      "Heart",
      "Share",
      "Download",
      "Upload",
      "Settings",
      "Home",
      "Info",
      "AlertCircle",
      "CheckCircle",
      "XCircle",
    ],
  },

  // Radix UI icons (for specific UI components)
  radix: {
    library: "@radix-ui/react-icons",
    version: "latest",
    usage: "import { IconName } from '@radix-ui/react-icons'",
    examples: [
      "SunIcon",
      "MoonIcon",
      "Half2Icon",
      "ChevronDownIcon",
      "ChevronUpIcon",
      "Cross2Icon",
      "HamburgerMenuIcon",
    ],
  },

  // BaseHub icons (from CMS)
  basehub: {
    usage: "Icon component from basehub/react-icon",
    format: "SVG strings stored in CMS",
    example: "<Icon content={iconString} />",
  },

  // Social media icons
  social: {
    source: "Custom SVGs or from CMS",
    platforms: ["Twitter/X", "LinkedIn", "GitHub", "Facebook", "Instagram", "YouTube", "Discord", "Slack"],
  },

  // Custom icons
  custom: {
    format: "SVG components",
    location: "components/icons/",
    naming: "PascalCase (e.g., CustomArrowIcon)",
  },
}

// ===== FONTS =====
export const fonts = {
  // Primary fonts (Google Fonts)
  primary: {
    sans: {
      name: "Geist",
      source: "next/font/google",
      weights: ["300", "400", "500", "600", "700"],
      variable: "--font-sans",
      fallbacks: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Oxygen",
        "Ubuntu",
        "Cantarell",
        "Fira Sans",
        "Droid Sans",
        "Helvetica Neue",
        "sans-serif",
      ],
    },

    mono: {
      name: "Geist Mono",
      source: "next/font/google",
      weights: ["400", "500", "600"],
      variable: "--font-mono",
      fallbacks: ["monaco", "monospace"],
    },
  },

  // Secondary fonts
  secondary: {
    serif: {
      name: "IBM Plex Serif",
      usage: "For special headings or quotes",
      weights: ["400", "500", "600"],
    },
  },

  // Font loading optimization
  optimization: {
    display: "swap",
    preload: true,
    subsets: ["latin"],
    fallbackFonts: "System fonts for instant loading",
  },
}

// ===== MEDIA FILES =====
export const media = {
  // Videos
  videos: {
    hero: {
      format: "MP4, WebM",
      optimization: "Compressed for web",
      autoplay: "Muted autoplay for hero sections",
      fallback: "Poster image for unsupported browsers",
    },

    testimonials: {
      format: "MP4 with captions",
      controls: "Custom video controls",
      thumbnail: "Preview image",
    },
  },

  // Audio
  audio: {
    notifications: {
      format: "MP3, OGG",
      usage: "Sound effects for interactions",
      size: "Small file sizes (<50KB)",
    },
  },

  // Documents
  documents: {
    pdfs: {
      usage: "Downloadable resources",
      optimization: "Compressed for web delivery",
      preview: "Thumbnail generation",
    },
  },
}

// ===== OPTIMIZATION =====
export const optimization = {
  // Image optimization
  images: {
    nextjs: {
      component: "next/image",
      formats: ["WebP", "AVIF", "JPEG", "PNG"],
      sizes: "Responsive sizes attribute",
      priority: "Above-the-fold images",
      placeholder: "Blur placeholder for better UX",
    },

    basehub: {
      component: "BaseHubImage",
      transformation: "URL-based image transformations",
      quality: "Configurable quality settings",
      format: "Auto format selection",
    },
  },

  // Icon optimization
  icons: {
    svg: {
      optimization: "SVGO for size reduction",
      inlining: "Inline small icons for performance",
      sprites: "Icon sprites for repeated icons",
    },

    iconfonts: {
      usage: "Avoided in favor of SVG icons",
      reason: "Better accessibility and performance",
    },
  },

  // Font optimization
  fonts: {
    loading: {
      strategy: "Font display: swap",
      preload: "Critical fonts preloaded",
      subset: "Latin subset only",
    },

    fallbacks: {
      system: "System font fallbacks",
      metrics: "Font metrics for layout stability",
    },
  },
}

// ===== ASSET DELIVERY =====
export const delivery = {
  // CDN configuration
  cdn: {
    images: "Vercel Image Optimization",
    fonts: "Google Fonts CDN",
    icons: "Bundled with application",
    videos: "External CDN or Vercel Blob",
  },

  // Caching strategy
  caching: {
    images: "Long-term caching with versioning",
    fonts: "1 year cache with immutable headers",
    icons: "Bundled and cached with app",
    static: "Long-term caching for static assets",
  },

  // Loading strategy
  loading: {
    critical: "Inline critical assets",
    aboveFold: "Priority loading for visible content",
    belowFold: "Lazy loading for non-critical assets",
    preload: "Preload next page assets",
  },
}

// ===== ACCESSIBILITY =====
export const accessibility = {
  // Image accessibility
  images: {
    altText: "Descriptive alt text for all images",
    decorative: "Empty alt for decorative images",
    complex: "Long descriptions for complex images",
  },

  // Icon accessibility
  icons: {
    labels: "aria-label for interactive icons",
    hidden: "aria-hidden for decorative icons",
    text: "Screen reader text for icon-only buttons",
  },

  // Media accessibility
  media: {
    captions: "Closed captions for videos",
    transcripts: "Text transcripts for audio",
    controls: "Keyboard accessible media controls",
  },
}

// ===== FILE STRUCTURE =====
export const fileStructure = {
  public: {
    "placeholder-logo.png": "Default logo placeholder",
    "placeholder-logo.svg": "SVG version of logo placeholder",
    "placeholder-user.jpg": "Default user avatar",
    "placeholder.jpg": "General placeholder image",
    "placeholder.svg": "SVG placeholder with dynamic sizing",
    "robots.txt": "Search engine crawler instructions",
    "sitemap.xml": "XML sitemap for SEO",
    "sitemap-0.xml": "Paginated sitemap",
  },

  assets: {
    images: "Organized by category (hero, features, team, etc.)",
    icons: "Custom SVG icons",
    fonts: "Local font files if needed",
    videos: "Video files or external URLs",
  },

  generated: {
    "next/image": "Next.js optimized images cache",
    "_next/static": "Static assets with hashing",
  },
}
