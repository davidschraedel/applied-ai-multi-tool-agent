# AI Agent with LangChain & Web UI — Implementation Plan
**Date:** 2026-03-09
**Plan:** `ai/roadmaps/2026-03-09_ai-agent_plan.md` ← *WHAT and HOW (this file)*
**Roadmap:** `ai/roadmaps/2026-03-09_ai-agent_roadmap.md` ← *Execution checklist*
**PRD Reference:** `aiDocs/PRD.md`
**Status:** Active

> **Note:** `ai/` is gitignored — this file is local working space only. `aiDocs/` is tracked.

---

## Overview

Two-phase implementation of a LangChain/LangGraph ReAct agent with a streaming web UI, tool integrations (calculator, web search, RAG), conversation memory, and Playwright-based UI testing. Spans Units 7 and 8.

Execution checklist lives in the companion roadmap file. This document covers implementation approach, technical decisions, and dependencies.

---

## Work Breakdown

### Phase 1 — Unit 7

1. **Project Scaffolding** — `npm init`, install deps, create directory structure, `.gitignore`, `.env.example`
2. **Structured Logging** — install `pino`, create `src/logger.ts` with JSON output; no raw `console.log` from the start
3. **Calculator Tool** — `src/tools/calculator.ts` with `zod` schema; safe eval via `mathjs`
4. **Web Search Tool** — `src/tools/webSearch.ts` wrapping `@langchain/tavily`; `zod` schema; try/catch with structured error logging
5. **Agent Loop** — `src/agent.ts`; LangGraph ReAct agent with both tools; LLM provider selected via env var; exposes `runAgent()` as async iterable
6. **Streaming Web UI** — Express server at `src/server.ts`; SSE endpoint; `public/index.html` chat UI with unique element IDs for Playwright
7. **Test Script** — `scripts/test.sh`; checks Node ≥ 18; runs tool unit tests; exits non-zero on failure

### Phase 2 — Unit 8

8. **RAG Tool** — curate 5–10 docs in `src/docs/`; chunk + embed into `MemoryVectorStore`; `src/tools/rag.ts` with `zod` schema; returns top-3 chunks with source labels
9. **Conversation Memory** — update `src/agent.ts` to persist `messages` array across turns via LangGraph state
10. **Playwright UI Tests** — `tests/ui.spec.ts`; smoke test: load → type → send → response appears; streaming test; multi-turn memory test

---

## Directory Structure

```
Agent/
├── aiDocs/                         # ← TRACKED in git
│   ├── context.md                  # Lightweight pointer to other docs (see below)
│   ├── PRD.md                      # Product requirements (immutable)
│   ├── mvp.md                      # MVP definition
│   ├── architecture.md             # System architecture
│   ├── coding-style.md             # Code conventions
│   └── changelog.md                # What changed and why (1-2 lines each)
├── ai/                             # ← GITIGNORED (local working space)
│   ├── guides/                     # Library docs, external research
│   ├── roadmaps/                   # Plans and checklists (this file)
│   └── notes/                      # Brainstorming, scratch
├── src/
│   ├── tools/
│   │   ├── calculator.ts
│   │   ├── webSearch.ts
│   │   └── rag.ts                  # Phase 2
│   ├── docs/                       # RAG source documents (Phase 2)
│   ├── agent.ts
│   ├── server.ts
│   └── logger.ts
├── public/
│   └── index.html                  # Chat UI
├── tests/
│   └── ui.spec.ts                  # Playwright tests (Phase 2)
├── scripts/
│   └── test.sh
├── claude.md                       # ← GITIGNORED (personal AI tool config)
├── .cursorrules                    # ← GITIGNORED (personal AI tool config)
├── .env                            # ← GITIGNORED (never committed)
├── .env.example                    # Safe to commit (key names, no values)
├── .gitignore
├── package.json
└── README.md
```

### What goes in `aiDocs/context.md`

`context.md` is a **concise reference pointer** — not a full documentation dump. It tells an AI tool where to find things, states the tech stack, and lists any global rules. Example structure:

