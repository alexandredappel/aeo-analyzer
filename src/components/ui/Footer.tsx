interface FooterProps {
  text: string;
}

export function Footer({ text }: FooterProps) {
  return (
    <footer className="border-t border-accent-1 bg-app">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-center text-app/80">{text}</p>
      </div>
    </footer>
  );
} 