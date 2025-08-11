# Marketing Website Template Documentation

A comprehensive Next.js marketing website template with BaseHub CMS integration, featuring dynamic theming, responsive design, and modular components.

## 🏗️ Project Structure

\`\`\`
├── app/                          # Next.js App Router
│   ├── [[...slug]]/             # Dynamic routing for CMS pages
│   ├── blog/                    # Blog section
│   ├── changelog/               # Changelog section
│   ├── _sections/               # Page section components
│   ├── _utils/                  # Utility functions
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── providers.tsx            # Context providers
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── header.tsx               # Site header
│   ├── footer.tsx               # Site footer
│   └── theme-switcher.tsx       # Theme toggle
├── common/                      # Common UI components
│   ├── button.tsx               # Custom button component
│   ├── heading.tsx              # Heading component
│   └── dark-light-image.tsx     # Theme-aware images
├── context/                     # React contexts
│   └── basehub-theme-provider.tsx # Theme management
├── lib/                         # Utilities and configurations
│   ├── basehub/                 # CMS integration
│   └── utils.ts                 # Utility functions
└── styles/                      # Additional styles
\`\`\`

## 🎨 Design System

### Colors
The site uses a dynamic color system with semantic naming:

**Light Mode:**
- `--text-primary`: Main text color (grayscale-950)
- `--text-secondary`: Secondary text (grayscale-600)
- `--text-tertiary`: Tertiary text (grayscale-500)
- `--surface-primary`: Main background (grayscale-50)
- `--surface-secondary`: Secondary background (grayscale-100)
- `--surface-tertiary`: Tertiary background (grayscale-200)
- `--border`: Border color (grayscale-300)

**Dark Mode:**
- `--dark-text-primary`: Main text (grayscale-50)
- `--dark-text-secondary`: Secondary text (grayscale-400)
- `--dark-text-tertiary`: Tertiary text (grayscale-500)
- `--dark-surface-primary`: Main background (grayscale-950)
- `--dark-surface-secondary`: Secondary background (grayscale-900)
- `--dark-surface-tertiary`: Tertiary background (grayscale-800)
- `--dark-border`: Border color (grayscale-800)

**Accent Colors:**
- Dynamic accent colors based on BaseHub theme configuration
- Supports all Tailwind color palettes
- Automatic contrast adjustment for accessibility

### Typography
- **Primary Font**: Geist (sans-serif)
- **Monospace Font**: Geist Mono
- **Fallbacks**: Inter, system fonts
- **Custom letter spacing** for improved readability
- **Responsive font sizes** with fluid scaling

### Spacing & Layout
- **Container**: Centered with responsive padding
- **Grid System**: CSS Grid and Flexbox
- **Breakpoints**: Standard Tailwind breakpoints
- **Max Width**: 1400px for 2xl screens

## 🧩 Component System

### Core Components

#### Button Component (`common/button.tsx`)
\`\`\`tsx
interface ButtonProps {
  intent?: 'primary' | 'secondary' | 'tertiary'
  size?: 'md' | 'lg'
  disabled?: boolean
  icon?: React.ReactNode
  iconSide?: 'left' | 'right'
  unstyled?: boolean
}
\`\`\`

**Variants:**
- `primary`: Accent background with white text
- `secondary`: Light background with border
- `tertiary`: Dark background with light text

#### Heading Component (`common/heading.tsx`)
\`\`\`tsx
interface HeadingProps {
  tag?: React.ReactNode
  subtitle?: React.ReactNode
  align?: 'center' | 'left' | 'right' | 'none'
  className?: string
}
\`\`\`

#### Dark/Light Image (`common/dark-light-image.tsx`)
Automatically switches images based on theme:
\`\`\`tsx
interface DarkLightImageProps {
  dark?: ImageFragment
  light: ImageFragment
  alt?: string
  withPlaceholder?: boolean
}
\`\`\`

### Section Components

#### Hero Section
- Large heading with subtitle
- CTA buttons
- Background image/video support
- Responsive layout

#### Features Section
- Grid layout for feature cards
- Icon support
- Multiple layout variants (grid, list, side-by-side)

#### Testimonials
- Slider component with Embla Carousel
- Grid layout option
- Author information with avatars

#### Pricing
- Comparison tables
- Feature lists
- CTA buttons
- Mobile-responsive design

#### FAQ
- Accordion-style questions
- Collapsible sections
- Search functionality

### UI Components (shadcn/ui)
Complete set of accessible components:
- Accordion, Alert, Avatar, Badge
- Button, Card, Carousel, Checkbox
- Dialog, Dropdown, Form, Input
- Navigation, Popover, Select, Sheet
- Sidebar, Skeleton, Slider, Switch
- Table, Tabs, Textarea, Toast
- Toggle, Tooltip

## 🎭 Animations & Interactions

### CSS Animations
\`\`\`css
@keyframes accordion-down {
  from { height: 0 }
  to { height: var(--radix-accordion-content-height) }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height) }
  to { height: 0 }
}
\`\`\`

### Interactive Behaviors
- **Hover Effects**: Brightness and opacity changes
- **Focus States**: Ring outlines for accessibility
- **Smooth Transitions**: 200ms ease-out timing
- **Carousel**: Touch/swipe gestures with Embla
- **Theme Switching**: Smooth color transitions

### Component States
- Loading states with skeletons
- Error boundaries
- Form validation states
- Mobile menu animations

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized navigation for mobile

### Layout Patterns
- **Header**: Sticky navigation with mobile menu
- **Sections**: Full-width with contained content
- **Footer**: Multi-column layout that stacks on mobile
- **Cards**: Responsive grid with auto-fit columns

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm/pnpm/yarn
- BaseHub account (for CMS)

### Installation
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd marketing-website

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your BASEHUB_TOKEN

# Start development server
pnpm dev
\`\`\`

### Environment Variables
\`\`\`env
BASEHUB_TOKEN=your_basehub_token_here
VERCEL_PROJECT_PRODUCTION_URL=your-domain.com
\`\`\`

### Build & Deploy
\`\`\`bash
# Build for production
pnpm build

# Start production server
pnpm start

# Deploy to Vercel (recommended)
vercel deploy
\`\`\`

## 📦 Dependencies

### Core Dependencies
- **next**: 15.2.4 - React framework
- **react**: ^19 - UI library
- **tailwindcss**: ^3.4.17 - CSS framework
- **basehub**: latest - Headless CMS

### UI & Styling
- **@radix-ui/react-***: Accessible UI primitives
- **class-variance-authority**: Component variants
- **clsx**: Conditional classes
- **tailwind-merge**: Merge Tailwind classes
- **lucide-react**: Icon library

### Functionality
- **next-themes**: Theme management
- **embla-carousel-react**: Carousel component
- **react-hook-form**: Form handling
- **sonner**: Toast notifications
- **cmdk**: Command palette

### Development
- **typescript**: Type safety
- **prettier**: Code formatting
- **@tailwindcss/typography**: Rich text styling

## 🎨 Theme Management

### BaseHub Theme Provider
Dynamic theme system that generates CSS variables:
\`\`\`tsx
<BaseHubThemeProvider theme={{ accent: 'blue', grayScale: 'slate' }}>
  {children}
</BaseHubThemeProvider>
\`\`\`

### Theme Configuration
- **Accent Colors**: Any Tailwind color palette
- **Grayscale**: Any Tailwind gray palette
- **Automatic Contrast**: Text colors adjust for accessibility
- **Opacity Variants**: 5-100% opacity levels for all colors

### Usage in Components
\`\`\`tsx
// Use semantic color names
className="bg-[--surface-primary] text-[--text-primary]"

// Dark mode variants
className="dark:bg-[--dark-surface-primary] dark:text-[--dark-text-primary]"

// Opacity variants
className="bg-[--accent-500-50]" // 50% opacity
\`\`\`

## 🔍 SEO & Performance

### SEO Features
- Dynamic meta tags from CMS
- Structured data
- Sitemap generation
- RSS feeds for blog/changelog
- Open Graph images

### Performance Optimizations
- Image optimization with Next.js
- Static generation where possible
- Code splitting
- Font optimization
- CSS-in-JS with zero runtime

### Analytics
- Built-in page view tracking
- Event tracking for CTAs
- BaseHub analytics integration

## 🚀 Development Notes

### Code Organization
- **Colocation**: Components near their usage
- **Separation of Concerns**: Logic, UI, and styling separated
- **TypeScript**: Full type safety throughout
- **ESLint/Prettier**: Consistent code formatting

### Best Practices
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Core Web Vitals optimization
- **SEO**: Search engine friendly
- **Maintainability**: Clean, documented code

### Customization
- **Colors**: Modify theme in BaseHub
- **Typography**: Update font variables
- **Components**: Extend or override existing components
- **Sections**: Add new section types in `_sections/`

### Testing
- Component testing with Jest/RTL
- E2E testing with Playwright
- Visual regression testing
- Accessibility testing

## 📚 Additional Resources

- [BaseHub Documentation](https://basehub.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://radix-ui.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
