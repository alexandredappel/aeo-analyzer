interface ErrorMessageProps {
  title: string;
  message: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function ErrorMessage({ 
  title, 
  message, 
  showBackButton = false, 
  onBackClick 
}: ErrorMessageProps) {
  return (
    <div className="text-center space-y-4">
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-400 mb-2">{title}</h2>
        <p className="text-gray-300">{message}</p>
      </div>
      
      {showBackButton && onBackClick && (
        <button
          onClick={onBackClick}
          className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
        >
          ← Back to Home
        </button>
      )}
    </div>
  );
} 