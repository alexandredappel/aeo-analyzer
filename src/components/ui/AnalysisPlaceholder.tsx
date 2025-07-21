interface AnalysisPlaceholderProps {
  url: string;
}

export function AnalysisPlaceholder({ url }: AnalysisPlaceholderProps) {
  return (
    <div className="space-y-6">
      {/* URL Display */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-200 mb-2">Analysis for:</h2>
        <p className="text-blue-400 font-mono text-sm break-all">{url}</p>
      </div>

      {/* Placeholder Message */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔧</span>
          </div>
          <h3 className="text-xl font-semibold text-blue-400">
            Analysis functionality coming in next step...
          </h3>
          <p className="text-gray-300 max-w-md mx-auto">
            We&apos;re building the AEO analysis engine. Soon you&apos;ll see detailed scoring 
            and recommendations for your website&apos;s AI search optimization.
          </p>
        </div>
      </div>
    </div>
  );
} 