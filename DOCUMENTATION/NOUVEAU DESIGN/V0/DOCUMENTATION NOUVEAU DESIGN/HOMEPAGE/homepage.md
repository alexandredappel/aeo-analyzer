# Homepage Implementation Guide

This document provides a complete guide to recreate the marketing website homepage exactly as implemented in the original template.

## Overview

The homepage is a dynamic, CMS-driven page built with Next.js and BaseHub. It uses a modular section-based architecture where different content sections can be arranged and configured through the CMS.

## Page Structure & Routing

### File Location
- **Main Page**: `app/[[...slug]]/page.tsx`
- **Root Route**: `/` (homepage)
- **Dynamic Routes**: Any CMS-managed page paths

### Core Architecture
\`\`\`typescript
// app/[[...slug]]/page.tsx
export default async function DynamicPage({ params }) {
  // 1. Get page data from BaseHub CMS
  const { site: { pages, generalEvents, settings } } = await basehub().query({...})
  
  // 2. Find matching page by pathname
  const page = pages.items[0]
  
  // 3. Render sections dynamically
  return (
    <>
      <PageView ingestKey={generalEvents.ingestKey} />
      <SectionsUnion 
        sections={page.sections} 
        eventsKey={generalEvents.ingestKey} 
        settings={settings} 
      />
    </>
  )
}
\`\`\`

## Layout Structure

### Root Layout (`app/layout.tsx`)
\`\`\`typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fontSans.variable, "font-sans")}>
        <Providers>
          {/* BaseHub Toolbar (dev only) */}
          <BaseHubToolbar />
          
          {/* Main Layout */}
          <div className="flex min-h-screen flex-col">
            {/* Header */}
            <Header />
            
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Newsletter Section */}
            <Newsletter />
            
            {/* Footer */}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
\`\`\`

### Providers Setup (`app/providers.tsx`)
\`\`\`typescript
export function Providers({ children }) {
  return (
    <BaseHubThemeProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SearchHitsContext.Provider value={searchHits}>
          {children}
          <Toaster />
        </SearchHitsContext.Provider>
      </ThemeProvider>
    </BaseHubThemeProvider>
  )
}
\`\`\`

## Header Component

### Structure
\`\`\`typescript
// components/header.tsx
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <DarkLightImage
              light={settings.logo.light}
              dark={settings.logo.dark}
              alt="Logo"
              width={120}
              height={32}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <NavigationMenu />
          </div>
          
          {/* Right Side CTAs */}
          <nav className="flex items-center space-x-2">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm">
              Get Started
            </Button>
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            {/* Mobile navigation content */}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
\`\`\`

### Styling Classes
- `sticky top-0 z-50`: Fixed header positioning
- `bg-background/95 backdrop-blur`: Translucent background with blur
- `border-b`: Bottom border
- `container flex h-16 items-center`: Container with flex layout

## Homepage Sections

The homepage consists of multiple sections rendered dynamically based on CMS configuration. Here are the typical sections:

### 1. Hero Section

**Component**: `HeroComponent` → `app/_sections/hero/index.tsx`

**Structure**:
\`\`\`typescript
export function Hero({ title, subtitle, description, ctas, backgroundImage }) {
  return (
    <SectionWrapper className="relative overflow-hidden">
      {/* Background */}
      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <DarkLightImage
            light={backgroundImage.light}
            dark={backgroundImage.dark}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40" />
        </div>
      )}

      {/* Content */}
      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Tag */}
          {subtitle && (
            <Tag className="mb-4">
              {subtitle}
            </Tag>
          )}

          {/* Main Heading */}
          <Heading className="mb-6">
            {title}
          </Heading>

          {/* Description */}
          {description && (
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          )}

          {/* CTAs */}
          {ctas && (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {ctas.map((cta, index) => (
                <Button
                  key={index}
                  intent={index === 0 ? "primary" : "secondary"}
                  size="lg"
                  asChild
                >
                  <Link href={cta.href}>
                    {cta.text}
                    {cta.icon && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  )
}
\`\`\`

**Props from CMS**:
- `title`: Main headline text
- `subtitle`: Small tag above title
- `description`: Paragraph below title
- `ctas`: Array of call-to-action buttons
- `backgroundImage`: Hero background image

**Styling Classes**:
- `relative overflow-hidden`: Container positioning
- `absolute inset-0 -z-10`: Background image positioning
- `bg-gradient-to-r from-background/80 to-background/40`: Overlay gradient
- `mx-auto max-w-4xl text-center`: Centered content with max width
- `flex flex-col gap-4 sm:flex-row sm:justify-center`: Responsive CTA layout

### 2. Companies Section

**Component**: `CompaniesComponent` → `app/_sections/companies/index.tsx`

**Structure**:
\`\`\`typescript
export function Companies({ title, companies }) {
  return (
    <SectionWrapper className="py-12">
      <div className="container">
        {title && (
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        )}

        {/* Companies Carousel */}
        <div className="relative">
          <div className="flex animate-scroll">
            {companies.map((company, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
              >
                <DarkLightImage
                  light={company.logo.light}
                  dark={company.logo.dark}
                  alt={company.name}
                  width={120}
                  height={60}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
\`\`\`

**Animation**:
\`\`\`css
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-scroll {
  animation: scroll 30s linear infinite;
}
\`\`\`

### 3. Features Grid Section

**Component**: `FeaturesGridComponent` → `app/_sections/features/features-grid/index.tsx`

**Structure**:
\`\`\`typescript
export function FeaturesGrid({ title, subtitle, features }) {
  return (
    <SectionWrapper className="py-20">
      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Heading tag={subtitle} className="mb-4">
            {title}
          </Heading>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-lg border p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon content={feature.icon} className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
\`\`\`

**Styling Classes**:
- `grid gap-8 md:grid-cols-2 lg:grid-cols-3`: Responsive grid layout
- `group relative rounded-lg border p-6`: Card styling with group hover
- `hover:shadow-lg transition-all duration-300`: Hover effects
- `bg-primary/10`: Semi-transparent background for icons

### 4. Big Feature Section

**Component**: `FeaturesBigImageComponent` → `app/_sections/features/big-feature/index.tsx`

**Structure**:
\`\`\`typescript
export function BigFeature({ title, description, image, cta, reversed }) {
  return (
    <SectionWrapper className="py-20">
      <div className="container">
        <div className={cn(
          "grid gap-12 lg:grid-cols-2 lg:gap-16 items-center",
          reversed && "lg:grid-cols-[1fr,1.2fr]" || "lg:grid-cols-[1.2fr,1fr]"
        )}>
          {/* Content */}
          <div className={cn(reversed && "lg:order-2")}>
            <Heading className="mb-6">
              {title}
            </Heading>
            
            <div className="prose prose-lg mb-8">
              <RichText content={description} />
            </div>

            {cta && (
              <Button intent="primary" size="lg" asChild>
                <Link href={cta.href}>
                  {cta.text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Image */}
          <div className={cn("relative", reversed && "lg:order-1")}>
            <div className="aspect-[4/3] overflow-hidden rounded-lg">
              <DarkLightImage
                light={image.light}
                dark={image.dark}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
\`\`\`

**Layout Logic**:
- `reversed` prop controls image/content order
- `lg:grid-cols-[1.2fr,1fr]`: Asymmetric grid columns
- `lg:order-1` / `lg:order-2`: Responsive ordering

### 5. Testimonials Section

**Component**: `TestimonialSliderComponent` → `app/_sections/testimonials/index.tsx`

**Structure**:
\`\`\`typescript
export function Testimonials({ title, testimonials }) {
  return (
    <SectionWrapper className="py-20 bg-muted/50">
      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Heading>{title}</Heading>
        </div>

        {/* Testimonials Slider */}
        <TestimonialsSlider testimonials={testimonials} />
      </div>
    </SectionWrapper>
  )
}

// Slider Component
export function TestimonialsSlider({ testimonials }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
  })

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container flex">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4">
            <div className="rounded-lg border bg-background p-6 h-full">
              {/* Quote */}
              <blockquote className="mb-4 text-lg">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={testimonial.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {testimonial.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonial.author.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.author.title}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
\`\`\`

**Carousel Configuration**:
- Uses Embla Carousel for smooth scrolling
- Responsive slides: 1 on mobile, 2 on tablet, 3 on desktop
- Auto-loop enabled

### 6. Pricing Section

**Component**: `PricingComponent` → `app/_sections/pricing/index.tsx`

**Structure**:
\`\`\`typescript
export function Pricing({ title, subtitle, plans, billingToggle }) {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <SectionWrapper className="py-20">
      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Heading tag={subtitle} className="mb-4">
            {title}
          </Heading>

          {/* Billing Toggle */}
          {billingToggle && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <span className={cn(!isAnnual && "text-primary")}>Monthly</span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <span className={cn(isAnnual && "text-primary")}>
                Annual
                <Badge variant="secondary" className="ml-2">Save 20%</Badge>
              </span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-lg border p-8",
                plan.featured && "border-primary shadow-lg scale-105"
              )}
            >
              {/* Featured Badge */}
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className="w-full"
                intent={plan.featured ? "primary" : "secondary"}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
\`\`\`

**Interactive Features**:
- Billing toggle (monthly/annual)
- Featured plan highlighting
- Responsive grid layout

### 7. FAQ Section

**Component**: `FaqComponent` → `app/_sections/faq/index.tsx`

**Structure**:
\`\`\`typescript
export function Faq({ title, faqs }) {
  return (
    <SectionWrapper className="py-20">
      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Heading>{title}</Heading>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <RichText content={faq.answer} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </SectionWrapper>
  )
}
\`\`\`

**Accordion Behavior**:
- Single item open at a time
- Smooth expand/collapse animations
- Keyboard navigation support

### 8. Call-to-Action Section

**Component**: `CalloutComponent` → `app/_sections/callout-1/index.tsx`

**Structure**:
\`\`\`typescript
export function Callout({ title, description, cta, backgroundImage }) {
  return (
    <SectionWrapper className="py-20 relative overflow-hidden">
      {/* Background */}
      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <DarkLightImage
            light={backgroundImage.light}
            dark={backgroundImage.dark}
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/90" />
        </div>
      )}

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center text-primary-foreground">
          <Heading className="mb-6 text-primary-foreground">
            {title}
          </Heading>
          
          {description && (
            <p className="mb-8 text-lg opacity-90">
              {description}
            </p>
          )}

          {cta && (
            <Button
              intent="secondary"
              size="lg"
              asChild
            >
              <Link href={cta.href}>
                {cta.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </SectionWrapper>
  )
}
\`\`\`

## Footer Component

### Structure
\`\`\`typescript
// components/footer.tsx
export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <DarkLightImage
                light={settings.logo.light}
                dark={settings.logo.dark}
                alt="Logo"
                width={120}
                height={32}
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {settings.description}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon content={link.icon} className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {footerNavigation.map((column, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Company Name. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
\`\`\`

## Newsletter Section

### Structure
\`\`\`typescript
// app/_sections/newsletter/index.tsx
export function Newsletter() {
  return (
    <SectionWrapper className="py-16 bg-muted/50">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <Heading className="mb-4">
            Stay Updated
          </Heading>
          <p className="text-muted-foreground mb-8">
            Get the latest news and updates delivered to your inbox.
          </p>

          {/* Newsletter Form */}
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
              required
            />
            <Button type="submit" intent="primary">
              Subscribe
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </SectionWrapper>
  )
}
\`\`\`

## Global Styling Application

### CSS Variables Usage
The homepage uses CSS variables for consistent theming:

\`\`\`css
/* Applied throughout components */
background-color: var(--surface-primary);
color: var(--text-primary);
border-color: var(--border);

/* Dark mode variants */
.dark {
  background-color: var(--dark-surface-primary);
  color: var(--dark-text-primary);
}
\`\`\`

### Tailwind Classes
Key utility classes used throughout:

- **Layout**: `container`, `mx-auto`, `max-w-*`
- **Grid**: `grid`, `grid-cols-*`, `gap-*`
- **Spacing**: `py-20`, `mb-16`, `px-6`
- **Typography**: `text-lg`, `font-semibold`, `text-center`
- **Colors**: `text-muted-foreground`, `bg-background`
- **Effects**: `hover:shadow-lg`, `transition-all`, `duration-300`

## Animations & Interactions

### Scroll Animations
\`\`\`typescript
// Intersection Observer for fade-in effects
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in')
    }
  })
}, observerOptions)
\`\`\`

### Hover Effects
- **Cards**: `hover:shadow-lg hover:-translate-y-1`
- **Buttons**: `hover:bg-[--accent-600]`
- **Images**: `hover:scale-105`
- **Links**: `hover:text-[--accent-500]`

### Transitions
- **Standard**: `transition-all duration-200 ease-out`
- **Colors**: `transition-colors duration-300 ease-in-out`
- **Transform**: `transition-transform duration-300 ease-out`

## Assets Used

### Images
- **Hero Background**: Dynamic from CMS
- **Feature Images**: Product screenshots
- **Company Logos**: Client/partner logos
- **Testimonial Avatars**: Customer photos
- **Placeholders**: `/placeholder.svg?height=400&width=600`

### Icons
- **Lucide React**: `ArrowRight`, `Check`, `Menu`, `X`, `Star`
- **Custom Icons**: From BaseHub CMS as SVG strings
- **Social Icons**: Twitter, LinkedIn, GitHub, etc.

### Fonts
- **Primary**: Geist (sans-serif)
- **Monospace**: Geist Mono
- **Fallbacks**: System fonts for instant loading

## Data Flow & Dependencies

### CMS Integration
\`\`\`typescript
// BaseHub query for homepage data
const homepageQuery = {
  site: {
    settings: {
      logo: { light: true, dark: true },
      metadata: { defaultTitle: true, defaultDescription: true }
    },
    pages: {
      __args: { filter: { pathname: { eq: "/" } } },
      items: {
        sections: {
          __typename: true,
          // All section fragments
          on_HeroComponent: heroFragment,
          on_FeaturesGridComponent: featuresGridFragment,
          // ... other fragments
        }
      }
    }
  }
}
\`\`\`

### State Management
- **Theme**: Managed by `next-themes`
- **Search**: Context-based state
- **Forms**: Local component state
- **Carousel**: Embla Carousel API

### Performance Optimizations
- **Images**: Next.js Image component with optimization
- **Fonts**: Preloaded with `next/font`
- **Code Splitting**: Dynamic imports for heavy components
- **Caching**: Static generation with revalidation

## Implementation Checklist

### Required Components
- [ ] Header with navigation
- [ ] Hero section with CTA
- [ ] Companies carousel
- [ ] Features grid
- [ ] Big feature sections
- [ ] Testimonials slider
- [ ] Pricing cards
- [ ] FAQ accordion
- [ ] Call-to-action section
- [ ] Newsletter signup
- [ ] Footer with links

### Required Styling
- [ ] CSS variables setup
- [ ] Tailwind configuration
- [ ] Typography scale
- [ ] Color system
- [ ] Animation keyframes
- [ ] Responsive breakpoints

### Required Functionality
- [ ] Theme switching
- [ ] Mobile navigation
- [ ] Form handling
- [ ] Carousel controls
- [ ] Accordion behavior
- [ ] Smooth scrolling
- [ ] Loading states

### Required Assets
- [ ] Logo variants (light/dark)
- [ ] Placeholder images
- [ ] Icon library setup
- [ ] Font loading
- [ ] Favicon and meta images

This guide provides everything needed to recreate the homepage exactly as implemented in the original marketing website template.
