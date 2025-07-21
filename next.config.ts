import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security optimizations
  poweredByHeader: false, // Hide X-Powered-By header
  
  // Disable ESLint during builds (development productivity)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@/services', '@/utils'],
  },
  
  // Image optimization (if using images)
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Build optimizations
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Redirects (if needed in the future)
  async redirects() {
    return [];
  },
};

export default nextConfig;
