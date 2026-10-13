import {
  GoogleGenAI,
  ThinkingLevel as GeminiThinkingLevel,
  Type,
  type Schema,
} from "@google/genai"

export type ThinkingLevel = "minimal" | "low" | "medium" | "high"

const THINKING_LEVELS: Record<ThinkingLevel, GeminiThinkingLevel> = {
  minimal: GeminiThinkingLevel.MINIMAL,
  low: GeminiThinkingLevel.LOW,
  medium: GeminiThinkingLevel.MEDIUM,
  high: GeminiThinkingLevel.HIGH,
}

export type ChatHandlerOptions = {
  apiKey: string
  profile: string
  model?: string
  /** Reasoning effort before answering. Only supported by thinking-capable models. */
  thinkingLevel?: ThinkingLevel
}

const SYSTEM_PROMPT_PREFIX = `You are a representative speaking on behalf of Jolo Narvaez on his personal website — not Jolo himself. Always refer to him in the third person ("Jolo went to...", "he worked on...", never "I went to..." or "I worked on..."). Answer visitor questions about his background, work experience, and projects using only the profile below. If something isn't covered by the profile, say you don't have that information rather than guessing.

Tone: friendly and outgoing. Keep jargon to a minimum. Use less exclamation points. Keep "reply" to under 3 sentences. If there's other relevant information worth mentioning that doesn't fit within that length, don't cram it into "reply" — instead surface it as one of the follow-up questions in "suggestions" so the visitor can ask for it next.

Put the answer in "reply" and one or two relevant follow-up questions the visitor could ask next in "suggestions".

Profile:
`

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: "The answer to the visitor's question, in plain prose.",
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "One or two short follow-up questions the visitor could ask next.",
    },
  },
  required: ["reply", "suggestions"],
}

type ChatReply = {
  reply: string
  suggestions: string[]
}

export function createChatHandler({
  apiKey,
  profile,
  model = "gemini-flash-latest",
  thinkingLevel,
}: ChatHandlerOptions) {
  const ai = new GoogleGenAI({ apiKey })
  const systemInstruction = SYSTEM_PROMPT_PREFIX + profile

  return async function handleChatRequest(request: Request): Promise<Response> {
    let message: string

    try {
      const body = (await request.json()) as { message?: unknown }
      if (typeof body.message !== "string" || !body.message.trim()) {
        return Response.json({ error: "message is required" }, { status: 400 })
      }
      message = body.message
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    try {
      const result = await ai.models.generateContent({
        model,
        contents: message,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          ...(thinkingLevel && {
            thinkingConfig: { thinkingLevel: THINKING_LEVELS[thinkingLevel] },
          }),
        },
      })

      const parsed = JSON.parse(result.text ?? "{}") as Partial<ChatReply>
      return Response.json({
        reply: parsed.reply ?? "",
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      } satisfies ChatReply)
    } catch (error) {
      console.error("Gemini request failed", error)
      return Response.json(
        { error: "Failed to generate a response" },
        { status: 502 }
      )
    }
  }
}
