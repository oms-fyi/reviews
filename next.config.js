/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/courses',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
