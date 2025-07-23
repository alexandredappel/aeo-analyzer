interface HeroSectionProps {
  title: string;
  subtitle: string;
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          Generative Engine Optimization (GEO)
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          {title}
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
    </div>
  );
} 