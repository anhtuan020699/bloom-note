const API = process.env.API_URL || 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API}/api/:path*` },
      { source: '/uploads/:path*', destination: `${API}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
