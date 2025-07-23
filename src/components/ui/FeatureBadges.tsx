interface FeatureBadgesProps {
  className?: string;
}

export function FeatureBadges({ className = '' }: FeatureBadgesProps) {
  const features = [
    { title: "5 Analysis Categories", description: "Complete AI optimization audit" },
    { title: "Detailed Scoring", description: "Precise performance metrics" },
    { title: "Actionable Insights", description: "Clear improvement recommendations" },
    { title: "Instant Results", description: "Analysis in under 60 seconds" }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
      {features.map((feature, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h3>
          <p className="text-xs text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  );
} 