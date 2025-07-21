import { useEffect, useRef } from "react";

interface AnalysisLogsProps {
  logs: string[];
  isRunning: boolean;
}

export function AnalysisLogs({ logs, isRunning }: AnalysisLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (logs.length === 0 && !isRunning) {
    return null;
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
        📋 Analysis Log
        {isRunning && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-400">Running...</span>
          </div>
        )}
      </h3>
      
      <div className="bg-gray-900 rounded border border-gray-600 p-3 h-48 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-400 italic">
            {isRunning ? "Initializing analysis..." : "No logs available"}
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-300 leading-relaxed">
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
} 