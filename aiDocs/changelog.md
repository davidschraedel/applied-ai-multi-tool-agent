# Changelog
What changed and why — not how. 1–2 lines per entry. Updated after every commit.

---

## 2026-03-16
- Phase 0: Initialized npm project, installed all LangChain/LangGraph/pino/express/Zod dependencies
- Created tsconfig.json, .env.example, and src/tools/, public/, scripts/ directory structure
- Phase 1: Implemented structured pino logger, calculator tool, web search tool, LangGraph ReAct agent, Express server, and chat UI
- Added scripts/test.sh; all 9 checks pass (Node version, secrets audit, TypeScript, env vars, calculator, web search)

## 2026-03-12
- Created full aiDocs/ suite: PRD, MVP, context, architecture, tech-stack-research, coding-style
- Defined branching strategy: feature branches only, AI develops, human reviews and merges
- Created execution roadmap (2026-03-12) consolidating all planning decisions and correct import paths

## 2026-03-09
- Initial project planning: PRD, plan doc, and first roadmap created
- Established project conventions: gitignored ai/, tracked aiDocs/, .antigravityrules for AI rules
