# Homepage Layout Structure - Desktop View

This document provides exact measurements, spacing, and structural details for the homepage layout on desktop (1440px+ viewport).

## Overall Page Structure

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│ Header (sticky, 64px height)                               │
├─────────────────────────────────────────────────────────────┤
│ Hero Section (min-height: 600px)                           │
├─────────────────────────────────────────────────────────────┤
│ Companies Section (120px padding top/bottom)               │
├─────────────────────────────────────────────────────────────┤
│ Features Grid Section (160px padding top/bottom)           │
├─────────────────────────────────────────────────────────────┤
│ Big Feature Section (160px padding top/bottom)             │
├─────────────────────────────────────────────────────────────┤
│ Testimonials Section (160px padding top/bottom)            │
├─────────────────────────────────────────────────────────────┤
│ Pricing Section (160px padding top/bottom)                 │
├─────────────────────────────────────────────────────────────┤
│ FAQ Section (160px padding top/bottom)                     │
├─────────────────────────────────────────────────────────────┤
│ CTA Section (160px padding top/bottom)                     │
├─────────────────────────────────────────────────────────────┤
│ Newsletter Section (128px padding top/bottom)              │
├─────────────────────────────────────────────────────────────┤
│ Footer (96px padding top/bottom)                           │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Container Specifications

### Global Container
- **Max Width**: 1400px
- **Horizontal Padding**: 32px (2rem)
- **Centering**: `margin: 0 auto`
- **CSS Classes**: `container mx-auto px-8`

## Section-by-Section Breakdown

