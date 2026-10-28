import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    // Свои тесты на чистые модули: правила, структура, код билда. Браузер им не нужен.
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
