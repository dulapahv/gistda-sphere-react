import { rmSync } from "node:fs";
import { defineConfig, type Options } from "tsup";

/**
 * The package is built as three files that import each other:
 * - `services`: the web-services client, safe to run on servers;
 * - `client`: components and hooks, marked "use client" for Next.js;
 * - `index`: re-exports both.
 * Keeping them separate (instead of bundling the services into `client`)
 * gives one copy of the services code, so `instanceof SphereServiceError`
 * works whichever entry an app imports from.
 */

type EsbuildPlugin = NonNullable<Options["esbuildPlugins"]>[number];

/** Turns imports of another entry into imports of its built file. */
function entryImports(entries: Record<string, RegExp>): EsbuildPlugin {
  return {
    name: "entry-imports",
    setup(build) {
      const extension = build.initialOptions.format === "cjs" ? ".js" : ".mjs";
      for (const [file, filter] of Object.entries(entries)) {
        build.onResolve({ filter }, () => ({
          external: true,
          path: `./${file}${extension}`,
        }));
      }
    },
  };
}

// Builds run in parallel, so clear the output once up front.
// Retries cover Windows, where a watcher can briefly hold a file.
rmSync("dist", {
  force: true,
  maxRetries: 5,
  recursive: true,
  retryDelay: 200,
});

const shared: Options = {
  dts: true,
  format: ["cjs", "esm"],
  outDir: "dist",
};

export default defineConfig([
  { ...shared, entry: { services: "src/services/index.ts" } },
  {
    ...shared,
    banner: { js: '"use client";' },
    entry: { client: "src/client.ts" },
    esbuildPlugins: [entryImports({ services: /^@\/services\/client$/ })],
  },
  {
    ...shared,
    entry: { index: "src/index.ts" },
    esbuildPlugins: [
      entryImports({ client: /^\.\/client$/, services: /^\.\/services$/ }),
    ],
  },
]);
