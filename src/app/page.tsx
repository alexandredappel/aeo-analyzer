"use client";

import NewHeroSection from "@/components/hero-section";
import Features5 from "@/components/features-5";
import Content4 from "@/components/content-4";
import Features1 from "@/components/features-1";
import CallToAction from "@/components/call-to-action";
import FooterSection from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        <NewHeroSection />
        <Features5 />
        <Content4 />
        <Features1 />
        <CallToAction />
        <FooterSection />
      </main>
    </div>
  );
}
