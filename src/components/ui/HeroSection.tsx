interface HeroSectionProps {
  title: string;
  subtitle: string;
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
        {title}
      </h1>
      <p className="text-xl text-gray-300 leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
} 