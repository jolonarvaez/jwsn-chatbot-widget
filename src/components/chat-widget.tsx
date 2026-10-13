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
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi, I'm Jolo's assistant. Ask me about his work experience and projects, or try a suggestion below.",
  },
]

const suggestions = [
  "What's your most recent role?",
  "What projects have you shipped?",
]

export function ChatWidget() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = React.useState("")

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
                  {messages.map((message) => (
                    <MessageScrollerItem key={message.id} messageId={message.id}>
                      <Message align={message.role === "user" ? "end" : "start"}>
                        <MessageContent>
                          <Bubble
                            variant={message.role === "user" ? "default" : "muted"}
                            align={message.role === "user" ? "end" : "start"}
                          >
                            <BubbleContent>{message.text}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>

          {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end gap-1.5 bg-gradient-to-t from-card via-card/90 to-transparent px-4 pt-8 pb-3">
            <span className="pointer-events-auto text-xs font-medium text-muted-foreground">
              Suggestions
            </span>
            <div className="pointer-events-auto flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full bg-card"
                  onClick={() => setDraft(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div> */}
        </div>

        <form
          className="flex items-center gap-2 border-t border-border px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault()
            const text = draft.trim()
            if (!text) return
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), role: "user", text },
            ])
            setDraft("")
          }}
        >
          <Input
            placeholder="Ask a question…"
            className="flex-1"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button type="submit" size="icon">
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
