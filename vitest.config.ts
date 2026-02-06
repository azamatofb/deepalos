import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./tests/unit/setup.ts",
    globals: true,
    include: ["tests/unit/**/*.test.tsx", "tests/unit/**/*.test.ts"]
  }
});
