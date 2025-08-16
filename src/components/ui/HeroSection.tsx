interface HeroSectionProps {
  title: string;
  subtitle: string;
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="inline-block bg-surface text-app px-4 py-2 rounded-[var(--radius-xl)] text-sm font-medium border border-accent-1">
          Generative Engine Optimization (GEO)
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold text-app leading-tight">
          {title}
        </h1>
        <p className="text-xl text-app/80 leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
    </div>
  );
} 