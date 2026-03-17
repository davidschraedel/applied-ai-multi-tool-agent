# AI Agent — Multi-Tool Chat

A conversational AI agent built with **LangGraph** and **Claude** that can calculate math, search the web, and retrieve information from internal documents. Built for BYU MISM Applied AI (Units 7 & 8).

---

## What It Does

The agent uses a **ReAct (Reason + Act)** pattern to automatically select and invoke the right tool for each user query:

| Tool | When It's Used |
|---|---|
| **Calculator** | Math expressions — `42 * 17`, `(100 - 32) * 5/9` |
| **Web Search** | Current events, facts, up-to-date information (Tavily) |
| **Document Search** | Questions about LangChain, RAG, logging, or this project's docs |

Features:
- Multi-turn conversation memory (follow-up questions work)
- Structured JSON logging (pino) for every tool call
- Web chat UI served by Express

---

## Prerequisites

- **Node.js v20+** — verify with `node --version`
- **Three API keys:**
  - `ANTHROPIC_API_KEY` — Claude (chat model)
  - `OPENAI_API_KEY` — OpenAI embeddings (`text-embedding-3-small`)
  - `TAVILY_API_KEY` — Tavily web search

---

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/davidschraedel/applied-ai-multi-tool-agent.git
cd applied-ai-multi-tool-agent

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Create your .env file
cp .env.example .env
# Edit .env and fill in your three API keys
```

---

## Run

```bash
# Development (auto-restarts on changes)
npm run dev

# Then open http://localhost:3000 in your browser
```

---

## Test

```bash
# Run the full tool smoke-test suite (Node version, secrets audit, tool tests)
npm run test:tools
# or
bash scripts/test.sh

# Run Playwright UI tests (starts the server automatically)
npm test
```

### What the tests check

`bash scripts/test.sh` (10 checks):
1. Node.js ≥ 20
2. `.env` not tracked in git
3. No API key values in git history
4. TypeScript compiles with no errors
5. All three env vars are set
6. Calculator: `2+2=4`, `42*17=714`, invalid input → error string
7. Web search: returns a non-empty result
8. RAG: retrieves doc passage with `[Source:]` attribution

`npm test` (Playwright):
- Page loads with correct element IDs
- Sending a message returns an agent reply
- Multi-turn memory: agent recalls a fact from an earlier turn

---

## Project Structure

```
src/
  logger.ts          # Structured JSON logger (pino)
  agent.ts           # LangGraph ReAct agent + per-session memory
  server.ts          # Express server + POST /api/chat
  tools/
    calculator.ts    # Safe math evaluator
    webSearch.ts     # Tavily web search
    rag.ts           # MemoryVectorStore + OpenAI embeddings
  docs/              # 6 .txt files loaded into the RAG corpus
public/
  index.html         # Chat UI
scripts/
  test.sh            # Smoke test runner
  test-calculator.ts
  test-webSearch.ts
  test-rag.ts
tests/
  ui.spec.ts         # Playwright UI tests
aiDocs/
  PRD.md             # Product requirements
  MVP.md             # MVP scope
  context.md         # Project orientation for AI tools
  changelog.md       # What changed and why
```

---

## Architecture

The user sends a message via the web UI → Express `POST /api/chat` → `runAgent()` in `agent.ts` → LangGraph's `createReactAgent` reasons about which tool to call → tool executes and logs the call → agent returns a final reply → Express sends it back to the UI.

Session memory is maintained per browser tab using a `sessionId` (UUID stored in `sessionStorage`).

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude chat model |
| `OPENAI_API_KEY` | OpenAI embeddings (required for RAG even when using Claude for chat) |
| `TAVILY_API_KEY` | Tavily web search |

See `.env.example` for the template.
