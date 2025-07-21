interface ExampleLinkProps {
  onExampleClick: () => void;
  exampleUrl: string;
}

export function ExampleLink({ onExampleClick, exampleUrl }: ExampleLinkProps) {
  return (
    <div className="text-gray-400">
      <span>Try: </span>
      <button
        onClick={onExampleClick}
        className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
      >
        {exampleUrl}
      </button>
    </div>
  );
} 