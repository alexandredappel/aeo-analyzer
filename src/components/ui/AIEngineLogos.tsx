export function AIEngineLogos() {
  const engines = [
    { name: "ChatGPT", color: "text-green-600" },
    { name: "Claude", color: "text-orange-600" },
    { name: "Google Gemini", color: "text-blue-600" },
    { name: "Perplexity", color: "text-purple-600" }
  ];

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-3">Optimize for leading AI search engines:</p>
      <div className="flex flex-wrap justify-center gap-4">
        {engines.map((engine) => (
          <span key={engine.name} className={`${engine.color} font-medium text-sm`}>
            {engine.name}
          </span>
        ))}
      </div>
    </div>
  );
} 