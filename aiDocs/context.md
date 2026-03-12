# Project Context
**AI Agent with LangChain & Web UI** | BYU MISM Applied AI, Units 7–8

---

## Where to Find Things
| Topic | File |
|---|---|
| Original instructor requirements (verbatim) | `aiDocs/project-requirements.md` |
| Requirements & scope | `aiDocs/PRD.md` |
| MVP scope & complexity warnings | `aiDocs/mvp.md` |
| Tech stack, import paths, code patterns | `aiDocs/tech-stack-research.md` |
| Implementation approach (WHAT & HOW) | `ai/roadmaps/2026-03-09_ai-agent_plan.md` |
| Execution checklist (current) | `ai/roadmaps/2026-03-12_ai-agent_roadmap.md` |
| Code style & git conventions | `aiDocs/coding-style.md` |
| Architecture diagram | `aiDocs/architecture.mmd` |
| Change history | `aiDocs/changelog.md` |

---

## Tech Stack
See `aiDocs/tech-stack-research.md` — includes correct import paths, API gotchas, and code patterns.

---

## Key Rules
- Return errors from tools — don't throw (let the LLM interpret and retry)
- Always set an iteration limit on the agent loop (circuit breaker)
- Never commit `.env` or `ai/`
- **Update `aiDocs/changelog.md` after every commit** — what changed and why, 1–2 lines, not how


