# AI Agent — Execution Roadmap
**Date:** 2026-03-12
**Refs:** `aiDocs/PRD.md` | `aiDocs/mvp.md` | `aiDocs/tech-stack-research.md` | `ai/roadmaps/2026-03-09_ai-agent_plan.md`

---

## Phase 0 — Project Scaffold
- [x] `npm init` and install all Phase 1 dependencies
- [x] Create `tsconfig.json`
- [x] Create `.env.example` — all required key names, no values (safe to commit)
- [x] Create `.env` from `.env.example` with all three API keys
- [x] Create `aiDocs/changelog.md` — first entry: "Initial scaffold"
- [x] Verify `.env` is untracked by git
- [x] ✅ **Done when:** project runs without import errors; `.env` is gitignored

---

## Phase 1 — Core Tools + Agent (Unit 7)

### 1. Structured Logger
- [x] Create `src/logger.ts` with pino JSON output
- [x] ✅ **Done when:** any file can import logger and emits structured JSON to stdout

### 2. Calculator Tool
- [x] Create `src/tools/calculator.ts` with zod schema and safe math evaluator
- [x] Logs tool call + result; returns error string on failure (no throws)
- [x] ✅ **Done when:** direct invocation returns `"2 + 2 = 4"`; bad input returns a string error

### 3. Web Search Tool
- [x] Create `src/tools/webSearch.ts` using Tavily
- [x] Wraps in try/catch; logs tool call + result; returns error string on failure
- [x] ✅ **Done when:** known query returns non-empty results

### 4. Agent Loop
- [x] Create `src/agent.ts` with `createReactAgent` (LangGraph prebuilt)
- [x] Per-session `messages` array for multi-turn memory; `recursionLimit: 10`
- [x] Export `runAgent(message, sessionId)` returning agent reply string
- [x] ✅ **Done when:** `runAgent("what is 42 * 17?")` invokes calculator and returns correct answer

### 5. Web UI
- [x] Create `src/server.ts` — Express; serves `public/`; handles `POST /api/chat`
- [x] Create `public/index.html` — `#chat-input`, `#send-btn`, `#messages`
- [x] ✅ **Done when:** browser sends a message and receives a reply

### 6. Test Script
- [x] Create `scripts/test.sh` (`chmod +x`)
- [x] Checks: Node ≥ 20, `.env` not tracked, no API keys in git history
- [x] Smoke tests: calculator and web search return expected output
- [x] Add `npm run test:tools` script to `package.json`
- [x] ✅ **Done when:** `bash scripts/test.sh` exits 0; fails loudly on any error

### Phase 1 Complete When:
- [x] `bash scripts/test.sh` passes
- [x] Browser receives agent replies
- [x] 3–4 meaningful git commits logged below
- [x] `aiDocs/changelog.md` updated

---

## Phase 2 — RAG + Memory + Tests (Unit 8)

### 7. RAG Tool
- [x] Create `src/docs/` with 5+ real `.txt` documents
- [x] Create `src/tools/rag.ts` — load, chunk, embed, store in `MemoryVectorStore`
- [x] Returns top-3 results with `[Source: filename]` attribution
- [x] Add RAG tool to agent; add RAG test to `scripts/test.sh`
- [x] ✅ **Done when:** doc-specific question returns answer with source attribution; retrieval test passes

### 8. Conversation Memory Verification
- [x] Manual test: fact established in turn 1 is recalled in turn 3 without re-stating
- [x] ✅ **Done when:** multi-turn follow-up works end-to-end with all 3 tools registered

### 9. Playwright UI Tests
- [x] Install Playwright; create `tests/ui.spec.ts`
- [x] Tests: page loads; message sent → response received; multi-turn coherent
- [x] `npm test` runs Playwright against local server
- [x] ✅ **Done when:** `npm test` passes all specs

### 10. README.md
- [x] Covers: what it does, prerequisites (Node ≥ 20 + 3 API keys), setup, run, test
- [x] ✅ **Done when:** a new person can clone + run using only the README

### Phase 2 Complete When:
- [x] All 3 tools work; RAG returns source attribution
- [x] Multi-turn memory confirmed
- [x] `npm test` passes
- [x] `bash scripts/test.sh` passes (includes RAG test + secrets audit)
- [x] `README.md` complete
- [ ] Demo video recorded (2 min, unedited, shows UI + 2–3 tools)
- [x] 5+ meaningful git commits total
- [x] `aiDocs/changelog.md` updated through final commit

---

## Stretch Goals (after Phase 2 only)
- [ ] Streaming responses via SSE
- [ ] 4th custom tool
- [ ] Persistent vector store

---

## Commit Log
| # | Hash | Message |
|---|---|---|
| 1 | b8401ef | `chore: initial project scaffold` |
| 2 | 05a3790 | `feat: add pino structured logger, calculator and web search tools` |
| 3 | bf8d4b0 | `feat: add LangGraph ReAct agent loop, Express server, and chat UI` |
| 4 | 147032c | `test: add scripts/test.sh with node version, secrets audit, and tool smoke tests` |
| 5 | e2ca91d | `fix: update Claude model to claude-3-haiku-20240307` |
| 6 | 801704c | `feat: add RAG tool with MemoryVectorStore, OpenAI embeddings, and source attribution` |
| 7 | fbaf77c | `test: add Playwright UI tests (page load, reply, multi-turn memory)` |
| 8 | 2de4b59 | `docs: add README with setup, run, test instructions, and architecture overview` |
