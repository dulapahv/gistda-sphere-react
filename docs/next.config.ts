import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  experimental: {
    cssChunking: "graph",
    optimizePackageImports: ["@phosphor-icons/react"],
    turbopackChunking: {
      generateComponentChunks: true,
    },
    turbopackCjsTreeShaking: true,
    turbopackFileSystemCacheForBuild: true,
    turbopackRustReactCompiler: true,
    turbopackServerSideNestedAsyncChunking: true,
    turbopackSharedRuntime: true,
    typedEnv: true,
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
