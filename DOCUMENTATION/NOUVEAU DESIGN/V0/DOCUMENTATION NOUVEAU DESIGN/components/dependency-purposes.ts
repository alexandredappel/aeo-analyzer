/**
 * Dependency Purposes Documentation
 *
 * This file explains the purpose and usage of each dependency
 * in the marketing website template.
 */

export const dependencyPurposes = {
  // ===== CORE FRAMEWORK =====
  core: {
    next: {
      version: "15.2.4",
      purpose: "React framework with App Router, SSG, and image optimization",
      features: [
        "App Router for file-based routing",
        "Server Components for performance",
        "Image optimization with next/image",
        "Built-in SEO features",
        "Static site generation",
      ],
    },

    react: {
      version: "^19",
      purpose: "UI library for building component-based interfaces",
      features: [
        "Component composition",
        "Hooks for state management",
        "Server Components support",
        "Concurrent features",
      ],
    },

    "react-dom": {
      version: "^19",
      purpose: "React renderer for web browsers",
      features: ["DOM manipulation", "Event handling", "Hydration for SSR"],
    },
  },

  // ===== STYLING & UI =====
  styling: {
    tailwindcss: {
      version: "^3.4.17",
      purpose: "Utility-first CSS framework for rapid UI development",
      features: [
        "Utility classes for styling",
        "Responsive design utilities",
        "Dark mode support",
        "Custom design system",
      ],
    },

    "tailwindcss-animate": {
      version: "^1.0.7",
      purpose: "Animation utilities for Tailwind CSS",
      features: ["Pre-built animation classes", "Keyframe animations", "Transition utilities"],
    },

    "tailwindcss-radix": {
      version: "^3.0.5",
      purpose: "Tailwind utilities for Radix UI components",
      features: ["State-based styling", "Data attribute utilities", "Component-specific classes"],
    },

    "@tailwindcss/typography": {
      version: "^0.5.13",
      purpose: "Typography plugin for rich text content",
      features: ["Prose styling for blog content", "Responsive typography", "Dark mode typography"],
    },
  },

  // ===== UI COMPONENTS =====
  uiComponents: {
    "@radix-ui/react-*": {
      purpose: "Accessible, unstyled UI primitives",
      components: [
        "accordion - Collapsible content sections",
        "alert-dialog - Modal dialogs for important actions",
        "aspect-ratio - Maintain aspect ratios",
        "avatar - User profile images with fallbacks",
        "checkbox - Form checkboxes",
        "collapsible - Show/hide content",
        "context-menu - Right-click menus",
        "dialog - Modal dialogs",
        "dropdown-menu - Dropdown menus",
        "hover-card - Hover-triggered cards",
        "label - Form labels",
        "menubar - Menu bars",
        "navigation-menu - Site navigation",
        "popover - Floating content",
        "progress - Progress indicators",
        "radio-group - Radio button groups",
        "scroll-area - Custom scrollbars",
        "select - Select dropdowns",
        "separator - Visual separators",
        "slider - Range sliders",
        "slot - Component composition",
        "switch - Toggle switches",
        "tabs - Tabbed interfaces",
        "toast - Notification toasts",
        "toggle - Toggle buttons",
        "toggle-group - Toggle button groups",
        "tooltip - Hover tooltips",
      ],
      features: ["Full keyboard navigation", "Screen reader support", "Focus management", "Customizable styling"],
    },

    "@radix-ui/react-icons": {
      purpose: "Icon library designed for Radix UI",
      features: ["Consistent icon design", "SVG-based icons", "Tree-shakeable"],
    },
  },

  // ===== UTILITY LIBRARIES =====
  utilities: {
    "class-variance-authority": {
      version: "^0.7.1",
      purpose: "Create component variants with conditional classes",
      features: ["Type-safe variant creation", "Conditional styling", "Component API design"],
      usage: "Button variants (primary, secondary, sizes)",
    },

    clsx: {
      version: "^2.1.1",
      purpose: "Utility for constructing className strings conditionally",
      features: ["Conditional classes", "Array and object syntax", "Lightweight"],
    },

    "tailwind-merge": {
      version: "^2.5.5",
      purpose: "Merge Tailwind CSS classes without style conflicts",
      features: ["Conflict resolution", "Class deduplication", "Tailwind-aware merging"],
      usage: "cn() utility function for component styling",
    },
  },

  // ===== CMS & CONTENT =====
  cms: {
    basehub: {
      version: "latest",
      purpose: "Headless CMS for content management",
      features: [
        "Type-safe content queries",
        "Real-time content updates",
        "Image optimization",
        "Rich text editing",
        "Component-based content",
      ],
      usage: "All dynamic content, blog posts, page sections",
    },

    "hast-util-to-jsx-runtime": {
      version: "^2.3.0",
      purpose: "Convert HTML AST to JSX for rich text rendering",
      features: ["HTML to React conversion", "Custom component mapping", "Safe HTML rendering"],
      usage: "Rendering rich text content from CMS",
    },
  },

  // ===== THEMING & COLORS =====
  theming: {
    "next-themes": {
      version: "latest",
      purpose: "Theme management for Next.js applications",
      features: ["Dark/light mode switching", "System preference detection", "Persistent theme storage", "SSR support"],
    },

    culori: {
      version: "latest",
      purpose: "Color manipulation and conversion library",
      features: ["Color space conversions", "Color palette generation", "Accessibility helpers"],
      usage: "Dynamic theme color generation",
    },
  },

  // ===== ICONS =====
  icons: {
    "lucide-react": {
      version: "^0.454.0",
      purpose: "Beautiful, customizable SVG icons",
      features: ["1000+ icons", "Consistent design", "Customizable size and color", "Tree-shakeable"],
      usage: "Primary icon library for UI elements",
    },
  },

  // ===== INTERACTIVE COMPONENTS =====
  interactive: {
    "embla-carousel": {
      version: "latest",
      purpose: "Lightweight carousel library",
      features: ["Touch/swipe support", "Keyboard navigation", "Infinite loop", "Auto-play"],
    },

    "embla-carousel-react": {
      version: "latest",
      purpose: "React wrapper for Embla Carousel",
      usage: "Testimonials slider, image carousels",
    },

    "embla-carousel-wheel-gestures": {
      version: "latest",
      purpose: "Mouse wheel support for Embla Carousel",
      features: ["Horizontal scrolling with wheel", "Smooth wheel interactions"],
    },

    cmdk: {
      version: "latest",
      purpose: "Command palette component",
      features: ["Fast search interface", "Keyboard shortcuts", "Fuzzy search"],
      usage: "Site search functionality",
    },
  },

  // ===== FORMS =====
  forms: {
    "react-hook-form": {
      version: "latest",
      purpose: "Performant forms with easy validation",
      features: ["Minimal re-renders", "Built-in validation", "TypeScript support", "Easy integration"],
      usage: "Contact forms, newsletter signup",
    },

    "input-otp": {
      version: "latest",
      purpose: "OTP (One-Time Password) input component",
      features: ["Auto-focus management", "Paste support", "Customizable styling"],
    },
  },

  // ===== NOTIFICATIONS =====
  notifications: {
    sonner: {
      version: "latest",
      purpose: "Toast notification library",
      features: ["Beautiful default styling", "Promise-based toasts", "Swipe to dismiss", "Stacking animations"],
      usage: "Success/error messages, form feedback",
    },
  },

  // ===== LAYOUT & PANELS =====
  layout: {
    "react-resizable-panels": {
      version: "latest",
      purpose: "Resizable panel components",
      features: ["Drag to resize", "Keyboard support", "Persistent sizes"],
      usage: "Dashboard layouts, split views",
    },

    vaul: {
      version: "latest",
      purpose: "Drawer component for mobile interfaces",
      features: ["Smooth animations", "Touch gestures", "Backdrop blur"],
      usage: "Mobile navigation, bottom sheets",
    },
  },

  // ===== CHARTS & DATA VISUALIZATION =====
  charts: {
    recharts: {
      version: "latest",
      purpose: "React charting library built on D3",
      features: ["Responsive charts", "Multiple chart types", "Customizable styling", "Animation support"],
      usage: "Analytics dashboards, data visualization",
    },
  },

  // ===== DATE & TIME =====
  dateTime: {
    "react-day-picker": {
      version: "latest",
      purpose: "Date picker component for React",
      features: ["Flexible date selection", "Localization support", "Custom styling", "Accessibility"],
      usage: "Event scheduling, date inputs",
    },
  },

  // ===== DEVELOPMENT TOOLS =====
  development: {
    typescript: {
      version: "^5",
      purpose: "Static type checking for JavaScript",
      features: ["Type safety", "Better IDE support", "Refactoring tools", "Documentation"],
    },

    prettier: {
      version: "^3.2.5",
      purpose: "Code formatting tool",
      features: ["Consistent code style", "Automatic formatting", "IDE integration"],
    },

    "prettier-plugin-tailwindcss": {
      version: "^0.6.11",
      purpose: "Prettier plugin for Tailwind CSS class sorting",
      features: ["Automatic class sorting", "Consistent class order", "Better readability"],
    },

    autoprefixer: {
      version: "^10.4.21",
      purpose: "PostCSS plugin to add vendor prefixes",
      features: ["Automatic vendor prefixes", "Browser compatibility", "CSS optimization"],
    },

    postcss: {
      version: "^8.5",
      purpose: "CSS transformation tool",
      features: ["CSS processing pipeline", "Plugin ecosystem", "Modern CSS features"],
    },
  },

  // ===== TYPE DEFINITIONS =====
  types: {
    "@types/node": {
      version: "^22",
      purpose: "TypeScript definitions for Node.js",
    },

    "@types/react": {
      version: "^19",
      purpose: "TypeScript definitions for React",
    },

    "@types/react-dom": {
      version: "^19",
      purpose: "TypeScript definitions for React DOM",
    },

    "@types/culori": {
      version: "^4.0.0",
      purpose: "TypeScript definitions for Culori color library",
    },
  },
}

// ===== DEPENDENCY CATEGORIES =====
export const dependencyCategories = {
  essential: ["next", "react", "react-dom", "tailwindcss", "basehub"],

  ui: ["@radix-ui/react-*", "lucide-react", "class-variance-authority", "clsx", "tailwind-merge"],

  features: ["next-themes", "embla-carousel-react", "react-hook-form", "sonner", "cmdk"],

  development: ["typescript", "prettier", "@types/*", "autoprefixer", "postcss"],

  optional: ["recharts", "react-day-picker", "vaul", "react-resizable-panels"],
}

// ===== BUNDLE SIZE IMPACT =====
export const bundleSizeImpact = {
  large: {
    dependencies: ["recharts", "embla-carousel"],
    impact: "> 100KB",
    mitigation: "Tree shaking, code splitting",
  },

  medium: {
    dependencies: ["@radix-ui/react-*", "lucide-react"],
    impact: "50-100KB",
    mitigation: "Import only needed components",
  },

  small: {
    dependencies: ["clsx", "tailwind-merge", "sonner"],
    impact: "< 50KB",
    mitigation: "Minimal impact",
  },
}
