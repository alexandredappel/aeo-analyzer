interface ExampleLinkProps {
  onExampleClick: () => void;
  exampleUrl: string;
}

export function ExampleLink({ onExampleClick, exampleUrl }: ExampleLinkProps) {
  return (
    <div className="text-gray-600">
      <span>Try: </span>
      <button
        onClick={onExampleClick}
        className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200"
      >
        {exampleUrl}
      </button>
    </div>
  );
} 