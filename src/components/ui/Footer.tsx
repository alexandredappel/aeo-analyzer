interface FooterProps {
  text: string;
}

export function Footer({ text }: FooterProps) {
  return (
    <footer className="border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-center text-gray-400">{text}</p>
      </div>
    </footer>
  );
} 