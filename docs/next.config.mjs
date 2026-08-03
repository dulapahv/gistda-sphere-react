import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    inlineCss: true,
    optimizePackageImports: ["@phosphor-icons/react"],
    turbopackFileSystemCacheForBuild: true,
    typedEnv: true,
    viewTransition: true,
  },
  logging: {
    browserToTerminal: true,
  },
  poweredByHeader: false,
  reactCompiler: true,
  async rewrites() {
    return [
      {
        destination: "/llms.mdx/docs/:path*",
        source: "/docs/:path*.mdx",
      },
      {
        destination: "/llms.mdx/docs/:path*",
        source: "/:lang/docs/:path*.mdx",
      },
    ];
  },
  typedRoutes: true,
};

export default withMDX(config);
