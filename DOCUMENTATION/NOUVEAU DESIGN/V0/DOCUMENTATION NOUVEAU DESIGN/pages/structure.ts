/**
 * Page Structure & Navigation Hierarchy
 *
 * This file documents the complete page structure and navigation
 * hierarchy of the marketing website template.
 */

// Import statements for components
import type { HeaderNavbarLinkComponent } from "./components/HeaderNavbarLinkComponent"
import type { ButtonComponent } from "./components/ButtonComponent"
import type { FooterLinkComponent } from "./components/FooterLinkComponent"
import type { SocialLinkComponent } from "./components/SocialLinkComponent"
import type { NewsletterComponent } from "./components/NewsletterComponent"

export interface PageStructure {
  // Dynamic routing structure
  dynamicRoutes: {
    "[[...slug]]": {
      description: "Catch-all route for CMS-managed pages"
      file: "app/[[...slug]]/page.tsx"
      generates: string[] // Static paths from CMS
    }
  }

  // Static routes
  staticRoutes: {
    blog: {
      index: "app/blog/page.tsx"
      post: "app/blog/[slug]/page.tsx"
      rss: "app/blog/rss.xml/route.ts"
    }
    changelog: {
      index: "app/changelog/page.tsx"
      entry: "app/changelog/[slug]/page.tsx"
      rss: "app/changelog/rss.xml/route.ts"
    }
  }

  // Navigation structure
  navigation: {
    header: {
      logo: "DarkLightImageComponent"
      navbar: {
        items: HeaderNavbarLinkComponent[]
      }
      rightCtas: ButtonComponent[]
    }
    footer: {
      logo: "DarkLightImageComponent"
      navbar: {
        items: FooterLinkComponent[]
      }
      socialLinks: SocialLinkComponent[]
      newsletter: NewsletterComponent
      copyright: string
    }
  }
}

// Section components that can be used on any page
export interface SectionComponents {
  HeroComponent: "Hero section with title, subtitle, and CTAs"
  FeaturesCardsComponent: "Feature cards in grid layout"
  FeaturesGridComponent: "Feature grid with icons"
  FeaturesBigImageComponent: "Large feature with image"
  FeaturesSideBySideComponent: "Side-by-side feature layout"
  FeatureHeroComponent: "Feature hero section"
  CompaniesComponent: "Company logos carousel"
  CalloutComponent: "Call-to-action section"
  CalloutV2Component: "Alternative CTA design"
  TestimonialSliderComponent: "Testimonials carousel"
  TestimonialsGridComponent: "Testimonials in grid"
  PricingComponent: "Pricing cards"
  PricingTableComponent: "Pricing comparison table"
  FaqComponent: "FAQ accordion"
  FreeformTextComponent: "Rich text content"
  FormComponent: "Contact/lead forms"
}

// Layout structure
export interface LayoutStructure {
  root: {
    file: "app/layout.tsx"
    includes: [
      "BaseHub Toolbar (dev only)",
      "Theme Providers",
      "Header Component",
      "Main Content Area",
      "Newsletter Section",
      "Footer Component",
    ]
  }

  providers: {
    file: "app/providers.tsx"
    includes: ["BaseHubThemeProvider", "ThemeProvider (next-themes)", "SearchHitsContext"]
  }
}

// Metadata and SEO structure
export interface MetadataStructure {
  dynamic: {
    title: "From CMS or default"
    description: "From CMS or default"
    openGraph: "Generated from content"
  }

  static: {
    sitemap: "app/sitemap.ts"
    robots: "public/robots.txt"
    rss: "Generated for blog/changelog"
  }
}
