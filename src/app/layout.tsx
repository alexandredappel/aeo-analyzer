import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AEO Auditor - Optimize Your Content for AI Search",
  description: "Analyze how well your pages perform in LLM-powered search engines like ChatGPT, Claude, and Perplexity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Load analytics script in production (all domains)
  // Domain filtering is handled in analytics utility
  const shouldLoadAnalytics = process.env.NODE_ENV === 'production';

  return (
    <html lang="en">
      <head>
        {shouldLoadAnalytics && (
          <script 
            defer 
            src="https://cloud.umami.is/script.js" 
            data-website-id="0bbadb1b-8661-4f21-9d45-02bf61466237"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
