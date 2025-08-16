interface ExampleLinkProps {
  onExampleClick: () => void;
  exampleUrl: string;
}

export function ExampleLink({ onExampleClick, exampleUrl }: ExampleLinkProps) {
  return (
    <div className="text-app/80">
      <span>Try: </span>
      <button
        onClick={onExampleClick}
        className="text-[color:var(--color-primary)] hover:brightness-110 underline transition-colors duration-200"
      >
        {exampleUrl}
      </button>
    </div>
  );
} 