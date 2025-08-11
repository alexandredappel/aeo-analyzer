/**
 * Animations & Interactive Behaviors Documentation
 *
 * This file documents all animations, transitions, and interactive
 * behaviors used throughout the application.
 */

// ===== CSS ANIMATIONS =====
export const cssAnimations = {
  // Accordion animations (Radix UI)
  accordion: {
    keyframes: {
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
    },
    classes: {
      down: "animate-accordion-down",
      up: "animate-accordion-up",
    },
    duration: "0.2s ease-out",
  },

  // Fade animations
  fade: {
    keyframes: {
      "fade-in": {
        from: { opacity: "0", transform: "translateY(10px)" },
        to: { opacity: "1", transform: "translateY(0)" },
      },
      "fade-out": {
        from: { opacity: "1", transform: "translateY(0)" },
        to: { opacity: "0", transform: "translateY(-10px)" },
      },
    },
    classes: {
      in: "animate-fade-in",
      out: "animate-fade-out",
    },
    duration: "0.3s ease-out",
  },

  // Slide animations
  slide: {
    keyframes: {
      "slide-in-left": {
        from: { opacity: "0", transform: "translateX(-20px)" },
        to: { opacity: "1", transform: "translateX(0)" },
      },
      "slide-in-right": {
        from: { opacity: "0", transform: "translateX(20px)" },
        to: { opacity: "1", transform: "translateX(0)" },
      },
    },
    classes: {
      inLeft: "animate-slide-in-left",
      inRight: "animate-slide-in-right",
    },
    duration: "0.3s ease-out",
  },

  // Scale animations
  scale: {
    keyframes: {
      "scale-in": {
        from: { opacity: "0", transform: "scale(0.95)" },
        to: { opacity: "1", transform: "scale(1)" },
      },
      "scale-out": {
        from: { opacity: "1", transform: "scale(1)" },
        to: { opacity: "0", transform: "scale(0.95)" },
      },
    },
    classes: {
      in: "animate-scale-in",
      out: "animate-scale-out",
    },
    duration: "0.2s ease-out",
  },
}

// ===== TRANSITION PATTERNS =====
export const transitionPatterns = {
  // Standard transitions
  standard: {
    all: "transition-all duration-200 ease-out",
    colors: "transition-colors duration-200 ease-out",
    transform: "transition-transform duration-200 ease-out",
    opacity: "transition-opacity duration-200 ease-out",
  },

  // Smooth transitions
  smooth: {
    all: "transition-all duration-300 ease-in-out",
    colors: "transition-colors duration-300 ease-in-out",
    transform: "transition-transform duration-300 ease-in-out",
  },

  // Fast transitions
  fast: {
    all: "transition-all duration-150 ease-out",
    colors: "transition-colors duration-150 ease-out",
    transform: "transition-transform duration-150 ease-out",
  },
}

// ===== HOVER EFFECTS =====
export const hoverEffects = {
  // Button hover effects
  button: {
    primary: "hover:bg-[--accent-600] hover:shadow-md",
    secondary: "hover:bg-[--surface-tertiary] hover:border-[--border]",
    tertiary: "hover:bg-[--dark-surface-tertiary] hover:text-[--dark-text-primary]",
    ghost: "hover:bg-[--surface-secondary] hover:text-[--text-primary]",
  },

  // Card hover effects
  card: {
    lift: "hover:shadow-lg hover:-translate-y-1",
    glow: "hover:shadow-xl hover:shadow-[--accent-500]/20",
    scale: "hover:scale-105",
    brightness: "hover:brightness-110",
  },

  // Link hover effects
  link: {
    underline: "hover:underline hover:underline-offset-4",
    color: "hover:text-[--accent-500]",
    brightness: "hover:brightness-75",
  },

  // Image hover effects
  image: {
    zoom: "hover:scale-110",
    brightness: "hover:brightness-110",
    grayscale: "hover:grayscale-0",
  },
}

// ===== FOCUS STATES =====
export const focusStates = {
  // Standard focus ring
  ring: "focus-visible:ring-2 focus-visible:ring-[--control] focus-visible:ring-offset-2 outline-none",

  // Custom focus styles
  custom: {
    button: "focus-visible:ring-2 focus-visible:ring-[--accent-500] focus-visible:ring-offset-2",
    input: "focus:ring-2 focus:ring-[--accent-500] focus:border-[--accent-500]",
    link: "focus-visible:ring-2 focus-visible:ring-[--accent-500] focus-visible:ring-offset-1",
  },

  // Focus within (for containers)
  within: "focus-within:ring-2 focus-within:ring-[--accent-500] focus-within:ring-offset-2",
}