### 1. Header Section
\`\`\`
Height: 64px (h-16)
Position: sticky top-0
Z-index: 50
Background: bg-background/95 backdrop-blur
Border: border-b

Layout:
┌─────────────────────────────────────────────────────────────┐
│ [Logo 120x32] [Nav Items] [Spacer] [Theme] [Sign In] [CTA] │
└─────────────────────────────────────────────────────────────┘

Spacing:
- Logo margin-right: 24px
- Nav items gap: 32px
- Right section gap: 8px
- Button heights: 32px (h-8)
\`\`\`

### 2. Hero Section
\`\`\`
Min Height: 600px
Padding: 160px top/bottom (py-40)
Background: Gradient overlay on image

Content Layout:
┌─────────────────────────────────────────────────────────────┐
│                    [Tag Badge]                              │
│                                                             │
│              [Main Heading - 4xl]                          │
│                                                             │
│           [Description Paragraph]                          │
│                                                             │
│            [CTA Buttons Row]                               │
└─────────────────────────────────────────────────────────────┘

Content Container:
- Max width: 896px (max-w-4xl)
- Text alignment: center
- Margins between elements:
  - Tag to Heading: 16px (mb-4)
  - Heading to Description: 24px (mb-6)
  - Description to CTAs: 32px (mb-8)

CTA Buttons:
- Gap between buttons: 16px
- Button size: large (h-10, px-5)
- Primary button: accent background
- Secondary button: outline style
\`\`\`

### 3. Companies Section
\`\`\`
Padding: 48px top/bottom (py-12)
Background: transparent

Layout:
┌─────────────────────────────────────────────────────────────┐
│                   [Title Text]                             │
│                                                             │
│  [Logo] [Logo] [Logo] [Logo] [Logo] [Logo] [Logo] [Logo]   │
└─────────────────────────────────────────────────────────────┘

Title:
- Margin bottom: 32px (mb-8)
- Text size: small (text-sm)
- Color: muted-foreground

Logo Container:
- Horizontal scroll/carousel
- Logo spacing: 64px between centers (mx-8)
- Logo dimensions: 120x60px max
- Opacity: 60% default, 100% on hover
\`\`\`

### 4. Features Grid Section
\`\`\`
Padding: 160px top/bottom (py-20)
Background: transparent

Header:
- Max width: 512px (max-w-2xl)
- Center aligned
- Margin bottom: 64px (mb-16)

Grid Layout:
┌─────────────────────────────────────────────────────────────┐
│  [Feature 1]    [Feature 2]    [Feature 3]                │
│                                                             │
│  [Feature 4]    [Feature 5]    [Feature 6]                │
└─────────────────────────────────────────────────────────────┘

Grid Specifications:
- Columns: 3 (lg:grid-cols-3)
- Gap: 32px (gap-8)
- Card padding: 24px (p-6)
- Card border radius: 8px (rounded-lg)

Feature Card Structure:
- Icon container: 48x48px, margin-bottom: 16px
- Title margin-bottom: 8px
- Description: muted-foreground color
\`\`\`

### 5. Big Feature Section
\`\`\`
Padding: 160px top/bottom (py-20)
Background: transparent

Layout (2-column grid):
┌─────────────────────────────────────────────────────────────┐
│                    │                                        │
│   [Content Area]   │        [Image Area]                   │
│                    │                                        │
└─────────────────────────────────────────────────────────────┘

Grid Specifications:
- Columns: 1.2fr 1fr (asymmetric)
- Gap: 64px (lg:gap-16)
- Alignment: items-center

Content Area:
- Heading margin-bottom: 24px (mb-6)
- Description margin-bottom: 32px (mb-8)
- Prose styling for rich text

Image Area:
- Aspect ratio: 4:3
- Border radius: 8px (rounded-lg)
- Object fit: cover
\`\`\`

### 6. Testimonials Section
\`\`\`
Padding: 160px top/bottom (py-20)
Background: muted/50 (light gray tint)

Header:
- Max width: 512px (max-w-2xl)
- Center aligned
- Margin bottom: 64px (mb-16)

Carousel Layout:
- Slide width: 33.333% on desktop (3 visible)
- Slide padding-left: 16px (pl-4)
- Card padding: 24px (p-6)
- Card height: full height of container

Testimonial Card:
- Border radius: 8px (rounded-lg)
- Background: white/background
- Quote margin-bottom: 16px (mb-4)
- Author section: flex with 12px gap (gap-3)
- Avatar size: 40px (w-10 h-10)
\`\`\`

### 7. Pricing Section
\`\`\`
Padding: 160px top/bottom (py-20)
Background: transparent

Header:
- Max width: 512px (max-w-2xl)
- Center aligned
- Margin bottom: 64px (mb-16)

Billing Toggle:
- Margin top: 32px (mt-8)
- Gap between elements: 12px (gap-3)

Pricing Grid:
┌─────────────────────────────────────────────────────────────┐
│   [Plan 1]        [Plan 2]        [Plan 3]                │
│                   (Featured)                               │
└─────────────────────────────────────────────────────────────┘

Grid Specifications:
- Columns: 3 (lg:grid-cols-3)
- Gap: 32px (gap-8)
- Featured card: scale-105 transform

Pricing Card:
- Padding: 32px (p-8)
- Border radius: 8px (rounded-lg)
- Header margin-bottom: 32px (mb-8)
- Features list margin-bottom: 32px (mb-8)
- Feature item spacing: 12px (space-y-3)
\`\`\`

### 8. FAQ Section
\`\`\`
Padding: 160px top/bottom (py-20)
Background: transparent

Header:
- Max width: 512px (max-w-2xl)
- Center aligned
- Margin bottom: 64px (mb-16)

Accordion Container:
- Max width: 768px (max-w-3xl)
- Center aligned

Accordion Items:
- Border between items
- Padding: 24px vertical
- Question: left-aligned text
- Answer: rich text content with prose styling
\`\`\`

### 9. CTA Section
\`\`\`
Padding: 160px top/bottom (py-20)
Background: Primary color with overlay
Position: relative (for background image)

Content:
- Max width: 896px (max-w-4xl)
- Center aligned
- Text color: primary-foreground (white)

Spacing:
- Heading margin-bottom: 24px (mb-6)
- Description margin-bottom: 32px (mb-8)
\`\`\`

### 10. Newsletter Section
\`\`\`
Padding: 128px top/bottom (py-16)
Background: muted/50

Content:
- Max width: 512px (max-w-2xl)
- Center aligned

Form:
- Max width: 384px (max-w-md)
- Center aligned
- Gap: 16px (gap-4)
- Flex direction: row on desktop

Disclaimer:
- Margin top: 16px (mt-4)
- Text size: extra small (text-xs)
\`\`\`

### 11. Footer Section
\`\`\`
Padding: 96px top/bottom (py-12)
Background: background
Border: border-t

Main Grid:
- Columns: 4 (lg:grid-cols-4)
- Gap: 32px (gap-8)
- Company info spans 1 column
- Navigation spans 3 columns

Bottom Bar:
- Margin top: 48px (mt-12)
- Padding top: 32px (pt-8)
- Border top: border-t
- Flex layout: space-between
- Gap on mobile: 16px (mt-4 sm:mt-0)

Social Links:
- Gap: 16px (space-x-4)
- Icon size: 20px (h-5 w-5)

Navigation Links:
- Spacing: 8px vertical (space-y-2)
- Text size: small (text-sm)
\`\`\`

## Z-Index Layers

\`\`\`
Header: z-50
Modals/Dialogs: z-40
Dropdowns: z-30
Tooltips: z-20
Background overlays: z-10
Background images: -z-10
\`\`\`

## Overflow Handling

- **Horizontal**: Most sections use `overflow-hidden` to prevent layout breaks
- **Vertical**: Natural flow, no restrictions
- **Images**: `object-cover` for consistent aspect ratios
- **Text**: `text-balance` for optimal line breaks in headings

## Accessibility Spacing

- **Focus rings**: 2px offset from elements
- **Touch targets**: Minimum 44px for interactive elements
- **Reading width**: Max 65-75 characters per line for body text
- **Vertical rhythm**: Consistent spacing multiples of 4px (0.25rem)
