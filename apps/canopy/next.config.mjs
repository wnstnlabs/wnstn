/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@wnstn/canopy", "@wnstn/canopy-nextjs", "@wnstn/ui"],
    async rewrites() {
        return [
            // CDN script alias — matches the snippet we give users: /p.js -> served by API route that returns the bundled script
            { source: "/p.js", destination: "/api/script" },
        ];
    },
    async headers() {
        return [{
            // Match all API routes
            source: "/api/:path*",
            headers: [
                { key: "Access-Control-Allow-Credentials", value: "true" },
                { key: "Access-Control-Allow-Origin", value: "http://localhost:3000" }, // Replace * with your trusted client domain if needed
                { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
                { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
            ]
        }]
    }
};

export default nextConfig;