// ===== LOADING STATES =====
export const loadingStates = {
  // Skeleton loading
  skeleton: {
    base: "animate-pulse bg-[--surface-secondary] rounded",
    text: "h-4 bg-[--surface-secondary] rounded animate-pulse",
    avatar: "w-10 h-10 bg-[--surface-secondary] rounded-full animate-pulse",
    button: "h-10 w-24 bg-[--surface-secondary] rounded animate-pulse",
  },

  // Spinner loading
  spinner: {
    base: "animate-spin rounded-full border-2 border-[--surface-secondary] border-t-[--accent-500]",
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  },

  // Pulse loading
  pulse: {
    base: "animate-pulse",
    slow: "animate-pulse [animation-duration:2s]",
    fast: "animate-pulse [animation-duration:1s]",
  },
}

// ===== INTERACTIVE BEHAVIORS =====
export const interactiveBehaviors = {
  // Click effects
  click: {
    scale: "active:scale-95",
    brightness: "active:brightness-90",
    translate: "active:translate-y-px",
  },

  // Drag and drop
  drag: {
    dragging: "cursor-grabbing opacity-75 rotate-3 scale-105",
    dropzone: "border-dashed border-2 border-[--accent-500] bg-[--accent-500]/10",
    dragover: "border-[--accent-600] bg-[--accent-500]/20",
  },

  // Selection states
  selection: {
    selected: "bg-[--accent-500] text-[--text-on-accent-primary]",
    multiSelect: "ring-2 ring-[--accent-500] ring-offset-2",
    hover: "hover:bg-[--surface-secondary]",
  },

  // Disabled states
  disabled: {
    opacity: "opacity-50 cursor-not-allowed",
    grayscale: "grayscale cursor-not-allowed",
    pointer: "pointer-events-none",
  },
}

// ===== CAROUSEL ANIMATIONS =====
export const carouselAnimations = {
  // Embla Carousel configuration
  embla: {
    options: {
      align: "start",
      loop: true,
      skipSnaps: false,
      dragFree: false,
    },

    // Slide transitions
    slide: {
      base: "flex-[0_0_100%] min-w-0",
      transform: "transition-transform duration-300 ease-out",
    },

    // Navigation buttons
    navigation: {
      prev: "hover:bg-[--surface-secondary] disabled:opacity-50",
      next: "hover:bg-[--surface-secondary] disabled:opacity-50",
    },

    // Dots indicator
    dots: {
      active: "bg-[--accent-500]",
      inactive: "bg-[--surface-tertiary] hover:bg-[--surface-secondary]",
    },
  },

  // Auto-play behavior
  autoplay: {
    delay: 4000, // 4 seconds
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  },
}

// ===== SCROLL ANIMATIONS =====
export const scrollAnimations = {
  // Intersection Observer animations
  observer: {
    fadeIn: {
      initial: "opacity-0 translate-y-8",
      animate: "opacity-100 translate-y-0",
      transition: "transition-all duration-700 ease-out",
    },

    slideInLeft: {
      initial: "opacity-0 -translate-x-8",
      animate: "opacity-100 translate-x-0",
      transition: "transition-all duration-700 ease-out",
    },

    slideInRight: {
      initial: "opacity-0 translate-x-8",
      animate: "opacity-100 translate-x-0",
      transition: "transition-all duration-700 ease-out",
    },

    scaleIn: {
      initial: "opacity-0 scale-95",
      animate: "opacity-100 scale-100",
      transition: "transition-all duration-500 ease-out",
    },
  },

  // Stagger animations
  stagger: {
    children: "[&>*:nth-child(1)]:delay-0 [&>*:nth-child(2)]:delay-100 [&>*:nth-child(3)]:delay-200",
    cards: "[&>*:nth-child(odd)]:delay-0 [&>*:nth-child(even)]:delay-150",
  },
}

