import { ReactNode } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";

interface ReportLayoutProps {
  children: ReactNode;
  headerTitle?: string;
}

export function ReportLayout({ children, headerTitle = "AEO Auditor" }: ReportLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header title={headerTitle} />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
      
      <Footer text="Built for SEO professionals" />
    </div>
  );
} 