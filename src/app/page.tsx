"use client";

import NewHeroSection from "@/components/hero-section";
import Features5 from "@/components/features-5";
import Content4 from "@/components/content-4";
import Features1 from "@/components/features-1";
import CallToAction from "@/components/call-to-action";
import Pricing from "@/components/pricing";
import FooterSection from "@/components/footer";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // We intentionally do not show a blocking alert after checkout success
    // Consider using a non-blocking toast in the future
    const checkout = searchParams.get("checkout");
    const upgraded = searchParams.get("upgraded");
    // no-op currently
    if (checkout === "success" && upgraded === "true") {
      // Optionally, you can trigger a toast system here
    }
  }, [searchParams]);
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        <NewHeroSection />
        <Features5 />
        <Content4 />
        <Features1 />
        <CallToAction />
        <Pricing />
        <FooterSection />
      </main>
    </div>
  );
}
