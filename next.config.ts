import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Enable static export for Capacitor
  output: "export",
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Trailing slashes for better compatibility
  trailingSlash: true,
}

export default nextConfig
