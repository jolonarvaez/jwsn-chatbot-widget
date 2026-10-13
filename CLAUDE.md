# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a **personal-website RAG chatbot**, built as a publishable npm package rather than a standalone app. The end goal: a `<ChatWidget />` component that the author imports into their Next.js personal site, which answers visitor questions about the author's background and work experience.

- **Content source**: a single Markdown file containing the author's profile (achievements, work experience, bio) is the retrieval corpus for RAG. There is no external database — the "knowledge base" is this one `.md` file.
- **LLM**: Google Gemini, via `@google/genai`. The widget calls Gemini with retrieved context from the profile doc to answer questions.
- **Behavior**: beyond answering questions, the widget should proactively suggest follow-up questions so visitors discover more about the author (e.g. "Ask me about my work at X" style prompts), not just passively wait for input.
- **Distribution model**: this repo builds a library, not a deployed site. It's published to npm and consumed by a separate Next.js project as a dependency — a microfrontend pattern. That means public API surface (props, exported types, CSS scoping so it doesn't collide with the host Next.js app's styles) matters more than it would for an app.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) then production build via Vite
- `npm run preview` — serve the production build locally
- `npm run lint` — run Oxlint (config in `.oxlintrc.json`)

There is no test runner configured yet.

## Architecture

Current state: scaffold only. `src/App.tsx` is an empty placeholder — no RAG pipeline, no Gemini integration, and no chat UI have been built yet.

**Styling**: Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js` — v4 is CSS-first, imported in `src/index.css`). shadcn/ui is initialized (`components.json`, style `base-nova`, base `base-ui` not Radix) with path alias `@/* → src/*`.

**Path alias note**: the `@/*` alias must be declared in the *root* `tsconfig.json`'s own `compilerOptions.paths` (not only in `tsconfig.app.json`, which it references) — the shadcn CLI reads the root config directly and does not follow `references` to find it. It also needs the matching `resolve.alias` in `vite.config.ts` for Vite itself to resolve it at runtime/build time. Both are currently set up correctly; if `npx shadcn@latest info --json` ever shows `resolvedPaths` pointing at a literal `@/...` directory instead of `src/...`, that mapping has regressed.

**Dependencies installed but not yet wired into actual functionality:**
- `@google/genai` — Gemini client; no API calls implemented yet
- RAG/retrieval over the profile `.md` file — not implemented yet (no chunking/embedding/retrieval code exists)
- `storybook` — no `.storybook/` config yet
- `tsup` — intended for building the publishable package output; no `tsup.config.ts` yet, and `vite.config.ts` is currently in app-mode (dev server), not library-mode (bundling for npm publish) — these are two different build concerns that will need to coexist
- `zod` — schema validation, not yet applied anywhere
- `@base-ui/react`, `class-variance-authority`, `cn` — shadcn/ui's primitive + styling stack

When implementing features that touch these, expect to scaffold their config as part of the work rather than finding it already in place.
