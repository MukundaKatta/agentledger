/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes touch DynamoDB at request time, never at build time.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
