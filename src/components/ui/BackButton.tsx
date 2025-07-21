interface BackButtonProps {
  onClick: () => void;
  text?: string;
}

export function BackButton({ onClick, text = "← Back to Home" }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
    >
      {text}
    </button>
  );
} 