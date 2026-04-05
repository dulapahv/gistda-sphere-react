import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  poweredByHeader: false,
  reactCompiler: true,
  typedRoutes: true,
  logging: {
    browserToTerminal: true,
  },
  experimental: {
    typedEnv: true,
    viewTransition: true,
    inlineCss: true,
    turbopackFileSystemCacheForBuild: true,
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
      {
        source: "/:lang/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
};

export default withMDX(config);
