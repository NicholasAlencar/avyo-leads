import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    exclude: ["**/node_modules/**", "**/.next/**", "tests/e2e/**"],
    environment: "node",
    passWithNoTests: false,
    setupFiles: ["./src/test/setup.ts"],
  },
});
