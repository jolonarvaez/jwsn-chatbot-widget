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

  it("fills the draft when a suggestion is clicked", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          reply: "He builds things.",
          suggestions: ["Tell me more?"],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    )

    const user = userEvent.setup()
    render(<ChatWidget />)
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

    expect(screen.getByPlaceholderText(/ask a question/i)).toHaveValue(
      "Tell me more?",
    )
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
