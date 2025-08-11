# Homepage Color System

This document defines the exact color specifications for all states and contexts used throughout the homepage.

## Color Architecture

The homepage uses a CSS custom properties-based color system that supports both light and dark themes with semantic color tokens.

### CSS Custom Properties Structure

\`\`\`css
:root {
  /* Base shadcn/ui colors */
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --border: 0 0% 89.8%;
  --ring: 0 0% 3.9%;

  /* Semantic colors (BaseHub theme-generated) */
  --text-primary: /* Dynamic based on theme */;
  --text-secondary: /* Dynamic based on theme */;
  --text-tertiary: /* Dynamic based on theme */;
  --surface-primary: /* Dynamic based on theme */;
  --surface-secondary: /* Dynamic based on theme */;
  --surface-tertiary: /* Dynamic based on theme */;
  --control: /* Dynamic accent color */;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
}
\`\`\`

## Color Palette by Context

### Text Colors

#### Primary Text
- **Light Mode**: `hsl(0 0% 3.9%)` - Near black
- **Dark Mode**: `hsl(0 0% 98%)` - Near white
- **CSS Class**: `text-foreground`
- **Usage**: Main headings, body text, primary content

#### Secondary Text
- **Light Mode**: `hsl(0 0% 45.1%)` - Medium gray
- **Dark Mode**: `hsl(0 0% 63.9%)` - Light gray
- **CSS Class**: `text-muted-foreground`
- **Usage**: Descriptions, captions, secondary information

#### Accent Text
- **Light Mode**: Dynamic based on theme selection
- **Dark Mode**: Dynamic based on theme selection
- **CSS Class**: `text-primary`
- **Usage**: Links, CTAs, highlighted text

### Background Colors

#### Primary Background
- **Light Mode**: `hsl(0 0% 100%)` - Pure white
- **Dark Mode**: `hsl(0 0% 3.9%)` - Near black
- **CSS Class**: `bg-background`
- **Usage**: Main page background, cards

#### Secondary Background
- **Light Mode**: `hsl(0 0% 96.1%)` - Light gray
- **Dark Mode**: `hsl(0 0% 14.9%)` - Dark gray
- **CSS Class**: `bg-muted` or `bg-muted/50`
- **Usage**: Section backgrounds, alternating sections

#### Card Background
- **Light Mode**: `hsl(0 0% 100%)` - Pure white
- **Dark Mode**: `hsl(0 0% 3.9%)` - Near black
- **CSS Class**: `bg-card`
- **Usage**: Feature cards, testimonial cards, pricing cards

### Border Colors

#### Default Border
- **Light Mode**: `hsl(0 0% 89.8%)` - Light gray
- **Dark Mode**: `hsl(0 0% 14.9%)` - Dark gray
- **CSS Class**: `border-border`
- **Usage**: Card borders, section dividers

#### Accent Border
- **Light Mode**: Dynamic accent color
- **Dark Mode**: Dynamic accent color
- **CSS Class**: `border-primary`
- **Usage**: Featured elements, focus states

## Component-Specific Colors

### Header Component

#### Background
- **Color**: `bg-background/95` with `backdrop-blur`
- **Light Mode**: `hsla(0, 0%, 100%, 0.95)` - Semi-transparent white
- **Dark Mode**: `hsla(0, 0%, 3.9%, 0.95)` - Semi-transparent black

#### Navigation Links
- **Default**: `text-foreground`
- **Hover**: `text-primary`
- **Active**: `text-primary`
- **Focus**: `ring-2 ring-ring ring-offset-2`

#### CTA Buttons
- **Primary Button**:
  - Background: `bg-primary`
  - Text: `text-primary-foreground`
  - Hover: `hover:bg-primary/90`
- **Secondary Button**:
  - Background: `bg-secondary`
  - Text: `text-secondary-foreground`
  - Hover: `hover:bg-secondary/80`

### Hero Section

#### Background Overlay
- **Gradient**: `bg-gradient-to-r from-background/80 to-background/40`
- **Light Mode**: White to transparent gradient
- **Dark Mode**: Black to transparent gradient

#### Tag/Badge
- **Background**: `bg-secondary`
- **Text**: `text-secondary-foreground`
- **Border**: `border-border`

#### Main Heading
- **Color**: `text-foreground`
- **Light Mode**: `hsl(0 0% 3.9%)`
- **Dark Mode**: `hsl(0 0% 98%)`

#### Description
- **Color**: `text-muted-foreground`
- **Light Mode**: `hsl(0 0% 45.1%)`
- **Dark Mode**: `hsl(0 0% 63.9%)`

#### CTA Buttons
- **Primary**:
  - Background: `bg-primary`
  - Text: `text-primary-foreground`
  - Hover: `hover:bg-primary/90`
  - Focus: `focus-visible:ring-2 focus-visible:ring-ring`
- **Secondary**:
  - Background: `bg-secondary`
  - Text: `text-secondary-foreground`
  - Border: `border-border`
  - Hover: `hover:bg-secondary/80`

### Companies Section

#### Section Background
- **Color**: Transparent (inherits from parent)

#### Company Logos
- **Default Opacity**: `opacity-60`
- **Hover Opacity**: `opacity-100`
- **Transition**: `transition-opacity duration-200`

### Features Grid Section

#### Feature Cards
- **Background**: `bg-card`
- **Border**: `border-border`
- **Hover**: `hover:shadow-lg`
- **Hover Background**: `group-hover:bg-gradient-to-r from-primary/5 to-primary/10`

#### Icon Container
- **Background**: `bg-primary/10`
- **Light Mode**: `hsla(0, 0%, 9%, 0.1)`
- **Dark Mode**: `hsla(0, 0%, 98%, 0.1)`

#### Feature Title
- **Color**: `text-foreground`

#### Feature Description
- **Color**: `text-muted-foreground`

### Big Feature Section

#### Content Area
- **Background**: Transparent

#### Image Container
- **Border Radius**: `rounded-lg`
- **Overflow**: `overflow-hidden`

### Testimonials Section

#### Section Background
- **Color**: `bg-muted/50`
- **Light Mode**: `hsla(0, 0%, 96.1%, 0.5)`
- **Dark Mode**: `hsla(0, 0%, 14.9%, 0.5)`

#### Testimonial Cards
- **Background**: `bg-background`
- **Border**: `border-border`
- **Shadow**: `shadow-sm`

#### Quote Text
- **Color**: `text-foreground`

#### Author Name
- **Color**: `text-foreground`

#### Author Title
- **Color**: `text-muted-foreground`

### Pricing Section

#### Billing Toggle
- **Inactive Label**: `text-muted-foreground`
- **Active Label**: `text-primary`
- **Switch Background**: `bg-secondary`
- **Switch Thumb**: `bg-background`

#### Pricing Cards
- **Background**: `bg-card`
- **Border**: `border-border`
- **Featured Card**: `border-primary shadow-lg`

#### Featured Badge
- **Background**: `bg-primary`
- **Text**: `text-primary-foreground`

#### Plan Name
- **Color**: `text-foreground`

#### Price
- **Color**: `text-foreground`

#### Price Period
- **Color**: `text-muted-foreground`

#### Feature List
- **Check Icon**: `text-primary`
- **Feature Text**: `text-foreground`

#### CTA Buttons
- **Featured Plan**: Primary button styling
- **Regular Plan**: Secondary button styling

### FAQ Section

#### Accordion Items
- **Border**: `border-b border-border`

#### Question (Trigger)
- **Color**: `text-foreground`
- **Hover**: `hover:text-primary`

#### Answer (Content)
- **Color**: `text-muted-foreground`

### CTA Section

#### Background
- **Color**: `bg-primary`
- **Overlay**: `bg-primary/90` over background image

#### Heading
- **Color**: `text-primary-foreground`

#### Description
- **Color**: `text-primary-foreground` with 90% opacity

#### CTA Button
- **Background**: `bg-background`
- **Text**: `text-foreground`
- **Hover**: `hover:bg-background/90`

### Newsletter Section

#### Section Background
- **Color**: `bg-muted/50`

#### Form Input
- **Background**: `bg-background`
- **Border**: `border-border`
- **Focus**: `focus:ring-2 focus:ring-ring focus:border-ring`
- **Placeholder**: `placeholder:text-muted-foreground`

#### Submit Button
- **Background**: `bg-primary`
- **Text**: `text-primary-foreground`
- **Hover**: `hover:bg-primary/90`

### Footer Section

#### Footer Background
- **Color**: `bg-background`
- **Border**: `border-t border-border`

#### Footer Headings
- **Color**: `text-foreground`

#### Footer Links
- **Default**: `text-muted-foreground`
- **Hover**: `text-foreground`

#### Social Icons
- **Default**: `text-muted-foreground`
- **Hover**: `text-foreground`

#### Copyright Text
- **Color**: `text-muted-foreground`

## Interactive States

### Button States

#### Primary Button
\`\`\`css
/* Default */
background: hsl(var(--primary));
color: hsl(var(--primary-foreground));

/* Hover */
background: hsl(var(--primary) / 0.9);

/* Focus */
outline: 2px solid hsl(var(--ring));
outline-offset: 2px;

/* Active */
background: hsl(var(--primary) / 0.8);
transform: translateY(1px);

/* Disabled */
background: hsl(var(--muted));
color: hsl(var(--muted-foreground));
opacity: 0.5;
cursor: not-allowed;
\`\`\`

#### Secondary Button
\`\`\`css
/* Default */
background: hsl(var(--secondary));
color: hsl(var(--secondary-foreground));
border: 1px solid hsl(var(--border));

/* Hover */
background: hsl(var(--secondary) / 0.8);

/* Focus */
outline: 2px solid hsl(var(--ring));
outline-offset: 2px;

/* Active */
background: hsl(var(--secondary) / 0.7);

/* Disabled */
background: hsl(var(--muted));
color: hsl(var(--muted-foreground));
opacity: 0.5;
\`\`\`

### Link States

#### Navigation Links
\`\`\`css
/* Default */
color: hsl(var(--foreground));

/* Hover */
color: hsl(var(--primary));

/* Focus */
outline: 2px solid hsl(var(--ring));
outline-offset: 2px;
border-radius: 4px;

/* Active */
color: hsl(var(--primary));
\`\`\`

#### Footer Links
\`\`\`css
/* Default */
color: hsl(var(--muted-foreground));

/* Hover */
color: hsl(var(--foreground));

/* Focus */
outline: 2px solid hsl(var(--ring));
outline-offset: 2px;
\`\`\`

### Form States

#### Input Fields
\`\`\`css
/* Default */
background: hsl(var(--background));
border: 1px solid hsl(var(--border));
color: hsl(var(--foreground));

/* Focus */
border-color: hsl(var(--ring));
outline: 2px solid hsl(var(--ring));
outline-offset: -1px;

/* Error */
border-color: hsl(var(--destructive));
outline: 2px solid hsl(var(--destructive));

/* Disabled */
background: hsl(var(--muted));
color: hsl(var(--muted-foreground));
opacity: 0.5;
\`\`\`

### Card States

#### Feature Cards
\`\`\`css
/* Default */
background: hsl(var(--card));
border: 1px solid hsl(var(--border));

/* Hover */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
transform: translateY(-2px);

/* Focus Within */
outline: 2px solid hsl(var(--ring));
outline-offset: 2px;
\`\`\`

## Theme Variations

### Light Theme Specifics
- **High contrast**: Pure white backgrounds with dark text
- **Subtle borders**: Light gray borders for definition
- **Muted backgrounds**: Very light gray for section alternation
- **Accent colors**: Vibrant colors for CTAs and highlights

### Dark Theme Specifics
- **Reduced contrast**: Near-black backgrounds to reduce eye strain
- **Subtle borders**: Dark gray borders for definition
- **Elevated surfaces**: Slightly lighter backgrounds for cards
- **Accent colors**: Slightly desaturated for better readability

## Accessibility Compliance

### Contrast Ratios
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio

### Focus Indicators
- **Visible focus rings**: 2px solid outline with 2px offset
- **High contrast**: Focus rings use accent color for visibility
- **Consistent styling**: All interactive elements have focus states

### Color Independence
- **No color-only information**: All information conveyed through color also uses text/icons
- **Pattern alternatives**: Important distinctions use patterns or text in addition to color
