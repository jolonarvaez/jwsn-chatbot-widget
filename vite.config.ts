import fs from "node:fs"
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"

import { createChatHandler, type ThinkingLevel } from "./src/server/chat.js"

// Dev-only: mounts the same handler Next.js would use in production as a
// local middleware, so `npm run dev` can talk to Gemini without a backend.
// This plugin never ships — it only runs inside Vite's own dev server.
function devChatApi(env: Record<string, string>): Plugin {
  return {
    name: "dev-chat-api",
    configureServer(server) {
      const profile = fs.readFileSync(
        path.resolve(import.meta.dirname, "content/profile.md"),
        "utf-8",
      )
      const handler = createChatHandler({
        apiKey: env.GEMINI_API_KEY ?? "",
        profile,
        model: env.GEMINI_MODEL || undefined,
        thinkingLevel:
          (env.GEMINI_THINKING_LEVEL as ThinkingLevel) || undefined,
      })

      server.middlewares.use("/api/chat", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405
          res.end()
          return
        }

        let body = ""
        req.on("data", (chunk) => {
          body += chunk
        })
        req.on("end", () => {
          void handler(
            new Request("http://localhost/api/chat", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body,
            }),
          )
            .then(async (response) => {
              res.statusCode = response.status
              res.setHeader("content-type", "application/json")
              res.end(await response.text())
            })
            .catch((error: unknown) => {
              res.statusCode = 500
              res.end(JSON.stringify({ error: (error as Error).message }))
            })
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [react(), tailwindcss(), devChatApi(env)],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    // Keep the dev-playground app build separate from tsup's library
    // output, which publishes to `dist/`.
    build: {
      outDir: "dist-playground",
    },
  }
})
