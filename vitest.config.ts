import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/__tests__/**",
        "src/types/**",
        "src/**/index.ts",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "lcov", "cobertura", "html"],
    },
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    outputFile: {
      junit: "junit.xml",
    },
    reporters: ["default", "junit"],
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
