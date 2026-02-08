import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactCompiler: true,
  poweredByHeader: false,
  typedRoutes: true,
  experimental: {
    typedEnv: true,
    viewTransition: true,
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
};

export default withMDX(config);

initOpenNextCloudflareForDev();
