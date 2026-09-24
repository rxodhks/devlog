/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // MDX 원문을 서버 컴포넌트에서 fs로 읽기 때문에 content 폴더를 트레이싱에 포함합니다.
  outputFileTracingIncludes: {
    "/posts/[slug]": ["./content/posts/**/*"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
