import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    reporters: ["dot"],
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "lcov", "cobertura", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/__tests__/**",
        "src/types/**",
        "src/**/index.ts",
      ],
    },
  },
});
