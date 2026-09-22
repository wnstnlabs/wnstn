/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@wnstn/canopy", "@wnstn/ui"],
  async rewrites() {
    return [
      // CDN script alias — matches the snippet we give users: /p.js -> served by API route that returns the bundled script
      { source: "/p.js", destination: "/api/script" },
    ];
  },
};

export default nextConfig;
