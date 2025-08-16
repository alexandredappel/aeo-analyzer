import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const dmSans = localFont({
  variable: "--font-dm-sans",
  display: "swap",
  src: [
    {
      path: "./fonts/DM_Sans/DMSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/DM_Sans/DMSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Evotha - Optimize Your Content for AI Search",
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
      <body className={`${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
