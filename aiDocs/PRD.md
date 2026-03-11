# Product Requirements Document (PRD)
## AI Agent with LangChain & Web UI
**Version:** 1.0
**Date:** 2026-03-09
**Status:** Immutable — changes require a new version or addendum

---

## Problem Statement

Knowledge workers, students, and developers frequently need to solve multi-step problems that require combining real-time information (web search), computation (math), and reference documentation lookup (RAG). Today this means switching between a search engine, a calculator, and a separate doc tool — losing context at every handoff. A single AI agent that reasons across these tools, remembers conversation context, and shows its work in a transparent UI eliminates that friction and reduces time-to-answer for complex, compounded queries.

---

## Target Users

| Segment | Description |
|---|---|
| **Primary** | BYU MISM students and knowledge workers who regularly combine research, calculation, and doc lookup in their workflow |
| **Secondary** | Developers evaluating LangChain / LangGraph agent patterns for production use |
| **NOT for** | End consumers expecting a polished commercial product; users with no tolerance for LLM latency or occasional tool errors |

---

## Success Metrics

| Metric | Target |
|---|---|
| All P0 tools return correct results | 100% pass rate on scripted test suite (`scripts/test.sh`) |
| UI renders streaming responses | Tokens appear progressively; no full-page wait |
| Playwright UI smoke tests pass | 100% on `npm test` |
| RAG retrieval returns relevant chunks | Top-1 result matches expected doc for 3+ test queries |
| Conversation memory persists across turns | Agent correctly references prior context in turn 3+ |
| No secrets committed to git | `.gitignore` audit passes; no API keys in history |

---

## Features by Priority

### P0 — Must Have (Unit 7)
- **Calculator Tool** — evaluates mathematical expressions via a sandboxed evaluator; validated with `zod`
- **Web Search Tool** — queries the web using Tavily API; returns summarized, cited results
- **Streaming Chat Web UI** — chat interface that streams tokens in real time; built with LangGraph
- **Basic Agent Loop** — LangGraph ReAct agent that selects and invokes tools based on user input
- **aiDocs Infrastructure** — `aiDocs/context.md`, `.gitignore` with secrets excluded, structured README
- **Structured Logging** — JSON-formatted logs (not raw `console.log`); distinguishes info / warn / error
- **Test Script** — `scripts/test.sh` with proper exit codes; covers tool correctness and agent response

### P1 — Should Have (Unit 8)
- **RAG Tool** — in-memory vector store over a documentation set; uses `@langchain/community` embeddings provider; returns top-k relevant chunks
- **Conversation Memory** — multi-turn context window managed by LangGraph; agent references prior turns accurately
- **Playwright UI Tests** — automated smoke tests validating chat input, response rendering, and streaming behavior

### P2 — Nice to Have (Post-Unit 8)
- **Tool call visualization** — display which tool was invoked and its raw output in the UI
- **Session persistence** — conversation history survives page reload (localStorage or backend store)
- **Model switcher** — toggle between Anthropic and OpenAI providers via env var or UI control
- **Error recovery UI** — graceful user-facing messages when a tool fails or API key is missing

---

## User Stories

1. **As a student**, I want to ask the agent a multi-step word problem so that it uses the calculator tool automatically and shows me the answer with reasoning.

2. **As a researcher**, I want to ask a current-events question so that the agent searches the web via Tavily and returns a cited, up-to-date answer — not a hallucinated one.

3. **As a developer evaluating the project**, I want to run `scripts/test.sh` so that I can verify all tools pass their tests with clear exit codes without reading source code.

4. **As a user in a follow-up turn**, I want the agent to remember what I asked earlier in the conversation so that I don't have to repeat context.

5. **As a user**, I want responses to stream token-by-token so that the UI feels fast and I'm not staring at a blank screen while the agent reasons.

6. **As a developer**, I want to open `aiDocs/context.md` so that an AI coding assistant can immediately understand the project structure, stack, and conventions without reading every source file.

7. **As a QA reviewer**, I want Playwright tests to run against the live UI so that the chat interface is validated end-to-end, not just unit-tested in isolation.

---

## Out of Scope

- **Authentication / user accounts** — no login, sessions are anonymous
- **Persistent database** — no Postgres, Redis, or external vector DB (in-memory only for RAG)
- **Production deployment** — no CI/CD pipeline, Docker, or cloud hosting required
- **Mobile UI** — desktop browser only
- **Multi-agent orchestration** — single ReAct agent; no supervisor / subagent patterns
- **Fine-tuning or custom model training** — uses hosted LLM APIs only
- **Cost optimization / token budgeting** — no usage metering or LLM cost controls

---

## Key Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| API keys missing or misconfigured at runtime | High | High | Document required env vars in `aiDocs/context.md`; fail fast with clear error message |
| Tavily search quota exceeded during demos | Medium | Medium | Cache recent results in dev; document fallback (mock responses) |
| LLM hallucinates tool selection (picks wrong tool) | Medium | Medium | Write explicit tool descriptions in schema; add integration tests that assert tool was called |
| Node.js version incompatibility (`< v18`) | Medium | High | Document `node >= 18` requirement in README; add version check in `test.sh` |
| RAG retrieval quality poor on small doc set | Medium | Medium | Curate a focused 5–10 doc set; tune chunk size and top-k |
| Streaming breaks on slow connections or tool calls | Low | Medium | Test with Playwright; add loading indicator fallback |
| Secrets accidentally committed | Low | Critical | `.gitignore` audit in `test.sh`; pre-commit hook recommended |

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Agent Framework | `@langchain/langgraph` |
| LLM Provider | `@langchain/anthropic` or `@langchain/openai` |
| Tool Definitions | `@langchain/core`, `zod` |
| Web Search | `@langchain/tavily` |
| RAG / Embeddings | `@langchain/community` + embeddings provider |
| UI Testing | Playwright |
| Runtime | Node.js v18+ |

---

## Phased Roadmap

- [ ] **Phase 1 (Unit 7):** Calculator tool + Web search tool + Streaming Web UI + Logging + test.sh
- [ ] **Phase 2 (Unit 8):** RAG tool + Conversation memory + Playwright UI tests

---

*This document is the immutable source of truth for the original requirements. Do not edit in place. For changes, create `PRD-v2.md` or an `addendum.md`.*
