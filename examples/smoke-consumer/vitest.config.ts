import alloyPlugin from "@alloy-js/rollup-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "preserve",
    sourcemap: "both",
  },
  server: {
    deps: {
      inline: ["@pinterest/alloy-graphql"],
    },
  },
  plugins: [alloyPlugin()],
});
