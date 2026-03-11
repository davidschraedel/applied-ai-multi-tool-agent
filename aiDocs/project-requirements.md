# Multi-Tool AI Agent — Project Requirements
*Source: BYU MISM Applied AI — Individual Project, Dev Units 7 & 8*
*Stored verbatim. Do not edit. See `aiDocs/PRD.md` for interpreted requirements.*

---

## What You're Building
A chatbot agent with:

- **Calculator tool** - evaluates math expressions
- **Web search tool** - searches the web using Tavily
- **RAG tool** - vector search over at least 5 real documents, with source attribution (response includes source of where information was found)
- **Conversation memory** - multi-turn context (follow-up questions work)
- **Web UI** - a chat web page (terminal fallback acceptable but not the target)
- **Streaming** - recommended but not required

---

## Repo Requirements
Build this with proper development practices. We review your repo, not just whether the chatbot works.

- `context.md` - orients AI tools to your project
- PRD - what the agent does, its tools, the problem it solves
- Roadmap - phased plan with progress tracked
- `.gitignore` - no secrets, no node_modules, etc
- Structured logging - logging that shows tool calls, arguments, and results
- Incremental git history - 5+ meaningful commits showing progression (setup > tools > agent > UI > RAG > polish), not one dump
- `README.md` - what it does, how to run it

---

## Deliverables
- GitHub repo with proper infrastructure and incremental history
- Working agent — three tools + memory + web UI
- `README.md`
- 2-minute demo video - an unedited screen capture showing your agent's web UI in action with a couple of its tools/features. Doesn't need to be polished.

**Submit:** GitHub repo link + demo video.

---

## Stretch Goals (Extra Credit)
- Streaming in the web UI
- 4th custom tool
- Persistent vector store - documents survive restarts
