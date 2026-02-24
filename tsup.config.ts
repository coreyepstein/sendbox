import { defineConfig } from "tsup";

export default defineConfig([
  // Backend: index + handlers
  {
    entry: {
      index: "src/index.ts",
      handlers: "src/handlers.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    splitting: true,
    clean: true,
    external: ["react", "react-dom", "next", "@neondatabase/serverless", "resend"],
  },
  // UI: React components (needs jsx transform)
  {
    entry: {
      ui: "src/ui.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    splitting: true,
    clean: false, // don't wipe the backend output
    external: ["react", "react-dom", "next", "next/link", "next/navigation"],
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
    banner: {
      js: '"use client";',
    },
  },
]);
