# MVP Definition
**Project:** AI Agent with LangChain & Web UI
**Date:** 2026-03-11
*Reference: `aiDocs/PRD.md` | `aiDocs/project-requirements.md`*

---

## 1. The ONE Core Problem to Solve
A user asks a question that requires more than one type of reasoning (e.g., "search for X, then calculate Y from the result") and gets a single, coherent answer — without switching tools or losing context between turns.

---

## 2. Minimum Feature Set
These are the non-negotiable items to hit the assignment requirements and demonstrate the ReAct pattern working end-to-end:

| Feature | Why It's Minimum |
|---|---|
| Calculator tool | Required by assignment; proves tool invocation |
| Web search tool (Tavily) | Required; proves real-world tool use |
| RAG tool (5+ real docs, source attribution) | Required; proves memory + retrieval |
| Conversation memory (multi-turn) | Required; follow-up questions must work |
| Web UI (chat page) | Required; terminal fallback not the target |
| Structured logging (tool calls + args + results) | **Explicitly graded** — must be JSON, not `console.log`; must show tool name, arguments, and result for every invocation |
| `scripts/test.sh` with proper exit codes | Graded on repo quality |
| 5+ meaningful commits | Graded on git history |
| `README.md` | Required deliverable |
| `aiDocs/context.md` | **Explicitly required** — orients AI tools to the project; graded as aiDocs infrastructure |
| `aiDocs/roadmap.md` with phases checked off | **Explicitly required** — graded deliverable; update it as you complete each phase |

---

## 3. What to Cut (Feels Important, Isn't)
| Cut | Rationale |
|---|---|
| Streaming responses | Recommended but not required — add only after everything else works |
| Persistent vector store | Stretch goal — in-memory is fine for the demo |
| 4th custom tool | Stretch goal — don't build until core 3 are solid |
| Polished UI design | The demo video "doesn't need to be polished" — functional > pretty |
| Session persistence across page reloads | Not required; in-memory session is sufficient |
| Model switcher / provider toggle | Over-engineering — pick one provider, move on |
| Tool call visualization in the UI | P2 in PRD; zero rubric value — skip it |

---

## 4. Simplest Technical Approach
- **Agent:** `createAgent` from `langchain` — one agent, three tools, no subagents
- **LLM:** `@langchain/anthropic` (Claude) — pick one provider, don't abstract it yet
- **RAG:** `MemoryVectorStore` from `@langchain/community/vectorstores/memory` — no database, no persistence needed *(verify exact import path against LangChain.js docs when you reach Phase 2; `@langchain/classic` is deprecated)*
- **Embeddings:** `OpenAIEmbeddings` (`text-embedding-3-small`) from `@langchain/openai` — **Anthropic does not offer an embeddings model.** You need an OpenAI API key for embeddings even if you use Claude for chat. Alternative: Voyage AI (Anthropic-recommended).
- **Documents:** Create a `docs/` folder with 5+ `.txt` files; use `DirectoryLoader` + `TextLoader` to load them, or define them inline in a `documents.ts` file. Either works — pick one.
- **Source attribution:** `similaritySearch` returns `doc.metadata.source` — surface this in the tool's return string (e.g., `[Source: api-docs.md]`). Don't forget this step.
- **UI:** Single `public/index.html` + Express server — no React, no build step
- **Streaming:** Skip for MVP; implement only if time allows after Phase 2 is done
- **Memory:** Maintain a `messageHistory` array per session; pass the full array to `agent.invoke()` on every turn — this is the naive implementation, which is fine for demo scale
- **Iteration limit:** Pass `{ recursionLimit: 10 }` to `agent.invoke()` to prevent infinite loops
- **Logger:** Use `pino` or `winston` — NOT `console.log`. Logs must be JSON-formatted and distinguish info / warn / error. Wire it up in Phase 1; don't retrofit it.

### Required packages
```
npm install langchain @langchain/anthropic @langchain/openai @langchain/langgraph @langchain/core @langchain/tavily @langchain/classic zod pino
```

### Required env vars
```
ANTHROPIC_API_KEY   # Chat model (Claude)
OPENAI_API_KEY      # Embeddings only (text-embedding-3-small)
TAVILY_API_KEY      # Web search
```

---

## 5. Known Complexity — Don't Underestimate These

| Area | What's Harder Than It Looks |
|---|---|
| RAG / embeddings | You need **two** API keys (Anthropic for chat, OpenAI for embeddings). Chunk size affects retrieval quality — start with 500-char chunks. Source attribution requires surfacing `doc.metadata.source` in the tool return string — it's plumbing you have to write. |
| Playwright tests | Requires `npx playwright install` (downloads browsers), tests must run against a **live local server**, and async streaming responses need special handling. Budget 2–3 hours just for setup + first passing test. |
| Structured logging | `console.log` does not satisfy "structured logging." You need a real logger (pino/winston) outputting JSON with levels. Every tool invocation must log: tool name, arguments, result. Wire this up in Phase 1, not as a retrofit. |
| `test.sh` | Must include: tool correctness tests, a `.gitignore` / secrets audit (grep for API key patterns; verify `.env` is ignored), and Node.js version check (`node >= 18`). Proper exit codes throughout. |

---

## 6. Validation
This is an individual graded project, so "user validation" = the rubric.

| Validator | Check |
|---|---|
| `bash scripts/test.sh` | Calculator + web search + RAG retrieval pass; `.gitignore` audit passes; Node version is 18+ |
| Manual browser test | Ask a math question → calculator invoked; ask a factual question → search invoked; ask a doc question → RAG invoked **with source cited** |
| Multi-turn test | Ask follow-up in turn 3 that references turn 1 — agent answers correctly |
| Playwright tests | UI smoke tests pass |
| Git log | 5+ commits with meaningful messages, not one dump |
| Demo video | 2-min screen capture showing UI + 2–3 tools in action |
| Repo audit | `aiDocs/context.md` exists; `aiDocs/roadmap.md` has phases checked off; no secrets in git history |

---

## MVP is Done When:
All three tools work (with source attribution on RAG), memory works, web UI works, `test.sh` passes (including secrets audit), JSON-structured logging is in place, `context.md` exists, roadmap is updated, README exists, and a 2-min demo video can be recorded showing it in action.
