# Project Context
**AI Agent with LangChain & Web UI** | BYU MISM Applied AI, Units 7–8

---

## Where to Find Things
| Topic | File |
|---|---|
| Original instructor requirements (verbatim) | `aiDocs/project-requirements.md` |
| Requirements & scope | `aiDocs/PRD.md` |
| What to build & in what order | `ai/roadmaps/2026-03-09_ai-agent_plan.md` |
| Execution checklist | `ai/roadmaps/2026-03-09_ai-agent_roadmap.md` |
| Code style | `aiDocs/coding-style.md` *(to be created)* |
| Architecture diagram | `aiDocs/architecture.md` *(to be created)* |
| Change history | `aiDocs/changelog.md` *(to be created)* |

---

## Tech Stack
See **Dependencies & Tech Stack** section in `ai/roadmaps/2026-03-09_ai-agent_plan.md`

---

## Key Rules
- Return errors from tools — don't throw (let the LLM interpret and retry)
- Always set an iteration limit on the agent loop (circuit breaker)
- Never commit `.env` or `ai/`
- Update `aiDocs/changelog.md` after every commit


