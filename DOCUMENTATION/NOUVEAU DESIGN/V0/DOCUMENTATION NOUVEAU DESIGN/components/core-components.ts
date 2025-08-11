import type React from "react"
/**
 * Core Component Documentation
 *
 * This file documents all reusable components with their props,
 * states, and variants.
 */

// Button Component
export interface ButtonComponentProps {
  // Visual variants
  intent?: "primary" | "secondary" | "tertiary"
  size?: "md" | "lg"

  // States
  disabled?: boolean

  // Icon configuration
  icon?: React.ReactNode | string // String for BaseHub icons
  iconSide?: "left" | "right"

  // Styling
  unstyled?: boolean
  className?: string

  // Behavior
  onlyButton?: boolean // Removes padding for icon-only buttons
}

// Usage examples:
const buttonExamples = {
  primary: `<Button intent="primary">Get Started</Button>`,
  secondary: `<Button intent="secondary">Learn More</Button>`,
  withIcon: `<Button icon="arrow-right" iconSide="right">Continue</Button>`,
  link: `<ButtonLink href="/about" intent="secondary">About Us</ButtonLink>`,
}

// Heading Component
export interface HeadingComponentProps {
  // Content
  children: React.ReactNode // Main heading text
  tag?: React.ReactNode // Small tag above heading
  subtitle?: React.ReactNode // Subtitle below heading

  // Layout
  align?: "center" | "left" | "right" | "none"

  // Styling
  className?: string
  title?: string // HTML title attribute
}

// Usage examples:
const headingExamples = {
  basic: `<Heading>Welcome to Our Platform</Heading>`,
  withTag: `<Heading tag="New Feature">AI-Powered Analytics</Heading>`,
  withSubtitle: `<Heading subtitle="Get insights from your data">Analytics Dashboard</Heading>`,
  leftAligned: `<Heading align="left">About Our Company</Heading>`,
}

// Dark/Light Image Component
export interface DarkLightImageProps {
  // Images
  light: any // Required light theme image
  dark?: any // Optional dark theme image

  // Standard image props
  alt?: string
  width?: number
  height?: number
  className?: string

  // Features
  withPlaceholder?: boolean // Enable blur placeholder
  priority?: boolean // Next.js priority loading
}

// Tag Component (used with Heading)
export interface TagComponentProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean // Render as different element
}

// Section Wrapper Component
export interface SectionWrapperProps {
  children: React.ReactNode
  className?: string

  // Layout options
  contained?: boolean // Apply container styles
  padding?: "none" | "sm" | "md" | "lg"

  // Background options
  background?: "primary" | "secondary" | "tertiary"
}

// Input Component
export interface InputComponentProps {
  // Standard input props
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void

  // Validation
  error?: string
  required?: boolean

  // Styling
  className?: string

  // Features
  icon?: React.ReactNode
  iconSide?: "left" | "right"
}

// Avatar Component
export interface AvatarComponentProps {
  // Image
  src?: string
  alt?: string

  // Fallback
  fallback?: string // Initials or text

  // Size variants
  size?: "sm" | "md" | "lg" | "xl"

  // Styling
  className?: string
}

// Tooltip Component
export interface TooltipComponentProps {
  children: React.ReactNode
  content: React.ReactNode

  // Positioning
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"

  // Behavior
  delayDuration?: number

  // Styling
  className?: string
}

// Search Component
export interface SearchComponentProps {
  // Data
  placeholder?: string
  results?: SearchResult[]

  // Behavior
  onSearch?: (query: string) => void
  onSelect?: (result: SearchResult) => void

  // Styling
  className?: string

  // Features
  showRecent?: boolean
  showCategories?: boolean
}

export interface SearchResult {
  id: string
  title: string
  description?: string
  url: string
  category?: string
  type: "page" | "blog" | "changelog"
}

// Theme Switcher Component
export interface ThemeSwitcherProps {
  // Styling
  className?: string

  // Behavior
  showLabels?: boolean

  // Options
  themes?: ("light" | "dark" | "system")[]
}

// Code Snippet Component
export interface CodeSnippetProps {
  // Content
  code: string
  language?: string

  // Features
  showLineNumbers?: boolean
  showCopyButton?: boolean

  // Styling
  className?: string

  // Behavior
  onCopy?: () => void
}

// Rich Text Component
export interface RichTextProps {
  // Content from CMS
  content: any // BaseHub rich text content

  // Styling
  className?: string

  // Features
  components?: Record<string, React.ComponentType> // Custom component overrides
}

// Form Components
export interface LabeledInputProps {
  label: string
  error?: string
  required?: boolean
  description?: string

  // Input props
  inputProps: InputComponentProps
}

export interface SelectComponentProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void

  // Styling
  placeholder?: string
  className?: string

  // Validation
  error?: string
  required?: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

// Component States
export interface ComponentStates {
  loading: "Show skeleton or spinner"
  error: "Display error message"
  empty: "Show empty state"
  success: "Show success feedback"
}

// Component Variants Documentation
export const componentVariants = {
  Button: {
    intent: {
      primary: "Accent background, white text, hover effects",
      secondary: "Light background, border, hover effects",
      tertiary: "Dark background, light text, hover effects",
    },
    size: {
      md: "Standard size (h-8, px-3.5)",
      lg: "Larger size (h-10, px-5)",
    },
  },

  Heading: {
    align: {
      center: "Centered text and layout",
      left: "Left-aligned text and layout",
      right: "Right-aligned text and layout",
      none: "No alignment styles applied",
    },
  },

  Avatar: {
    size: {
      sm: "24px diameter",
      md: "32px diameter",
      lg: "40px diameter",
      xl: "48px diameter",
    },
  },
}
