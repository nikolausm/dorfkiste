/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: [],
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/offers/pictures/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '8080',
        pathname: '/api/offers/pictures/**',
      },
    ],
    domains: ['localhost', 'backend'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com data:; script-src 'self'; connect-src 'self';",
    unoptimized: true, // Disable optimization for all images
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;