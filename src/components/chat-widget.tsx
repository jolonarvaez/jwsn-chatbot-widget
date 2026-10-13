"use client"

import * as React from "react"
import { MessageCircleIcon, RotateCcwIcon, SendIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  suggestions?: string[]
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi, I'm Jolo's assistant. Ask me about his work experience and projects, or try a suggestion below.",
    suggestions: [],
  },
]

export function ChatWidget({
  apiEndpoint = "/api/chat",
}: {
  apiEndpoint?: string
} = {}) {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = React.useState("")
  const [pending, setPending] = React.useState(false)

  async function sendMessage(text: string) {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }])
    setDraft("")
    setPending(true)

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      if (!response.ok) throw new Error(`Request failed: ${response.status}`)

      const data = (await response.json()) as { reply: string; suggestions?: string[] }
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.reply,
          suggestions: data.suggestions,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Sorry, something went wrong. Please try again.",
        },
      ])
    } finally {
      setPending(false)
    }
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3"
    >
      <CollapsibleContent className="flex h-[32rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-medium text-foreground">Chat</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setMessages(initialMessages)
                setDraft("")
              }}
            >
              <RotateCcwIcon />
              <span className="sr-only">Reset chat</span>
            </Button>
            <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <XIcon />
              <span className="sr-only">Close chat</span>
            </CollapsibleTrigger>
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="size-full">
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-2 px-2.5 py-2.5">
                  {messages.map((message, index) => {
                    const showSuggestions =
                      message.role === "assistant" &&
                      index === messages.length - 1 &&
                      !pending &&
                      (message.suggestions?.length ?? 0) > 0

                    return (
                      <MessageScrollerItem key={message.id} messageId={message.id}>
                        <Message align={message.role === "user" ? "end" : "start"}>
                          <MessageContent>
                            <Bubble
                              variant={message.role === "user" ? "default" : "muted"}
                              align={message.role === "user" ? "end" : "start"}
                            >
                              <BubbleContent>{message.text}</BubbleContent>
                            </Bubble>
                            {showSuggestions && (
                              <div className="flex flex-wrap gap-2 px-3">
                                {message.suggestions?.map((suggestion) => (
                                  <Button
                                    key={suggestion}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={() => setDraft(suggestion)}
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </div>

        <form
          className="flex items-center gap-2 border-t border-border px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault()
            const text = draft.trim()
            if (!text || pending) return
            void sendMessage(text)
          }}
        >
          <Input
            placeholder="Ask a question…"
            className="flex-1"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={pending}
          />
          <Button type="submit" size="icon" disabled={pending}>
            <SendIcon />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CollapsibleContent>

      <CollapsibleTrigger
        render={<Button size="icon-lg" className="size-12 rounded-full shadow-lg" />}
      >
        <MessageCircleIcon />
        <span className="sr-only">{open ? "Close chat" : "Open chat"}</span>
      </CollapsibleTrigger>
    </Collapsible>
  )
}