// ===== THEME TRANSITION =====
export const themeTransition = {
  // Smooth theme switching
  colors: "transition-colors duration-300 ease-in-out",
  background: "transition-[background-color,border-color] duration-300 ease-in-out",
  all: "transition-[background-color,border-color,color,fill,stroke] duration-300 ease-in-out",

  // Theme switcher animation
  switcher: {
    button: "transition-all duration-200 ease-out",
    icon: "transition-transform duration-200 ease-out",
    selected: "scale-110",
  },
}

// ===== FORM ANIMATIONS =====
export const formAnimations = {
  // Input focus animations
  input: {
    focus: "focus:ring-2 focus:ring-[--accent-500] focus:border-[--accent-500] transition-all duration-200",
    error: "ring-2 ring-red-500 border-red-500",
    success: "ring-2 ring-green-500 border-green-500",
  },

  // Label animations
  label: {
    float: "transition-all duration-200 ease-out",
    focused: "text-xs -translate-y-4 text-[--accent-500]",
    error: "text-red-500",
  },

  // Validation feedback
  feedback: {
    slideDown: "animate-slide-down",
    fadeIn: "animate-fade-in",
    shake: "animate-shake",
  },
}

// ===== MODAL ANIMATIONS =====
export const modalAnimations = {
  // Dialog animations (Radix UI)
  dialog: {
    overlay: {
      initial: "opacity-0",
      animate: "opacity-100",
      exit: "opacity-0",
      transition: "transition-opacity duration-200",
    },

    content: {
      initial: "opacity-0 scale-95 translate-y-4",
      animate: "opacity-100 scale-100 translate-y-0",
      exit: "opacity-0 scale-95 translate-y-4",
      transition: "transition-all duration-200 ease-out",
    },
  },

  // Sheet animations (mobile drawer)
  sheet: {
    overlay: {
      initial: "opacity-0",
      animate: "opacity-100",
      exit: "opacity-0",
    },

    content: {
      fromRight: {
        initial: "translate-x-full",
        animate: "translate-x-0",
        exit: "translate-x-full",
      },
      fromLeft: {
        initial: "-translate-x-full",
        animate: "translate-x-0",
        exit: "-translate-x-full",
      },
      fromBottom: {
        initial: "translate-y-full",
        animate: "translate-y-0",
        exit: "translate-y-full",
      },
    },
  },

  // Popover animations
  popover: {
    initial: "opacity-0 scale-95",
    animate: "opacity-100 scale-100",
    exit: "opacity-0 scale-95",
    transition: "transition-all duration-150 ease-out",
  },
}

// ===== TOAST ANIMATIONS =====
export const toastAnimations = {
  // Sonner toast animations
  sonner: {
    enter: {
      initial: "opacity-0 translate-x-full scale-95",
      animate: "opacity-100 translate-x-0 scale-100",
      transition: "transition-all duration-300 ease-out",
    },

    exit: {
      initial: "opacity-100 translate-x-0 scale-100",
      animate: "opacity-0 translate-x-full scale-95",
      transition: "transition-all duration-200 ease-in",
    },

    swipe: {
      threshold: 50,
      direction: "right",
    },
  },

  // Custom toast positions
  positions: {
    topRight: "top-4 right-4",
    topLeft: "top-4 left-4",
    bottomRight: "bottom-4 right-4",
    bottomLeft: "bottom-4 left-4",
    topCenter: "top-4 left-1/2 -translate-x-1/2",
    bottomCenter: "bottom-4 left-1/2 -translate-x-1/2",
  },
}

// ===== PERFORMANCE CONSIDERATIONS =====
export const performanceNotes = {
  // Animation performance tips
  tips: [
    "Use transform and opacity for smooth animations",
    "Avoid animating layout properties (width, height, padding)",
    "Use will-change sparingly and remove after animation",
    "Prefer CSS animations over JavaScript for simple effects",
    "Use requestAnimationFrame for complex JavaScript animations",
  ],

  // Reduced motion support
  reducedMotion: {
    mediaQuery: "@media (prefers-reduced-motion: reduce)",
    implementation: "Disable animations and use instant transitions",
    classes: "motion-reduce:transition-none motion-reduce:animate-none",
  },

  // Hardware acceleration
  acceleration: {
    transform3d: "transform: translate3d(0, 0, 0)",
    willChange: "will-change: transform, opacity",
    backfaceVisibility: "backface-visibility: hidden",
  },
}
