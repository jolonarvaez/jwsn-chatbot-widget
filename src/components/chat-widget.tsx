"use client"

import * as React from "react"
import {
  Loader,
  MessageCircleIcon,
  RotateCcwIcon,
  SendIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Message, MessageContent } from "@/components/ui/message"
import { Textarea } from "@/components/ui/textarea"
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

const MAX_MESSAGE_LENGTH = 500

const LINK_REGEX =
  /(https?:\/\/[^\s<>"')]+)|(www\.[^\s<>"')]+)|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,24}\/[^\s<>"')]*)/g

const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/

function linkifyText(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(LINK_REGEX)) {
    const [raw, httpUrl, , email] = match
    const start = match.index ?? 0

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start))
    }

    if (email) {
      nodes.push(
        <a
          key={start}
          href={`mailto:${email}`}
          className="underline underline-offset-2"
        >
          {email}
        </a>,
      )
    } else {
      const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? ""
      const clean = trailing ? raw.slice(0, -trailing.length) : raw
      const href = httpUrl ? clean : `https://${clean}`

      nodes.push(
        <a
          key={start}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {clean}
        </a>,
      )
      if (trailing) nodes.push(trailing)
    }

    lastIndex = start + raw.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
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
  const [loading, setLoading] = React.useState(false)

  async function sendMessage(text: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text },
    ])
    setDraft("")
    setLoading(true)

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      if (!response.ok) throw new Error(`Request failed: ${response.status}`)

      const data = (await response.json()) as {
        reply: string
        suggestions?: string[]
      }
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
      setLoading(false)
    }
  }

  function handleSend() {
    const text = draft.trim()
    if (!text || loading) return
    void sendMessage(text)
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
            <CollapsibleTrigger
              render={<Button variant="ghost" size="icon-sm" />}
            >
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
                      !loading &&
                      (message.suggestions?.length ?? 0) > 0

                    return (
                      <MessageScrollerItem
                        key={message.id}
                        messageId={message.id}
                      >
                        <Message
                          align={message.role === "user" ? "end" : "start"}
                        >
                          <MessageContent>
                            <Bubble
                              variant={
                                message.role === "user" ? "default" : "muted"
                              }
                              align={message.role === "user" ? "end" : "start"}
                            >
                              <BubbleContent>
                                {linkifyText(message.text)}
                              </BubbleContent>
                            </Bubble>
                            {showSuggestions && (
                              <div className="flex flex-col gap-1.5 px-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Suggestions
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {message.suggestions?.map((suggestion) => (
                                    <Button
                                      key={suggestion}
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-auto whitespace-normal rounded-full py-1.5 text-left"
                                      onClick={() => setDraft(suggestion)}
                                    >
                                      {suggestion}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )
                  })}
                  {loading && (
                    <MessageScrollerItem messageId="loading">
                      <Message align="start">
                        <MessageContent>
                          <Bubble variant="muted" align="start">
                            <BubbleContent>
                              <Loader className="size-4 animate-spin text-muted-foreground" />
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </div>

        <form
          className="flex flex-col gap-1 border-t border-border px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault()
            handleSend()
          }}
        >
          <div className="flex items-end gap-2">
            <Textarea
              placeholder="Ask a question…"
              className="max-h-32 min-h-9 flex-1 resize-none py-2"
              rows={1}
              maxLength={MAX_MESSAGE_LENGTH}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !draft.trim()}
            >
              <SendIcon />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <span className="self-end text-xs text-muted-foreground">
            {draft.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </form>
      </CollapsibleContent>

      <CollapsibleTrigger
        render={
          <Button size="icon-lg" className="size-12 rounded-full shadow-lg" />
        }
      >
        <MessageCircleIcon />
        <span className="sr-only">{open ? "Close chat" : "Open chat"}</span>
      </CollapsibleTrigger>
    </Collapsible>
  )
}
