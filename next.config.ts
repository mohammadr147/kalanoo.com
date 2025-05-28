import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    // TODO: Remove this once type errors are resolved
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // TODO: Remove this once lint errors are resolved
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
   // Optional: If using Firebase Admin SDK extensively server-side,
   // you might need to adjust experimental features or webpack config.
   // Usually not needed for basic session verification.
   // experimental: {
   //   serverComponentsExternalPackages: ['firebase-admin'], // Example
   // },
   // webpack: (config, { isServer }) => {
   //   if (isServer) {
   //     // Server-specific webpack adjustments if needed
   //   }
   //   return config;
   // },
};

export default nextConfig;
