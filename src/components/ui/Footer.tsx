interface FooterProps {
  text: string;
}

export function Footer({ text }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-center text-gray-600">{text}</p>
      </div>
    </footer>
  );
} 