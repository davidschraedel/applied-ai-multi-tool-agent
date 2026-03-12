# Coding Style & Development Conventions
**Project:** AI Agent with LangChain & Web UI

---

## Git Branching Strategy

```
main ─────●───────●───────●────────▶
           \             /
            \           /
    feature  ●─────●───●
```

- **`main`** = production-ready code only
- **Feature branches** = all development work happens here

### Rules
- Never commit directly to `main`
- One branch per feature/task
- Merge to `main` only when feature is complete and tested

## Roles
- **AI Agent**: The AI agent does the following:
    - create feature branch
    - commit incrementally
    - self-review before PR
    - review feedback after human review
- **Human**: The human does the following:
    - high-level review of PR
    - merge to main

### Branch Naming
Use short, descriptive names matching the roadmap task:

| Task | Branch Name |
|---|---|
| Project scaffold | `scaffold` |
| Structured logger | `logger` |
| Calculator tool | `calculator-tool` |
| Web search tool | `web-search-tool` |
| Agent loop | `agent-loop` |
| Web UI | `web-ui` |
| Test script | `test-script` |
| RAG tool | `rag-tool` |
| Playwright tests | `playwright-tests` |
| README | `readme` |

### Commit Message Format
```
feat: add calculator tool
test: add test.sh calculator assertions
chore: initial project scaffold
docs: add README
fix: handle empty search results
```

### Commit Checkpoints
- Commit **before** starting any major AI-assisted task (save point)
- Review `git diff` before every commit — this is your primary review tool
- Update `aiDocs/changelog.md` after every commit (what changed and why, 1–2 lines)

---

## Code Style

*TypeScript conventions to be added as the project develops.*

- Use `pino` for all logging — no `console.log`
- All tools must return error strings, never throw
- All tool inputs validated with `zod`
