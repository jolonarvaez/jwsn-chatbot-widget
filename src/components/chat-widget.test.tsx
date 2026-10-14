import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ChatWidget } from "./chat-widget"

async function openWidget(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /open chat/i }))
}

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shows the welcome message once opened", async () => {
    const user = userEvent.setup()
    render(<ChatWidget />)

    await openWidget(user)

    expect(
      screen.getByText(/ask me about his work experience/i),
    ).toBeInTheDocument()
  })

  it("keeps the chat window mounted while its closing animation plays", async () => {
    const user = userEvent.setup()
    render(<ChatWidget />)

    await openWidget(user)
    await user.click(screen.getAllByRole("button", { name: /close chat/i })[0])

    expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText(/ask a question/i),
      ).not.toBeInTheDocument()
    })
  })

  it("sends a message and renders the assistant's reply with suggestions", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          reply: "Jolo worked at Acme Corp.",
          suggestions: ["What did he build there?"],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    )

    const user = userEvent.setup()
    render(<ChatWidget apiEndpoint="/api/chat" />)
    await openWidget(user)

    await user.type(
      screen.getByPlaceholderText(/ask a question/i),
      "Where did he work?",
    )
    await user.click(screen.getByRole("button", { name: /send/i }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ message: "Where did he work?" }),
      }),
    )

    await waitFor(() => {
      expect(screen.getByText("Jolo worked at Acme Corp.")).toBeInTheDocument()
    })
    expect(
      screen.getByRole("button", { name: "What did he build there?" }),
    ).toBeInTheDocument()
  })

  it("animates each message bubble as it enters the conversation", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ reply: "A reply.", suggestions: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const user = userEvent.setup()
    render(<ChatWidget apiEndpoint="/api/chat" />)
    await openWidget(user)
    await user.type(
      screen.getByPlaceholderText(/ask a question/i),
      "A question?",
    )
    await user.click(screen.getByRole("button", { name: /send/i }))

    await screen.findByText("A reply.")

    await waitFor(() => {
      for (const text of [
        /ask me about his work experience/i,
        "A question?",
        "A reply.",
      ]) {
        const message = screen.getByText(text).closest('[data-slot="message"]')
        expect(message?.parentElement?.style.opacity).toBe("1")
      }
    })
  })

  it("shows a fallback message when the request fails", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }))

    const user = userEvent.setup()
    render(<ChatWidget />)
    await openWidget(user)

    await user.type(screen.getByPlaceholderText(/ask a question/i), "Hello")
    await user.click(screen.getByRole("button", { name: /send/i }))

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  it("sends the suggestion immediately when it is clicked", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            reply: "He builds things.",
            suggestions: ["Tell me more?"],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            reply: "He builds a lot of things.",
            suggestions: [],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )

    const user = userEvent.setup()
    render(<ChatWidget apiEndpoint="/api/chat" />)
    await openWidget(user)

    await user.type(
      screen.getByPlaceholderText(/ask a question/i),
      "What does he do?",
    )
    await user.click(screen.getByRole("button", { name: /send/i }))

    const suggestionButton = await screen.findByRole("button", {
      name: "Tell me more?",
    })
    await user.click(suggestionButton)

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ message: "Tell me more?" }),
      }),
    )
    await waitFor(() => {
      expect(screen.getByText("He builds a lot of things.")).toBeInTheDocument()
    })
    expect(screen.getByPlaceholderText(/ask a question/i)).toHaveValue("")
  })

  it("resets the conversation when the reset button is clicked", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ reply: "Some reply", suggestions: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const user = userEvent.setup()
    render(<ChatWidget />)
    await openWidget(user)

    await user.type(screen.getByPlaceholderText(/ask a question/i), "Hi there")
    await user.click(screen.getByRole("button", { name: /send/i }))
    await screen.findByText("Some reply")

    await user.click(screen.getByRole("button", { name: /reset chat/i }))

    expect(screen.queryByText("Some reply")).not.toBeInTheDocument()
    expect(
      screen.getByText(/ask me about his work experience/i),
    ).toBeInTheDocument()
  })
})
