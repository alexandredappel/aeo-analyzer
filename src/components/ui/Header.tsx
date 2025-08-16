interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="border-b border-accent-1 bg-app">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <h1 className="text-2xl font-semibold text-app">{title}</h1>
      </div>
    </header>
  );
} 