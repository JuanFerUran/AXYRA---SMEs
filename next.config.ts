import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    strictNullChecks: true,
  },
  eslint: {
    dirs: ['src'],
  },
};

export default nextConfig;
