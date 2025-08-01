interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-blue-600">{title}</h1>
      </div>
    </header>
  );
} 