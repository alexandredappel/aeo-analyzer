# Homepage Responsive Design Specifications

This document defines exact layout changes, breakpoints, and responsive behaviors for the homepage across all device sizes.

## Breakpoint System

### Tailwind CSS Breakpoints
\`\`\`css
/* Mobile First Approach */
/* Default: 0px - 639px (Mobile) */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
2xl: 1400px /* Extra large desktops (custom) */
\`\`\`

### Custom Breakpoints for Specific Components
\`\`\`css
/* Custom breakpoints for fine-tuned control */
@media (max-width: 480px) { /* Small mobile */ }
@media (min-width: 481px) and (max-width: 767px) { /* Large mobile */ }
@media (min-width: 768px) and (max-width: 1023px) { /* Tablet */ }
@media (min-width: 1024px) and (max-width: 1279px) { /* Small desktop */ }
@media (min-width: 1280px) { /* Large desktop */ }
\`\`\`

## Container Responsive Behavior

### Container Specifications by Breakpoint
\`\`\`css
.container {
  width: 100%;
  margin: 0 auto;
}

/* Mobile (default) */
.container {
  padding-left: 1rem; /* 16px */
  padding-right: 1rem; /* 16px */
  max-width: none;
}

/* Small tablets (sm: 640px+) */
@media (min-width: 640px) {
  .container {
    padding-left: 1.5rem; /* 24px */
    padding-right: 1.5rem; /* 24px */
    max-width: 640px;
  }
}

/* Tablets (md: 768px+) */
@media (min-width: 768px) {
  .container {
    padding-left: 2rem; /* 32px */
    padding-right: 2rem; /* 32px */
    max-width: 768px;
  }
}

/* Small desktops (lg: 1024px+) */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

/* Large desktops (xl: 1280px+) */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

/* Extra large desktops (2xl: 1400px+) */
@media (min-width: 1400px) {
  .container {
    max-width: 1400px;
  }
}
\`\`\`

## Section-by-Section Responsive Breakdown

### Header Section

#### Mobile (< 768px)
\`\`\`css
.header {
  height: 64px; /* Same as desktop */
  padding: 0 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-logo {
  width: 100px; /* Smaller than desktop 120px */
  height: auto;
}

.header-nav {
  display: none; /* Hidden on mobile */
}

.header-actions {
  display: none; /* Hidden on mobile */
}

.mobile-menu-trigger {
  display: block;
  width: 40px;
  height: 40px;
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.header-logo {
  width: 110px;
}

.header-nav {
  display: flex;
  gap: 1.5rem; /* Reduced from desktop 2rem */
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.mobile-menu-trigger {
  display: none;
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.header-logo {
  width: 120px;
}

.header-nav {
  gap: 2rem;
}

.header-actions {
  gap: 0.75rem;
}
\`\`\`

### Hero Section

#### Mobile (< 768px)
\`\`\`css
.hero {
  padding: 4rem 0; /* Reduced from desktop 10rem */
  min-height: 500px; /* Reduced from desktop 600px */
}

.hero-content {
  max-width: none; /* Full width on mobile */
  text-align: center;
}

.hero-title {
  font-size: 2.25rem; /* text-4xl, reduced from text-5xl */
  line-height: 2.5rem;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 0.875rem; /* text-sm */
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1rem; /* text-base, reduced from text-lg */
  line-height: 1.5;
  margin-bottom: 2rem;
}

.hero-ctas {
  flex-direction: column;
  gap: 0.75rem;
  align-items: stretch;
}

.hero-cta-button {
  width: 100%;
  justify-content: center;
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.hero {
  padding: 6rem 0;
  min-height: 550px;
}

.hero-title {
  font-size: 3rem; /* text-5xl but smaller line-height */
  line-height: 1.1;
}

.hero-description {
  font-size: 1.125rem; /* text-lg */
}

.hero-ctas {
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
}

.hero-cta-button {
  width: auto;
  min-width: 140px;
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.hero {
  padding: 10rem 0;
  min-height: 600px;
}

.hero-content {
  max-width: 56rem; /* max-w-4xl */
}

.hero-title {
  font-size: 3rem; /* text-5xl */
  line-height: 1.1;
}

.hero-ctas {
  gap: 1rem;
}
\`\`\`

### Companies Section

#### Mobile (< 768px)
\`\`\`css
.companies {
  padding: 2rem 0; /* Reduced from desktop 3rem */
}

.companies-title {
  margin-bottom: 1.5rem;
  font-size: 0.75rem; /* text-xs */
}

.companies-carousel {
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.companies-carousel::-webkit-scrollbar {
  display: none;
}

.companies-list {
  display: flex;
  gap: 2rem; /* Reduced from desktop 4rem */
  padding: 0 1rem;
}

.company-logo {
  flex-shrink: 0;
  width: 80px; /* Reduced from desktop 120px */
  height: 40px; /* Reduced from desktop 60px */
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.companies {
  padding: 2.5rem 0;
}

.companies-list {
  gap: 3rem;
}

.company-logo {
  width: 100px;
  height: 50px;
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.companies {
  padding: 3rem 0;
}

.companies-list {
  gap: 4rem;
}

.company-logo {
  width: 120px;
  height: 60px;
}
\`\`\`

### Features Grid Section

#### Mobile (< 768px)
\`\`\`css
.features-grid {
  padding: 4rem 0; /* Reduced from desktop 10rem */
}

.features-header {
  margin-bottom: 3rem; /* Reduced from desktop 4rem */
}

.features-title {
  font-size: 1.875rem; /* text-3xl, reduced from text-4xl */
  line-height: 2.25rem;
  margin-bottom: 1rem;
}

.features-grid-container {
  display: grid;
  grid-template-columns: 1fr; /* Single column */
  gap: 1.5rem; /* Reduced from desktop 2rem */
}

.feature-card {
  padding: 1.5rem; /* Reduced from desktop 1.5rem */
}

.feature-icon-container {
  width: 2.5rem; /* Reduced from desktop 3rem */
  height: 2.5rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1rem; /* text-base, reduced from text-lg */
  margin-bottom: 0.5rem;
}

.feature-description {
  font-size: 0.875rem; /* text-sm, reduced from text-base */
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.features-grid {
  padding: 6rem 0;
}

.features-grid-container {
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 1.5rem;
}

.feature-title {
  font-size: 1.125rem; /* text-lg */
}

.feature-description {
  font-size: 1rem; /* text-base */
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.features-grid {
  padding: 10rem 0;
}

.features-header {
  margin-bottom: 4rem;
}

.features-title {
  font-size: 2rem; /* text-3xl */
}

.features-grid-container {
  grid-template-columns: repeat(3, 1fr); /* Three columns */
  gap: 2rem;
}

.feature-card {
  padding: 1.5rem;
}

.feature-icon-container {
  width: 3rem;
  height: 3rem;
}
\`\`\`

### Big Feature Section

#### Mobile (< 768px)
\`\`\`css
.big-feature {
  padding: 4rem 0;
}

.big-feature-grid {
  display: grid;
  grid-template-columns: 1fr; /* Single column */
  gap: 2rem;
}

.big-feature-content {
  order: 2; /* Content below image on mobile */
}

.big-feature-image {
  order: 1; /* Image above content on mobile */
  aspect-ratio: 16/10; /* Different aspect ratio for mobile */
}

.big-feature-title {
  font-size: 1.5rem; /* text-2xl, reduced from text-3xl */
  line-height: 2rem;
  margin-bottom: 1rem;
}

.big-feature-description {
  font-size: 1rem; /* text-base, reduced from text-lg */
  margin-bottom: 1.5rem;
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.big-feature {
  padding: 6rem 0;
}

.big-feature-grid {
  grid-template-columns: 1fr 1fr; /* Equal columns */
  gap: 3rem;
  align-items: center;
}

.big-feature-content {
  order: initial;
}

.big-feature-image {
  order: initial;
  aspect-ratio: 4/3;
}

.big-feature-title {
  font-size: 1.875rem; /* text-3xl */
}

.big-feature-description {
  font-size: 1.125rem; /* text-lg */
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.big-feature {
  padding: 10rem 0;
}

.big-feature-grid {
  grid-template-columns: 1.2fr 1fr; /* Asymmetric columns */
  gap: 4rem;
}

.big-feature-title {
  font-size: 2rem; /* text-3xl */
}
\`\`\`

### Testimonials Section

#### Mobile (< 768px)
\`\`\`css
.testimonials {
  padding: 4rem 0;
}

.testimonials-header {
  margin-bottom: 2rem;
}

.testimonials-title {
  font-size: 1.5rem; /* text-2xl, reduced from text-3xl */
}

.testimonials-carousel {
  overflow-x: auto;
  scrollbar-width: none;
}

.testimonials-slides {
  display: flex;
  gap: 1rem;
  padding: 0 1rem;
}

.testimonial-slide {
  flex: 0 0 280px; /* Fixed width for mobile scrolling */
  min-width: 280px;
}

.testimonial-card {
  padding: 1.5rem;
  height: auto; /* Remove fixed height on mobile */
}

.testimonial-quote {
  font-size: 1rem; /* text-base, reduced from text-lg */
  margin-bottom: 1rem;
}

.testimonial-author {
  gap: 0.75rem;
}

.testimonial-avatar {
  width: 2.5rem; /* Reduced from desktop 3rem */
  height: 2.5rem;
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.testimonials {
  padding: 6rem 0;
}

.testimonials-title {
  font-size: 1.875rem; /* text-3xl */
}

.testimonial-slide {
  flex: 0 0 50%; /* Two slides visible */
}

.testimonial-card {
  padding: 1.5rem;
}

.testimonial-avatar {
  width: 2.5rem;
  height: 2.5rem;
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.testimonials {
  padding: 10rem 0;
}

.testimonials-header {
  margin-bottom: 4rem;
}

.testimonials-title {
  font-size: 2rem; /* text-3xl */
}

.testimonial-slide {
  flex: 0 0 33.333%; /* Three slides visible */
}

.testimonial-card {
  padding: 1.5rem;
  height: 100%; /* Full height for consistent card sizes */
}

.testimonial-avatar {
  width: 2.5rem;
  height: 2.5rem;
}
\`\`\`

### Pricing Section

#### Mobile (< 768px)
\`\`\`css
.pricing {
  padding: 4rem 0;
}

.pricing-header {
  margin-bottom: 2rem;
}

.pricing-title {
  font-size: 1.5rem; /* text-2xl */
}

.pricing-toggle {
  margin-top: 1.5rem;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.pricing-grid {
  display: grid;
  grid-template-columns: 1fr; /* Single column */
  gap: 1.5rem;
  margin-top: 2rem;
}

.pricing-card {
  padding: 1.5rem; /* Reduced from desktop 2rem */
}

.pricing-card.featured {
  transform: none; /* Remove scale on mobile */
  order: -1; /* Featured card first on mobile */
}

.pricing-header-section {
  margin-bottom: 1.5rem;
}

.pricing-plan-name {
  font-size: 1.125rem; /* text-lg, reduced from text-xl */
}

.pricing-amount {
  font-size: 2.25rem; /* text-4xl, reduced from text-5xl */
}

.pricing-features {
  margin-bottom: 1.5rem;
}

.pricing-feature {
  font-size: 0.875rem; /* text-sm */
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.pricing {
  padding: 6rem 0;
}

.pricing-title {
  font-size: 1.875rem; /* text-3xl */
}

.pricing-toggle {
  flex-direction: row;
  gap: 1rem;
}

.pricing-grid {
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 1.5rem;
}

.pricing-card.featured {
  grid-column: 1 / -1; /* Featured card spans full width */
  max-width: 400px;
  margin: 0 auto;
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.pricing {
  padding: 10rem 0;
}

.pricing-header {
  margin-bottom: 4rem;
}

.pricing-title {
  font-size: 2rem; /* text-3xl */
}

.pricing-grid {
  grid-template-columns: repeat(3, 1fr); /* Three columns */
  gap: 2rem;
}

.pricing-card {
  padding: 2rem;
}

.pricing-card.featured {
  transform: scale(1.05);
  grid-column: initial;
  max-width: initial;
}
\`\`\`

### FAQ Section

#### Mobile (< 768px)
\`\`\`css
.faq {
  padding: 4rem 0;
}

.faq-header {
  margin-bottom: 2rem;
}

.faq-title {
  font-size: 1.5rem; /* text-2xl */
}

.faq-accordion {
  max-width: none; /* Full width on mobile */
}

.faq-trigger {
  font-size: 1rem; /* text-base, reduced from text-lg */
  padding: 1rem 0;
  text-align: left;
}

.faq-content {
  padding: 0 0 1rem 0;
}

.faq-answer {
  font-size: 0.875rem; /* text-sm, reduced from text-base */
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.faq {
  padding: 6rem 0;
}

.faq-title {
  font-size: 1.875rem; /* text-3xl */
}

.faq-accordion {
  max-width: 42rem; /* max-w-2xl */
}

.faq-trigger {
  font-size: 1.125rem; /* text-lg */
}

.faq-answer {
  font-size: 1rem; /* text-base */
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.faq {
  padding: 10rem 0;
}

.faq-header {
  margin-bottom: 4rem;
}

.faq-title {
  font-size: 2rem; /* text-3xl */
}

.faq-accordion {
  max-width: 48rem; /* max-w-3xl */
}
\`\`\`

### CTA Section

#### Mobile (< 768px)
\`\`\`css
.cta {
  padding: 4rem 0;
}

.cta-content {
  max-width: none;
}

.cta-title {
  font-size: 1.875rem; /* text-3xl, reduced from text-4xl */
  line-height: 2.25rem;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1rem; /* text-base, reduced from text-lg */
  margin-bottom: 1.5rem;
}

.cta-button {
  width: 100%;
  justify-content: center;
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.cta {
  padding: 6rem 0;
}

.cta-title {
  font-size: 2.25rem; /* text-4xl */
}

.cta-description {
  font-size: 1.125rem; /* text-lg */
}

.cta-button {
  width: auto;
  min-width: 160px;
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.cta {
  padding: 10rem 0;
}

.cta-content {
  max-width: 56rem; /* max-w-4xl */
}
\`\`\`

### Newsletter Section

#### Mobile (< 768px)
\`\`\`css
.newsletter {
  padding: 3rem 0; /* Reduced from desktop 4rem */
}

.newsletter-content {
  max-width: none;
}

.newsletter-title {
  font-size: 1.25rem; /* text-xl, reduced from text-2xl */
  margin-bottom: 0.75rem;
}

.newsletter-description {
  font-size: 0.875rem; /* text-sm, reduced from text-base */
  margin-bottom: 1.5rem;
}

.newsletter-form {
  flex-direction: column;
  gap: 0.75rem;
  max-width: none;
}

.newsletter-input {
  width: 100%;
}

.newsletter-button {
  width: 100%;
}

.newsletter-disclaimer {
  margin-top: 1rem;
  font-size: 0.75rem; /* text-xs */
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.newsletter {
  padding: 3.5rem 0;
}

.newsletter-title {
  font-size: 1.5rem; /* text-2xl */
}

.newsletter-description {
  font-size: 1rem; /* text-base */
}

.newsletter-form {
  flex-direction: row;
  max-width: 28rem; /* max-w-md */
}

.newsletter-input {
  flex: 1;
}

.newsletter-button {
  width: auto;
  min-width: 120px;
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.newsletter {
  padding: 4rem 0;
}

.newsletter-content {
  max-width: 32rem; /* max-w-2xl */
}
\`\`\`

### Footer Section

#### Mobile (< 768px)
\`\`\`css
.footer {
  padding: 3rem 0; /* Reduced from desktop 6rem */
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr; /* Single column */
  gap: 2rem;
}

.footer-company {
  order: -1; /* Company info first on mobile */
  text-align: center;
}

.footer-logo {
  width: 100px;
  margin: 0 auto 1rem;
}

.footer-description {
  font-size: 0.875rem; /* text-sm */
  margin-bottom: 1rem;
}

.footer-social {
  justify-content: center;
  gap: 1rem;
}

.footer-nav-column {
  text-align: center;
}

.footer-nav-title {
  font-size: 1rem; /* text-base */
  margin-bottom: 0.75rem;
}

.footer-nav-links {
  gap: 0.5rem;
}

.footer-nav-link {
  font-size: 0.875rem; /* text-sm */
}

.footer-bottom {
  margin-top: 2rem;
  padding-top: 2rem;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}

.footer-legal-links {
  gap: 1.5rem;
}
\`\`\`

#### Tablet (768px - 1023px)
\`\`\`css
.footer {
  padding: 4rem 0;
}

.footer-grid {
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 2rem;
}

.footer-company {
  grid-column: 1 / -1; /* Company spans full width */
  text-align: left;
}

.footer-logo {
  width: 110px;
  margin: 0 0 1rem 0;
}

.footer-social {
  justify-content: flex-start;
}

.footer-nav-column {
  text-align: left;
}

.footer-bottom {
  flex-direction: row;
  justify-content: space-between;
  text-align: left;
}
\`\`\`

#### Desktop (1024px+)
\`\`\`css
.footer {
  padding: 6rem 0;
}

.footer-grid {
  grid-template-columns: 1fr repeat(3, 1fr); /* Four columns */
  gap: 2rem;
}

.footer-company {
  grid-column: initial;
}

.footer-logo {
  width: 120px;
}
\`\`\`

## Touch and Mobile Interactions

### Touch Target Sizes
\`\`\`css
/* Minimum 44px touch targets for mobile */
@media (max-width: 767px) {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
  
  .btn-mobile {
    min-height: 48px;
    padding: 0.75rem 1.5rem;
  }
  
  .nav-link-mobile {
    padding: 1rem;
    display: block;
  }
}
\`\`\`

### Mobile Menu Behavior
\`\`\`css
.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 400px;
  height: 100vh;
  background: hsl(var(--background));
  transform: translateX(100%);
  transition: transform 300ms ease-out;
  z-index: 50;
}

.mobile-menu.open {
  transform: translateX(0);
}

.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 300ms ease-out;
  z-index: 40;
}

.mobile-menu-overlay.open {
  opacity: 1;
  visibility: visible;
}
\`\`\`

## Performance Considerations

### Image Responsive Behavior
\`\`\`css
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Different aspect ratios per breakpoint */
@media (max-width: 767px) {
  .hero-image { aspect-ratio: 16/10; }
  .feature-image { aspect-ratio: 16/10; }
}

@media (min-width: 768px) {
  .hero-image { aspect-ratio: 16/9; }
  .feature-image { aspect-ratio: 4/3; }
}
\`\`\`

### Font Loading Strategy
\`\`\`css
/* Responsive font loading */
@media (max-width: 767px) {
  body {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Reduce font weights on mobile for performance */
@media (max-width: 767px) {
  .font-bold {
    font-weight: 600; /* Reduce from 700 */
  }
  
  .font-extrabold {
    font-weight: 700; /* Reduce from 800 */
  }
}
\`\`\`

This comprehensive responsive design system ensures the homepage works perfectly across all device sizes while maintaining visual hierarchy and usability at every breakpoint.
