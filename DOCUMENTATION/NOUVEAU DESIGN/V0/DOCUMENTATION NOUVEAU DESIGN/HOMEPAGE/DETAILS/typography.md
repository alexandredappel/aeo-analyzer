# Homepage Typography System

This document defines the exact typography specifications used throughout the homepage, including fonts, sizes, weights, spacing, and application contexts.

## Font Stack

### Primary Font Family
\`\`\`css
font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
\`\`\`

### Fallback Strategy
1. **Geist** (primary web font)
2. **-apple-system** (macOS/iOS system font)
3. **BlinkMacSystemFont** (Chrome on macOS)
4. **Segoe UI** (Windows system font)
5. **Roboto** (Android system font)
6. **Helvetica Neue** (legacy macOS)
7. **Arial** (universal fallback)
8. **sans-serif** (generic fallback)

### Monospace Font (for code)
\`\`\`css
font-family: "Geist Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
\`\`\`

## Typography Scale

### Font Sizes with Line Heights and Letter Spacing

\`\`\`css
/* 2xs - 11px */
.text-2xs {
  font-size: 11px;
  line-height: 1.3; /* 14.3px */
  letter-spacing: -0.3px;
  font-weight: 300;
}

/* xs - 12px */
.text-xs {
  font-size: 0.75rem; /* 12px */
  line-height: 1rem; /* 16px */
  letter-spacing: -0.36px;
  font-weight: 300;
}

/* sm - 14px */
.text-sm {
  font-size: 0.875rem; /* 14px */
  line-height: 1.25rem; /* 20px */
  letter-spacing: -0.42px;
  font-weight: 400;
}

/* base - 16px */
.text-base {
  font-size: 1rem; /* 16px */
  line-height: 1.6; /* 25.6px */
  letter-spacing: -0.48px;
  font-weight: 400;
}

/* lg - 18px */
.text-lg {
  font-size: 1.125rem; /* 18px */
  line-height: 1.75rem; /* 28px */
  letter-spacing: -0.72px;
  font-weight: 400;
}

/* xl - 20px */
.text-xl {
  font-size: 1.25rem; /* 20px */
  line-height: 1.75rem; /* 28px */
  letter-spacing: -0.8px;
  font-weight: 500;
}

/* 2xl - 24px */
.text-2xl {
  font-size: 1.5rem; /* 24px */
  line-height: 2rem; /* 32px */
  letter-spacing: -1.04px;
  font-weight: 600;
}

/* 3xl - 32px */
.text-3xl {
  font-size: 2rem; /* 32px */
  line-height: 2.25rem; /* 36px */
  letter-spacing: -1.2px;
  font-weight: 700;
}

/* 4xl - 36px */
.text-4xl {
  font-size: 2.25rem; /* 36px */
  line-height: 2.5rem; /* 40px */
  letter-spacing: -1.44px;
  font-weight: 700;
}

/* 5xl - 48px */
.text-5xl {
  font-size: 3rem; /* 48px */
  line-height: 1.1; /* 52.8px */
  letter-spacing: -1.6px;
  font-weight: 800;
}

/* 6xl - 60px */
.text-6xl {
  font-size: 3.75rem; /* 60px */
  line-height: 1.1; /* 66px */
  letter-spacing: -1.8px;
  font-weight: 800;
}
\`\`\`

## Font Weight Scale

\`\`\`css
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
\`\`\`

## Typography Application by Section

### Header Section

#### Logo Text
- **Font Size**: text-xl (20px)
- **Font Weight**: font-semibold (600)
- **Letter Spacing**: -0.8px
- **Line Height**: 1.75rem (28px)

#### Navigation Links
- **Font Size**: text-sm (14px)
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.42px
- **Line Height**: 1.25rem (20px)
- **Color**: text-foreground
- **Hover**: text-primary

#### CTA Buttons
- **Font Size**: text-sm (14px)
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.42px

### Hero Section

#### Tag/Badge
- **Font Size**: text-sm (14px)
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.42px
- **Line Height**: 1.25rem (20px)
- **Transform**: uppercase
- **Color**: text-muted-foreground

#### Main Heading
- **Font Size**: text-5xl (48px) on desktop
- **Font Weight**: font-extrabold (800)
- **Letter Spacing**: -1.6px
- **Line Height**: 1.1 (52.8px)
- **Color**: text-foreground
- **Text Balance**: enabled for optimal line breaks

#### Description
- **Font Size**: text-lg (18px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.72px
- **Line Height**: 1.75rem (28px)
- **Color**: text-muted-foreground
- **Max Width**: 32rem (512px)

#### CTA Buttons
- **Font Size**: text-base (16px)
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.48px

### Companies Section

#### Section Title
- **Font Size**: text-sm (14px)
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.42px
- **Color**: text-muted-foreground
- **Transform**: uppercase
- **Text Align**: center

### Features Grid Section

#### Section Heading
- **Font Size**: text-3xl (32px)
- **Font Weight**: font-bold (700)
- **Letter Spacing**: -1.2px
- **Line Height**: 2.25rem (36px)
- **Color**: text-foreground
- **Text Align**: center

#### Section Tag
- **Font Size**: text-sm (14px)
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.42px
- **Color**: text-primary
- **Transform**: uppercase

#### Feature Card Title
- **Font Size**: text-lg (18px)
- **Font Weight**: font-semibold (600)
- **Letter Spacing**: -0.72px
- **Line Height**: 1.75rem (28px)
- **Color**: text-foreground

#### Feature Card Description
- **Font Size**: text-base (16px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.48px
- **Line Height**: 1.6 (25.6px)
- **Color**: text-muted-foreground

### Big Feature Section

#### Feature Heading
- **Font Size**: text-3xl (32px)
- **Font Weight**: font-bold (700)
- **Letter Spacing**: -1.2px
- **Line Height**: 2.25rem (36px)
- **Color**: text-foreground

#### Feature Description (Prose)
- **Font Size**: text-lg (18px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.72px
- **Line Height**: 1.75rem (28px)
- **Color**: text-foreground

### Testimonials Section

#### Section Heading
- **Font Size**: text-3xl (32px)
- **Font Weight**: font-bold (700)
- **Letter Spacing**: -1.2px
- **Line Height**: 2.25rem (36px)
- **Color**: text-foreground
- **Text Align**: center

#### Testimonial Quote
- **Font Size**: text-lg (18px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.72px
- **Line Height**: 1.75rem (28px)
- **Color**: text-foreground
- **Font Style**: italic

#### Author Name
- **Font Size**: text-base (16px)
- **Font Weight**: font-semibold (600)
- **Letter Spacing**: -0.48px
- **Color**: text-foreground

#### Author Title
- **Font Size**: text-sm (14px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.42px
- **Color**: text-muted-foreground

### Pricing Section

#### Section Heading
- **Font Size**: text-3xl (32px)
- **Font Weight**: font-bold (700)
- **Letter Spacing**: -1.2px
- **Line Height**: 2.25rem (36px)
- **Color**: text-foreground
- **Text Align**: center

#### Billing Toggle Labels
- **Font Size**: text-sm (14px)
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.42px
- **Color**: text-muted-foreground (inactive)
- **Color**: text-primary (active)

#### Plan Name
- **Font Size**: text-xl (20px)
- **Font Weight**: font-semibold (600)
- **Letter Spacing**: -0.8px
- **Color**: text-foreground

#### Price
- **Font Size**: text-4xl (36px)
- **Font Weight**: font-bold (700)
- **Letter Spacing**: -1.44px
- **Color**: text-foreground

#### Price Period
- **Font Size**: text-base (16px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.48px
- **Color**: text-muted-foreground

#### Plan Description
- **Font Size**: text-base (16px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.48px
- **Color**: text-muted-foreground

#### Feature List Items
- **Font Size**: text-sm (14px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.42px
- **Color**: text-foreground

### FAQ Section

#### Section Heading
- **Font Size**: text-3xl (32px)
- **Font Weight**: font-bold (700)
- **Letter Spacing**: -1.2px
- **Line Height**: 2.25rem (36px)
- **Color**: text-foreground
- **Text Align**: center

#### FAQ Question
- **Font Size**: text-lg (18px)
- **Font Weight**: font-semibold (600)
- **Letter Spacing**: -0.72px
- **Line Height**: 1.75rem (28px)
- **Color**: text-foreground
- **Text Align**: left

#### FAQ Answer
- **Font Size**: text-base (16px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.48px
- **Line Height**: 1.6 (25.6px)
- **Color**: text-muted-foreground

### CTA Section

#### CTA Heading
- **Font Size**: text-4xl (36px)
- **Font Weight**: font-bold (700)
- **Letter Spacing**: -1.44px
- **Line Height**: 2.5rem (40px)
- **Color**: text-primary-foreground (white)
- **Text Align**: center

#### CTA Description
- **Font Size**: text-lg (18px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.72px
- **Line Height**: 1.75rem (28px)
- **Color**: text-primary-foreground with 90% opacity
- **Text Align**: center

### Newsletter Section

#### Newsletter Heading
- **Font Size**: text-2xl (24px)
- **Font Weight**: font-bold (700)
- **Letter Spacing**: -1.04px
- **Line Height**: 2rem (32px)
- **Color**: text-foreground
- **Text Align**: center

#### Newsletter Description
- **Font Size**: text-base (16px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.48px
- **Line Height**: 1.6 (25.6px)
- **Color**: text-muted-foreground
- **Text Align**: center

#### Newsletter Disclaimer
- **Font Size**: text-xs (12px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.36px
- **Line Height**: 1rem (16px)
- **Color**: text-muted-foreground
- **Text Align**: center

### Footer Section

#### Footer Heading
- **Font Size**: text-base (16px)
- **Font Weight**: font-semibold (600)
- **Letter Spacing**: -0.48px
- **Color**: text-foreground

#### Footer Links
- **Font Size**: text-sm (14px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.42px
- **Color**: text-muted-foreground
- **Hover**: text-foreground

#### Footer Description
- **Font Size**: text-sm (14px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.42px
- **Line Height**: 1.25rem (20px)
- **Color**: text-muted-foreground

#### Copyright Text
- **Font Size**: text-sm (14px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.42px
- **Color**: text-muted-foreground

## Button Typography

### Primary Buttons
- **Font Size**: text-sm (14px) for small, text-base (16px) for large
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.42px (small), -0.48px (large)
- **Text Transform**: none

### Secondary Buttons
- **Font Size**: text-sm (14px) for small, text-base (16px) for large
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.42px (small), -0.48px (large)
- **Text Transform**: none

### Ghost Buttons
- **Font Size**: text-sm (14px)
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.42px
- **Text Transform**: none

## Form Typography

### Input Fields
- **Font Size**: text-base (16px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.48px
- **Line Height**: 1.5 (24px)

### Input Labels
- **Font Size**: text-sm (14px)
- **Font Weight**: font-medium (500)
- **Letter Spacing**: -0.42px
- **Color**: text-foreground

### Input Placeholders
- **Font Size**: text-base (16px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.48px
- **Color**: text-muted-foreground

### Error Messages
- **Font Size**: text-sm (14px)
- **Font Weight**: font-normal (400)
- **Letter Spacing**: -0.42px
- **Color**: text-destructive

## Responsive Typography Adjustments

### Mobile (< 768px)
- Hero heading: text-4xl (36px) instead of text-5xl
- Section headings: text-2xl (24px) instead of text-3xl
- Body text remains the same for readability

### Tablet (768px - 1024px)
- Hero heading: text-4xl (36px) instead of text-5xl
- Section headings: text-3xl (32px) maintained
- Body text remains the same

### Desktop (> 1024px)
- All typography as specified above
- Full scale maintained for optimal reading experience

## Text Rendering Optimizations

\`\`\`css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* For headings */
h1, h2, h3, h4, h5, h6 {
  text-wrap: balance;
  font-feature-settings: "kern" 1, "liga" 1;
}

/* For body text */
p {
  text-wrap: pretty;
  font-feature-settings: "kern" 1;
}
\`\`\`

## Accessibility Considerations

- **Minimum font size**: 14px (text-sm) for body text
- **Line height**: Minimum 1.4 for body text, 1.2 for headings
- **Color contrast**: All text meets WCAG AA standards
- **Focus indicators**: Visible focus rings on interactive text elements
- **Reading width**: Body text limited to 65-75 characters per line
