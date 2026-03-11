# AI Agent with LangChain & Web UI — Execution Roadmap
**Date:** 2026-03-09
**Companion Plan:** `ai/roadmaps/2026-03-09_ai-agent_plan.md`
**PRD:** `aiDocs/PRD.md`

> This is the execution checklist. For implementation details, see the plan doc.

---

## Phase 1 — Unit 7

### 1. Project Scaffolding
- [ ] `npm init` — initialize project
- [ ] Install Phase 1 dependencies (see plan doc)
- [ ] Create full directory structure (`aiDocs/`, `ai/`, `src/tools/`, `public/`, `scripts/`)
- [ ] Create `.gitignore` — includes `node_modules/`, `.env`, `ai/`, `claude.md`, `.cursorrules`, `dist/`
- [ ] Create `.env.example` — all required key names, no values
- [ ] Create `aiDocs/context.md` — concise pointer file (see plan doc for structure)
- [ ] Create `aiDocs/changelog.md` — first entry: "Initial project scaffold"
- [ ] ✅ **Done when:** `npm install` succeeds, `.env` not tracked by git, `context.md` exists

### 2. Structured Logging
- [ ] Install `pino`
- [ ] Create `src/logger.ts` — JSON output, exports named logger
- [ ] Verify: no `console.log` in any source file
- [ ] ✅ **Done when:** `import logger from './logger'` works; logs emit JSON to stdout

### 3. Calculator Tool
- [ ] Install `mathjs`
- [ ] Create `src/tools/calculator.ts`
- [ ] Define `zod` input schema: `{ expression: z.string() }`
- [ ] Implement evaluator using `mathjs` (not `eval`)
- [ ] Add test to `scripts/test.sh`: `2 + 2` → `4`, `(10 * 3) / 5` → `6`
- [ ] ✅ **Done when:** test assertions pass, exit code 0

### 4. Web Search Tool
- [ ] Create `src/tools/webSearch.ts`
- [ ] Configure `@langchain/tavily` with `TAVILY_API_KEY` from env
- [ ] Define `zod` input schema: `{ query: z.string() }`
- [ ] Return: title + snippet + URL for top results
- [ ] Wrap in try/catch; log errors via `pino`; return readable error string on failure
- [ ] Add test to `scripts/test.sh`: known query returns non-empty array
- [ ] ✅ **Done when:** test assertions pass; tool handles API errors gracefully

### 5. Agent Loop
- [ ] Create `src/agent.ts`
- [ ] Register calculator and webSearch tools with LangGraph ReAct agent
- [ ] LLM provider selected via env (`ANTHROPIC_API_KEY` preferred, `OPENAI_API_KEY` fallback)
- [ ] Export `runAgent(input: string, sessionId?: string): AsyncIterable<string>`
- [ ] ✅ **Done when:** `runAgent("what is 42 * 17?")` invokes calculator tool and streams answer

### 6. Streaming Web UI
- [ ] Create `src/server.ts` — Express HTTP server
- [ ] `POST /chat` endpoint — accepts `{ message, sessionId }`, streams via SSE
- [ ] Create `public/index.html` — chat UI: input `#chat-input`, button `#send-btn`, messages `#messages`
- [ ] Tokens stream progressively (no full-page wait)
- [ ] ✅ **Done when:** browser shows streaming tokens; elements have correct IDs

### 7. Test Script
- [ ] Create `scripts/test.sh` — `chmod +x scripts/test.sh`
- [ ] Check: `node --version` ≥ 18, fail with message if not
- [ ] Run: calculator assertions
- [ ] Run: web search assertion
- [ ] Exit: `0` on all pass, non-zero on any failure
- [ ] Document: add `npm run test:tools` script to `package.json`
- [ ] ✅ **Done when:** `bash scripts/test.sh` exits 0 cleanly; fails loudly on bad input

### Phase 1 Complete When:
- [ ] `bash scripts/test.sh` passes
- [ ] Browser UI renders streaming tokens
- [ ] `git log --all -- .env` shows no .env commits
- [ ] `aiDocs/changelog.md` has entries for each commit

---

## Phase 2 — Unit 8

### 8. RAG Tool
- [ ] Install Phase 2 deps: `@langchain/community` + embeddings provider
- [ ] Curate 5–10 reference docs → `src/docs/` (markdown or plain text)
- [ ] Create `src/tools/rag.ts`
- [ ] Load docs → chunk (500 tokens, 50 overlap) → embed → `MemoryVectorStore`
- [ ] Define `zod` schema: `{ query: z.string() }`
- [ ] Return top-3 chunks with source filename label
- [ ] Add test to `scripts/test.sh`: known query → expected doc appears in top-1
- [ ] ✅ **Done when:** retrieval test passes on 3+ distinct queries

### 9. Conversation Memory
- [ ] Update `src/agent.ts` to maintain `messages` array in LangGraph state per session
- [ ] Verify: agent references turn-1 info when asked in turn 3
- [ ] ✅ **Done when:** manual multi-turn test confirms context retention

### 10. Playwright UI Tests
- [ ] Install: `npm install -D @playwright/test && npx playwright install`
- [ ] Create `tests/ui.spec.ts`
  - [ ] Test: page loads, `#chat-input` and `#send-btn` visible
  - [ ] Test: type a message → click send → `#messages` contains a response
  - [ ] Test: streaming — response div has content before the full response completes
  - [ ] Test: multi-turn — second message response references prior context
- [ ] Add `npm test` → runs Playwright
- [ ] Add Playwright step to `scripts/test.sh`
- [ ] ✅ **Done when:** `npm test` passes all specs; no flaky timeouts

### 11. README.md
- [ ] What the project does (1 paragraph)
- [ ] Prerequisites: Node.js ≥ 18, API keys needed
- [ ] Setup: `npm install`, copy `.env.example` → `.env`, add keys
- [ ] How to run: `npm run dev`
- [ ] How to test: `bash scripts/test.sh` and `npm test`
- [ ] ✅ **Done when:** a new person can clone + run the project using only the README

### Phase 2 Complete When:
- [ ] RAG retrieval test passes (3+ queries)
- [ ] Multi-turn memory confirmed in manual test
- [ ] All Playwright specs pass with `npm test`
- [ ] `README.md` covers setup, run, and test
- [ ] Demo video recorded (2 min unedited, shows UI + 2 tools in action)
- [ ] `aiDocs/changelog.md` updated through final commit

---

## Commit Checkpoint Log
*Add a row after each significant commit — use `git log --oneline` to get the hash.*

| Commit | Hash | Notes |
|---|---|---|
| Initial scaffold | — | — |
| Add logging | — | — |
| Add calculator tool | — | — |
| Add web search tool | — | — |
| Add agent loop | — | — |
| Add streaming UI | — | — |
| Add test script | — | — |
| Add RAG tool | — | — |
| Add conversation memory | — | — |
| Add Playwright tests | — | — |
| Add README.md | — | — |
| Final polish + demo video | — | — |
