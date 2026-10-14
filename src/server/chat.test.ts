import { beforeEach, describe, expect, it, vi } from "vitest"

const generateContent = vi.fn()

vi.mock("@google/genai", () => {
  class GoogleGenAI {
    models = { generateContent }
  }
  return {
    GoogleGenAI,
    ThinkingLevel: {
      MINIMAL: "MINIMAL",
      LOW: "LOW",
      MEDIUM: "MEDIUM",
      HIGH: "HIGH",
    },
    Type: { OBJECT: "OBJECT", STRING: "STRING", ARRAY: "ARRAY" },
  }
})

const { createChatHandler } = await import("./chat")

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("createChatHandler", () => {
  beforeEach(() => {
    generateContent.mockReset()
  })

  it("rejects a missing message with 400", async () => {
    const handler = createChatHandler({ apiKey: "key", profile: "profile" })
    const response = await handler(jsonRequest({}))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "message is required" })
    expect(generateContent).not.toHaveBeenCalled()
  })

  it("rejects a blank message with 400", async () => {
    const handler = createChatHandler({ apiKey: "key", profile: "profile" })
    const response = await handler(jsonRequest({ message: "   " }))

    expect(response.status).toBe(400)
  })

  it("rejects invalid JSON with 400", async () => {
    const handler = createChatHandler({ apiKey: "key", profile: "profile" })
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    })
    const response = await handler(request)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "Invalid JSON body" })
  })

  it("returns the reply and suggestions from Gemini on success", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        reply: "Jolo worked at Acme Corp.",
        suggestions: ["What did he do there?"],
      }),
    })

    const handler = createChatHandler({ apiKey: "key", profile: "profile" })
    const response = await handler(
      jsonRequest({ message: "Where did he work?" }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      reply: "Jolo worked at Acme Corp.",
      suggestions: ["What did he do there?"],
    })
  })

  it("defaults suggestions to an empty array when Gemini omits them", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({ reply: "Jolo worked at Acme Corp." }),
    })

    const handler = createChatHandler({ apiKey: "key", profile: "profile" })
    const response = await handler(
      jsonRequest({ message: "Where did he work?" }),
    )

    expect(await response.json()).toEqual({
      reply: "Jolo worked at Acme Corp.",
      suggestions: [],
    })
  })

  it("returns 502 when the Gemini request fails", async () => {
    generateContent.mockRejectedValue(new Error("network error"))

    const handler = createChatHandler({ apiKey: "key", profile: "profile" })
    const response = await handler(
      jsonRequest({ message: "Where did he work?" }),
    )

    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({
      error: "Failed to generate a response",
    })
  })

  it("sends the profile baked into the system instruction", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({ reply: "ok", suggestions: [] }),
    })

    const handler = createChatHandler({
      apiKey: "key",
      profile: "Jolo's profile text",
    })
    await handler(jsonRequest({ message: "hi" }))

    const call = generateContent.mock.calls[0][0]
    expect(call.config.systemInstruction).toContain("Jolo's profile text")
  })
})
