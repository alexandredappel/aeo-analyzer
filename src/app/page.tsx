"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { HeroSection } from "@/components/ui/HeroSection";
import { ExampleLink } from "@/components/ui/ExampleLink";
import { UrlForm, type UrlFormRef } from "@/components/forms/UrlForm";

export default function Home() {
  const router = useRouter();
  const urlFormRef = useRef<UrlFormRef>(null);

  const handleUrlSubmit = (url: string) => {
    // Redirect to report page with encoded URL
    router.push(`/report?url=${encodeURIComponent(url)}`);
  };

  const handleExampleClick = () => {
    urlFormRef.current?.setExampleUrl("https://example.com");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header title="AEO Auditor" />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <HeroSection
            title="Optimize Your Content for AI Search"
            subtitle="Analyze how well your pages perform in LLM-powered search engines"
          />

          <UrlForm ref={urlFormRef} onSubmit={handleUrlSubmit} />

          <ExampleLink
            onExampleClick={handleExampleClick}
            exampleUrl="https://example.com"
          />
        </div>
      </main>

      <Footer text="Built for SEO professionals" />
    </div>
  );
}
