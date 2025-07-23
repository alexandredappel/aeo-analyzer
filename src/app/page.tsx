"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { HeroSection } from "@/components/ui/HeroSection";
import { ExampleLink } from "@/components/ui/ExampleLink";
import { FeatureBadges } from "@/components/ui/FeatureBadges";
import { AIEngineLogos } from "@/components/ui/AIEngineLogos";
import { UrlForm, type UrlFormRef } from "@/components/forms/UrlForm";

export default function Home() {
  const router = useRouter();
  const urlFormRef = useRef<UrlFormRef>(null);

  const handleUrlSubmit = (url: string) => {
    router.push(`/report?url=${encodeURIComponent(url)}`);
  };

  const handleExampleClick = () => {
    urlFormRef.current?.setExampleUrl("https://example.com");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Header title="GEO Auditor" />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <HeroSection
            title="Optimize Your Content for AI Search"
            subtitle="Analyze how well your pages perform in generative AI search engines. Get detailed insights and actionable recommendations to improve your GEO strategy."
          />

          <div className="max-w-2xl mx-auto space-y-6">
            <UrlForm ref={urlFormRef} onSubmit={handleUrlSubmit} />
            <ExampleLink onExampleClick={handleExampleClick} exampleUrl="https://example.com" />
          </div>

          <FeatureBadges />
          <AIEngineLogos />
        </div>
      </main>

      <Footer text="Built for SEO and GEO professionals" />
    </div>
  );
}
