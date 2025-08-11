# Homepage Animations & Interactive Behaviors

This document defines all animations, transitions, and interactive behaviors used throughout the homepage with exact specifications for implementation.

## Animation Architecture

### CSS Custom Properties for Animations
\`\`\`css
:root {
  --animation-duration-fast: 150ms;
  --animation-duration-normal: 200ms;
  --animation-duration-slow: 300ms;
  --animation-duration-slower: 500ms;
  
  --animation-easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --animation-easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
\`\`\`

### Global Animation Classes
\`\`\`css
.transition-smooth {
  transition: all var(--animation-duration-normal) var(--animation-easing-ease-out);
}

.transition-colors {
  transition: color var(--animation-duration-normal) var(--animation-easing-ease-out),
              background-color var(--animation-duration-normal) var(--animation-easing-ease-out),
              border-color var(--animation-duration-normal) var(--animation-easing-ease-out);
}

.transition-transform {
  transition: transform var(--animation-duration-normal) var(--animation-easing-ease-out);
}
\`\`\`

## Page Load Animations

### Initial Page Load
\`\`\`css
@keyframes page-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

body {
  animation: page-fade-in 300ms ease-out;
}
\`\`\`

### Staggered Content Reveal
\`\`\`css
@keyframes slide-up-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up-fade-in 500ms ease-out;
}

/* Stagger delays */
.stagger-1 { animation-delay: 100ms; }
.stagger-2 { animation-delay: 200ms; }
.stagger-3 { animation-delay: 300ms; }
.stagger-4 { animation-delay: 400ms; }
\`\`\`

## Header Animations

### Header Scroll Behavior
\`\`\`css
.header {
  transition: all 200ms ease-out;
}

.header.scrolled {
  background: hsla(var(--background), 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid hsl(var(--border));
}
\`\`\`

### Navigation Link Hover
\`\`\`css
.nav-link {
  position: relative;
  transition: color 200ms ease-out;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: hsl(var(--primary));
  transition: width 200ms ease-out;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link:hover {
  color: hsl(var(--primary));
}
\`\`\`

### Mobile Menu Animation
\`\`\`css
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}

.mobile-menu-enter {
  animation: slide-in-right 300ms ease-out;
}

.mobile-menu-exit {
  animation: slide-out-right 300ms ease-in;
}
\`\`\`

## Hero Section Animations

### Hero Content Entrance
\`\`\`css
@keyframes hero-title-entrance {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes hero-subtitle-entrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hero-cta-entrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  animation: hero-title-entrance 600ms ease-out;
}

.hero-subtitle {
  animation: hero-subtitle-entrance 600ms ease-out 200ms both;
}

.hero-description {
  animation: hero-subtitle-entrance 600ms ease-out 400ms both;
}

.hero-cta {
  animation: hero-cta-entrance 600ms ease-out 600ms both;
}
\`\`\`

### Hero Background Parallax
\`\`\`css
.hero-background {
  transition: transform 100ms ease-out;
}

/* Applied via JavaScript on scroll */
.hero-background.parallax {
  transform: translateY(var(--scroll-offset));
}
\`\`\`

## Button Animations

### Primary Button Interactions
\`\`\`css
.btn-primary {
  position: relative;
  overflow: hidden;
  transition: all 200ms ease-out;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 500ms ease-out;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
\`\`\`

### Secondary Button Interactions
\`\`\`css
.btn-secondary {
  transition: all 200ms ease-out;
  border: 1px solid hsl(var(--border));
}

.btn-secondary:hover {
  background: hsl(var(--secondary));
  border-color: hsl(var(--primary));
  transform: translateY(-1px);
}

.btn-secondary:active {
  transform: translateY(0);
}
\`\`\`

### Button Loading State
\`\`\`css
@keyframes button-loading {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: button-loading 1s linear infinite;
}
\`\`\`

## Companies Section Animations

### Logo Carousel Animation
\`\`\`css
@keyframes scroll-logos {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.companies-carousel {
  animation: scroll-logos 30s linear infinite;
}

.companies-carousel:hover {
  animation-play-state: paused;
}
\`\`\`

### Logo Hover Effects
\`\`\`css
.company-logo {
  opacity: 0.6;
  transition: all 300ms ease-out;
  filter: grayscale(100%);
}

.company-logo:hover {
  opacity: 1;
  filter: grayscale(0%);
  transform: scale(1.05);
}
\`\`\`

## Features Grid Animations

### Card Entrance Animation
\`\`\`css
@keyframes card-entrance {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card {
  animation: card-entrance 500ms ease-out;
}

/* Staggered entrance */
.feature-card:nth-child(1) { animation-delay: 0ms; }
.feature-card:nth-child(2) { animation-delay: 100ms; }
.feature-card:nth-child(3) { animation-delay: 200ms; }
.feature-card:nth-child(4) { animation-delay: 300ms; }
.feature-card:nth-child(5) { animation-delay: 400ms; }
.feature-card:nth-child(6) { animation-delay: 500ms; }
\`\`\`

### Card Hover Effects
\`\`\`css
.feature-card {
  position: relative;
  transition: all 300ms ease-out;
  border: 1px solid hsl(var(--border));
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.1));
  border-radius: inherit;
  opacity: 0;
  transition: opacity 300ms ease-out;
  z-index: -1;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border-color: hsl(var(--primary) / 0.2);
}

.feature-card:hover::before {
  opacity: 1;
}
\`\`\`

### Icon Animation
\`\`\`css
.feature-icon {
  transition: all 300ms ease-out;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
  color: hsl(var(--primary));
}
\`\`\`

## Big Feature Section Animations

### Content Slide-In Animation
\`\`\`css
@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.feature-content {
  animation: slide-in-left 600ms ease-out;
}

.feature-image {
  animation: slide-in-right 600ms ease-out 200ms both;
}

/* Reversed layout */
.feature-reversed .feature-content {
  animation: slide-in-right 600ms ease-out;
}

.feature-reversed .feature-image {
  animation: slide-in-left 600ms ease-out 200ms both;
}
\`\`\`

### Image Hover Effect
\`\`\`css
.feature-image {
  overflow: hidden;
  border-radius: 8px;
  transition: all 300ms ease-out;
}

.feature-image img {
  transition: transform 500ms ease-out;
}

.feature-image:hover {
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.feature-image:hover img {
  transform: scale(1.05);
}
\`\`\`

## Testimonials Section Animations

### Carousel Slide Transitions
\`\`\`css
.testimonial-slide {
  transition: all 300ms ease-out;
  opacity: 0.7;
  transform: scale(0.95);
}

.testimonial-slide.active {
  opacity: 1;
  transform: scale(1);
}
\`\`\`

### Card Hover Effects
\`\`\`css
.testimonial-card {
  transition: all 300ms ease-out;
  border: 1px solid hsl(var(--border));
}

.testimonial-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: hsl(var(--primary) / 0.2);
}
\`\`\`

### Avatar Animation
\`\`\`css
.testimonial-avatar {
  transition: all 300ms ease-out;
}

.testimonial-card:hover .testimonial-avatar {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
\`\`\`

## Pricing Section Animations

### Billing Toggle Animation
\`\`\`css
.billing-toggle {
  position: relative;
  transition: all 200ms ease-out;
}

.billing-toggle-thumb {
  transition: transform 200ms ease-out;
}

.billing-toggle[data-state="checked"] .billing-toggle-thumb {
  transform: translateX(20px);
}
\`\`\`

### Price Change Animation
\`\`\`css
@keyframes price-change {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.price-amount {
  transition: all 200ms ease-out;
}

.price-amount.changing {
  animation: price-change 300ms ease-out;
}
\`\`\`

### Pricing Card Hover
\`\`\`css
.pricing-card {
  transition: all 300ms ease-out;
  border: 1px solid hsl(var(--border));
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.1);
}

.pricing-card.featured {
  transform: scale(1.05);
  border-color: hsl(var(--primary));
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.pricing-card.featured:hover {
  transform: scale(1.05) translateY(-4px);
}
\`\`\`

### Feature List Animation
\`\`\`css
.pricing-feature {
  opacity: 0;
  transform: translateX(-10px);
  animation: slide-in-feature 300ms ease-out forwards;
}

@keyframes slide-in-feature {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.pricing-feature:nth-child(1) { animation-delay: 100ms; }
.pricing-feature:nth-child(2) { animation-delay: 150ms; }
.pricing-feature:nth-child(3) { animation-delay: 200ms; }
.pricing-feature:nth-child(4) { animation-delay: 250ms; }
.pricing-feature:nth-child(5) { animation-delay: 300ms; }
\`\`\`

## FAQ Section Animations

### Accordion Animations
\`\`\`css
@keyframes accordion-down {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
    opacity: 1;
  }
}

@keyframes accordion-up {
  from {
    height: var(--radix-accordion-content-height);
    opacity: 1;
  }
  to {
    height: 0;
    opacity: 0;
  }
}

.accordion-content[data-state="open"] {
  animation: accordion-down 300ms ease-out;
}

.accordion-content[data-state="closed"] {
  animation: accordion-up 300ms ease-out;
}
\`\`\`

### Accordion Trigger Animation
\`\`\`css
.accordion-trigger {
  transition: all 200ms ease-out;
}

.accordion-trigger:hover {
  color: hsl(var(--primary));
}

.accordion-trigger[data-state="open"] .accordion-chevron {
  transform: rotate(180deg);
}

.accordion-chevron {
  transition: transform 200ms ease-out;
}
\`\`\`

## CTA Section Animations

### Background Parallax
\`\`\`css
.cta-background {
  transition: transform 100ms ease-out;
}

/* Applied via JavaScript */
.cta-background.parallax {
  transform: translateY(var(--scroll-offset));
}
\`\`\`

### Content Animation
\`\`\`css
.cta-content {
  animation: slide-up-fade-in 600ms ease-out;
}

.cta-button {
  animation: slide-up-fade-in 600ms ease-out 200ms both;
}
\`\`\`

## Newsletter Section Animations

### Form Focus Animation
\`\`\`css
.newsletter-input {
  transition: all 200ms ease-out;
  border: 1px solid hsl(var(--border));
}

.newsletter-input:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
  transform: translateY(-1px);
}
\`\`\`

### Success Animation
\`\`\`css
@keyframes success-bounce {
  0%, 20%, 60%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  80% {
    transform: translateY(-5px);
  }
}

.newsletter-success {
  animation: success-bounce 600ms ease-out;
}
\`\`\`

## Footer Animations

### Link Hover Effects
\`\`\`css
.footer-link {
  position: relative;
  transition: color 200ms ease-out;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 200ms ease-out;
}

.footer-link:hover {
  color: hsl(var(--foreground));
}

.footer-link:hover::after {
  width: 100%;
}
\`\`\`

### Social Icon Animations
\`\`\`css
.social-icon {
  transition: all 200ms ease-out;
}

.social-icon:hover {
  color: hsl(var(--primary));
  transform: translateY(-2px) scale(1.1);
}
\`\`\`

## Scroll-Based Animations

### Intersection Observer Setup
\`\`\`javascript
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

// Apply to all sections
document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});
\`\`\`

### Scroll-Triggered Animations
\`\`\`css
.animate-in {
  animation: slide-up-fade-in 600ms ease-out;
}

.animate-in.stagger-1 { animation-delay: 100ms; }
.animate-in.stagger-2 { animation-delay: 200ms; }
.animate-in.stagger-3 { animation-delay: 300ms; }
\`\`\`

### Parallax Scroll Effects
\`\`\`javascript
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.parallax');
  
  parallaxElements.forEach(element => {
    const speed = element.dataset.speed || 0.5;
    const yPos = -(scrolled * speed);
    element.style.transform = `translateY(${yPos}px)`;
  });
});
\`\`\`

## Theme Transition Animations

### Theme Switch Animation
\`\`\`css
* {
  transition: background-color 300ms ease-in-out,
              border-color 300ms ease-in-out,
              color 300ms ease-in-out;
}

.theme-transition {
  transition: all 300ms ease-in-out;
}
\`\`\`

### Theme Toggle Button
\`\`\`css
.theme-toggle {
  transition: all 200ms ease-out;
}

.theme-toggle:hover {
  transform: scale(1.1);
}

.theme-toggle[data-theme="dark"] .sun-icon {
  transform: rotate(180deg) scale(0);
}

.theme-toggle[data-theme="light"] .moon-icon {
  transform: rotate(180deg) scale(0);
}

.theme-icon {
  transition: transform 300ms ease-out;
}
\`\`\`

## Performance Optimizations

### Hardware Acceleration
\`\`\`css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Remove will-change after animation */
.animation-complete {
  will-change: auto;
}
\`\`\`

### Reduced Motion Support
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .parallax {
    transform: none !important;
  }
}
\`\`\`

### Animation Cleanup
\`\`\`javascript
// Clean up animations on component unmount
const cleanupAnimations = () => {
  document.querySelectorAll('[style*="will-change"]').forEach(el => {
    el.style.willChange = 'auto';
  });
};

// Intersection Observer cleanup
const cleanupObserver = () => {
  if (observer) {
    observer.disconnect();
  }
};
\`\`\`

## Animation Triggers & Timing

### Page Load Sequence
1. **0ms**: Page fade-in starts
2. **100ms**: Header slides down
3. **300ms**: Hero content starts animating
4. **600ms**: Hero title completes
5. **800ms**: Hero subtitle completes
6. **1000ms**: Hero description completes
7. **1200ms**: Hero CTAs complete

### Scroll-Based Triggers
- **Companies Section**: Triggered at 10% visibility
- **Features Grid**: Triggered at 15% visibility with staggered cards
- **Big Feature**: Triggered at 20% visibility
- **Testimonials**: Triggered at 10% visibility
- **Pricing**: Triggered at 15% visibility
- **FAQ**: Triggered at 10% visibility
- **CTA**: Triggered at 20% visibility

### Interaction Delays
- **Button hover**: 0ms (immediate)
- **Card hover**: 0ms (immediate)
- **Link hover**: 0ms (immediate)
- **Form focus**: 0ms (immediate)
- **Accordion toggle**: 0ms (immediate)

### Animation Durations
- **Fast interactions**: 150ms (button clicks, small hovers)
- **Standard transitions**: 200ms (most hover effects)
- **Smooth animations**: 300ms (card hovers, theme changes)
- **Content reveals**: 500-600ms (scroll-triggered animations)
- **Page transitions**: 300ms (route changes)

This comprehensive animation system ensures smooth, performant, and accessible interactions throughout the homepage while maintaining visual consistency and user engagement.
