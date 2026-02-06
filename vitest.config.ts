import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/__tests__/**",
        "src/types/**",
        "src/**/index.ts",
      ],
      thresholds: {
        // Core components and hooks should maintain high coverage
        // Lower thresholds allow for incremental test coverage
        statements: 25,
        branches: 60,
        functions: 30,
        lines: 25,
      },
    },
  },
});
