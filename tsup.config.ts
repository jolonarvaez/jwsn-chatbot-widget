import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    server: "src/server/chat.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  tsconfig: "tsconfig.app.json",
  external: ["react", "react-dom"],
})
