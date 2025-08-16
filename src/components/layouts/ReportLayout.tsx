import { ReactNode } from "react";
import { HeroHeader } from "@/components/header";
import FooterSection from "@/components/footer";

interface ReportLayoutProps {
  children: ReactNode;
  headerTitle?: string;
}

export function ReportLayout({ children, headerTitle = "AEO Auditor" }: ReportLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <HeroHeader />
      
      <main className="flex-1 px-4 md:px-6 pt-14 md:pt-28 pb-8 md:pb-12">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
} 