```markdown
# Project Context
## Critical Files
- PRD: aiDocs/PRD.md
- Architecture: aiDocs/architecture.md
- Style Guide: aiDocs/coding-style.md
- Changelog: aiDocs/changelog.md
## Tech Stack
- Agent: LangGraph ReAct, @langchain/anthropic
- Tools: calculator (mathjs), web search (Tavily), RAG (MemoryVectorStore)
- UI: Express + SSE + vanilla HTML
- Testing: scripts/test.sh + Playwright
## Global Rules
- All scripts exit non-zero on failure
- Use structured logging (pino) — no console.log
- Never commit .env or ai/
- Update changelog with every commit
```

---

## Implementation Approach

### Agent Architecture
Use LangGraph's **ReAct pattern** — the agent reasons in a loop: observe input → think → select tool → observe result → repeat until answer is ready. Tool selection is driven by the LLM reading tool descriptions, so descriptions must be precise and unambiguous.

### Streaming
Expose agent output via **Server-Sent Events (SSE)** from the Express server. The frontend opens a persistent connection and appends tokens to the chat bubble as they arrive. LangGraph's `.stream()` method emits chunks natively.

### Tool Safety
- Calculator uses `mathjs` (not `eval`) to prevent code injection.
- Web search wraps Tavily in a try/catch; logs errors structured; returns user-readable error string on failure.
- RAG runs fully in-memory — no external DB required.

### Testing Strategy
- **Unit level:** Each tool has a direct function test in `test.sh` — input → expected output assertion.
- **Integration level:** Agent is called with a test prompt; response is checked for non-empty and correct tool invocation (logged).
- **UI level (Phase 2):** Playwright runs against the live dev server.

### Git Discipline
- One commit per work breakdown item (not one giant commit) — git history tells the story of the build.
- Commit messages: `feat: add calculator tool` / `test: add test.sh calculator assertions`.
- **Commit before every major AI task** — treat commits as save points / checkpoints.
- After every commit: have AI update `aiDocs/changelog.md` with what changed and why (1–2 lines, not how).
- Never commit `.env` or `ai/`; verify with `git log --all -- .env` before submission.
- Use `git diff` to review AI changes before committing — this is your primary review tool.

---

## Technical Considerations

| Concern | Decision |
|---|---|
| Expression evaluation | Use `mathjs` — safe, full-featured, no `eval` |
| Logging | `pino` — JSON by default, fast, structured |
| LLM provider | Env-var driven: `ANTHROPIC_API_KEY` preferred; fallback to `OPENAI_API_KEY` |
| Embeddings | `@langchain/community` with OpenAI or local model |
| Streaming transport | SSE (simpler than WebSockets; sufficient for one-way token stream) |
| Session scoping | In-memory Map keyed by session ID from cookie or URL param |
| Tool schema validation | All tools validated with `zod` before LLM sees them |

---

## Dependencies & Prerequisites

### Phase 1
```bash
npm install \
  langchain \
  @langchain/core \
  @langchain/langgraph \
  @langchain/anthropic \
  @langchain/tavily \
  zod \
  mathjs \
  express \
  pino
```

### Phase 2 (additional)
```bash
npm install \
  @langchain/community \
  @playwright/test
```

### Environment Variables Required
| Variable | Phase | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | 1 | Primary LLM provider |
| `OPENAI_API_KEY` | 1 | Fallback LLM / embeddings provider |
| `TAVILY_API_KEY` | 1 | Web search tool |

### System Prerequisites
- Node.js `>= 18` (checked by `test.sh`)
- npm `>= 9`
- Git initialized in project root

---

## Phase Completion Criteria

Detailed execution checklist lives in `ai/roadmaps/2026-03-09_ai-agent_roadmap.md`.

- **Phase 1 done when:** `scripts/test.sh` passes; calculator + web search return correct results; UI streams tokens; no secrets in git
- **Phase 2 done when:** RAG returns relevant chunks on 3+ test queries; agent correctly references prior context in turn 3+; all Playwright tests pass

---

*Reference PRD at `aiDocs/PRD.md` for authoritative requirements. This plan describes implementation strategy (WHAT and HOW). The companion roadmap at `ai/roadmaps/2026-03-09_ai-agent_roadmap.md` is the execution checklist.*
