/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enables static export
  images: {
    unoptimized: true, // GitHub Pages doesn't support the default Next.js Image Optimization
  },
  // If your repo is NOT at the root (e.g., username.github.io/my-repo/), 
  // you MUST add the repo name as a prefix:
  // basePath: '/my-repo', 
};

export default nextConfig;