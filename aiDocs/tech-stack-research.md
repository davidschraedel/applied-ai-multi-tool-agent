# Tech Stack Research
**Project:** AI Agent with LangChain & Web UI
**Date:** 2026-03-12
*Reference: `aiDocs/mvp.md` | `aiDocs/project-requirements.md`*

---

## Overview

| Package | Version / Source | Role |
|---|---|---|
| `langchain` | latest | Core agent framework (v1.x+) |
| `@langchain/langgraph` | latest | `createReactAgent`, graph state management |
| `@langchain/core` | latest | Base types: `BaseTool`, `HumanMessage`, `AIMessage` |
| `@langchain/anthropic` | latest | Chat LLM (Claude) |
| `@langchain/openai` | latest | Embeddings only (`text-embedding-3-small`) |
| `@langchain/tavily` | latest | Web search tool |
| `@langchain/classic` | latest | `MemoryVectorStore`, `DirectoryLoader`, `TextLoader` (legacy integrations in v1.x) |
| `@langchain/community` | latest | Additional community integrations (no longer provides `MemoryVectorStore`) |
| `zod` | latest | Tool input schema validation |
| `pino` | latest | Structured JSON logging |
| `express` | latest | HTTP server for web UI |

---

## 1. Agent — `createReactAgent` from LangGraph

**Key insight:** As of 2025, `createReactAgent` lives in `@langchain/langgraph/prebuilt`, NOT in `langchain`. The old `AgentExecutor` from `langchain/agents` is legacy.

### Import
```typescript
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
```

### Basic Usage
```typescript
const agent = createReactAgent({
  llm: model,         // ChatAnthropic instance
  tools: [tool1, tool2, tool3],
});

// Invoke with message history for multi-turn memory
const result = await agent.invoke(
  { messages: messageHistory },
  { recursionLimit: 10 }  // prevent infinite tool loops
);
```

### Multi-Turn Memory Pattern
The MVP approach: maintain a `messages` array per session and append to it each turn.

```typescript
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

// Per-session state
const messageHistory: BaseMessage[] = [];

// Each turn:
messageHistory.push(new HumanMessage(userInput));
const result = await agent.invoke(
  { messages: messageHistory },
  { recursionLimit: 10 }
);
// Extract last AI message
const lastMsg = result.messages[result.messages.length - 1];
messageHistory.push(lastMsg);
const agentReply = lastMsg.content as string;
```

> **Note:** `createReactAgent` returns `{ messages: BaseMessage[] }`. The full updated message array (including tool calls/results) is in `result.messages`. Append the last item to your history.

---

## 2. Chat LLM — `@langchain/anthropic`

### Import
```typescript
import { ChatAnthropic } from "@langchain/anthropic";
```

### Setup
```typescript
const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-20241022",   // or claude-3-haiku for speed/cost
  temperature: 0,
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### Tool Binding (for standalone usage)
`createReactAgent` handles `bindTools` internally — you don't need to call it manually.

```typescript
// Only needed if building a custom chain, NOT with createReactAgent
const modelWithTools = model.bindTools(tools);
```

> **Note:** Anthropic **does not** provide an embeddings model. Use `@langchain/openai` for embeddings even though Claude is the chat model.

---

## 3. Tools — Defining Custom Tools with Zod

### Import
```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";
```

### Pattern
```typescript
const calculatorTool = tool(
  async ({ expression }: { expression: string }) => {
    try {
      const result = eval(expression); // Replace with a safe evaluator
      return `${expression} = ${result}`;
    } catch (e) {
      return `Error evaluating expression: ${e}`;
    }
  },
  {
    name: "calculator",
    description: "Evaluates a mathematical expression. Input must be a valid math expression string.",
    schema: z.object({
      expression: z.string().describe("A mathematical expression to evaluate, e.g. '2 + 2' or '(100 * 3) / 4'"),
    }),
  }
);
```

> **Best practice:** The `description` is what the LLM reads to decide when to use the tool. Make it specific and include examples of usage.

---

## 4. Web Search — `@langchain/tavily`

### Import
```typescript
import { TavilySearch } from "@langchain/tavily";
```

### Setup
```typescript
const searchTool = new TavilySearch({
  maxResults: 3,
  tavilyApiKey: process.env.TAVILY_API_KEY,  // param is `tavilyApiKey`, not `apiKey`
});
```

> `TavilySearch` already implements `BaseTool` — just add it to the `tools` array in `createReactAgent`.

### Alternative import (if `@langchain/tavily` not found)
```typescript
// Fallback — check which is available in your installed version
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
```

---

## 5. RAG — `MemoryVectorStore` + `OpenAIEmbeddings`

### Import
```typescript
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
```

> **Warning:** In LangChain.js v1.x, vector stores and document loaders that were previously at `langchain/vectorstores/memory` and `langchain/document_loaders/...` now live in the `@langchain/classic` package. Install it with `npm install @langchain/classic`.

### Full RAG Setup Pattern
```typescript
// 1. Embeddings model (OpenAI — required even when using Claude for chat)
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. Load documents from a directory
const loader = new DirectoryLoader("./docs", {
  ".txt": (path) => new TextLoader(path),
});
const rawDocs = await loader.load();

// 3. Split into chunks
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,      // start here; tune if retrieval quality is poor
  chunkOverlap: 50,
});
const splitDocs = await splitter.splitDocuments(rawDocs);

// 4. Create vector store
const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

// 5. Add as a tool for the agent
const ragTool = tool(
  async ({ query }: { query: string }) => {
    const results = await vectorStore.similaritySearch(query, 3);
    if (results.length === 0) return "No relevant documents found.";
    return results
      .map(doc => `[Source: ${doc.metadata.source}]\n${doc.pageContent}`)
      .join("\n\n---\n\n");
  },
  {
    name: "document_search",
    description: "Search internal documents for information. Use this for questions about [your specific domain]. Returns relevant passages with source attribution.",
    schema: z.object({
      query: z.string().describe("The search query to look up in the document database"),
    }),
  }
);
```

### Source Attribution
`doc.metadata.source` contains the **file path** when using `DirectoryLoader`/`TextLoader`. Surface it in every returned result string, e.g. `[Source: docs/api-guide.txt]`.

---

## 6. Structured Logging — Pino

### Install
```
npm install pino
npm install --save-dev @types/pino  # if not bundled
```

### Import
```typescript
import pino from "pino";
```

### Setup
```typescript
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // Pretty-print in development, raw JSON in production
  transport: process.env.NODE_ENV !== "production"
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
});

export default logger;
```

### Usage — Tool Call Logging
Every tool invocation must log tool name, arguments, and result:

```typescript
// Log before tool call (inside tool implementation or via a wrapper)
logger.info({
  event: "tool_call",
  tool: "calculator",
  args: { expression: "2 + 2" },
});

// Log result
logger.info({
  event: "tool_result",
  tool: "calculator",
  result: "2 + 2 = 4",
});

// Log errors
logger.error({
  event: "tool_error",
  tool: "calculator",
  error: err.message,
});
```

### Child Loggers (recommended for request-scoped logging)
```typescript
const reqLogger = logger.child({ requestId: "abc-123", sessionId: "xyz" });
reqLogger.info({ event: "agent_invoke", userMessage: "..." });
```

> **Grader expectation:** JSON format, structured fields, levels (info/warn/error), appears for every tool invocation.

---

## 7. Express Server + Web UI

### Basic Server Pattern
```typescript
import express from "express";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;
  // ... invoke agent ...
  res.json({ reply: agentReply });
});

app.listen(3000, () => logger.info({ event: "server_start", port: 3000 }));
```

### Session Management
Since `createReactAgent` is stateless, the server is responsible for maintaining `messageHistory` per session:

```typescript
const sessions = new Map<string, BaseMessage[]>();

app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  const history = sessions.get(sessionId)!;
  history.push(new HumanMessage(message));

  const result = await agent.invoke(
    { messages: history },
    { recursionLimit: 10 }
  );
  const lastMsg = result.messages[result.messages.length - 1];
  history.push(lastMsg);

  res.json({ reply: lastMsg.content });
});
```

---

## 8. Known Import Path Gotchas

| What | Correct Path (2025) | Common Wrong Path |
|---|---|---|
| `createReactAgent` | `@langchain/langgraph/prebuilt` | `langchain/agents` ❌ |
| `MemoryVectorStore` | `@langchain/classic/vectorstores/memory` | `langchain/vectorstores/memory` ❌ (v1.x) |
| `HumanMessage` / `AIMessage` | `@langchain/core/messages` | `langchain/schema` ❌ |
| `tool()` helper | `@langchain/core/tools` | `langchain/tools` (may work but prefer core) |
| `RecursiveCharacterTextSplitter` | `@langchain/textsplitters` | `langchain/text_splitter` (deprecated) |
| `DirectoryLoader` | `@langchain/classic/document_loaders/fs/directory` | `langchain/document_loaders/...` ❌ (v1.x) |
| `TextLoader` | `@langchain/classic/document_loaders/fs/text` | `langchain/document_loaders/...` ❌ (v1.x) |
| `TavilySearch` | `@langchain/tavily` (constructor param: `tavilyApiKey`) | `TavilySearchResults` in community |

> **Rule:** When in doubt, always check the actual installed package's `package.json` exports field, or look at the TypeScript autocomplete. Import paths change between minor LangChain versions.

---

## 9. Required Environment Variables

```
ANTHROPIC_API_KEY   # Chat LLM (Claude)
OPENAI_API_KEY      # Embeddings only (text-embedding-3-small)
TAVILY_API_KEY      # Web search
```

Load these via `dotenv`:
```typescript
import "dotenv/config";  // at the top of your entry file
```

---

## 10. `scripts/test.sh` Requirements

```bash
#!/bin/bash
set -e

# 1. Node version check (LangChain v1.x packages require Node >= 20)
node_version=$(node -e "process.exit(parseInt(process.version.slice(1)) >= 20 ? 0 : 1)" 2>&1 || echo "FAIL")
echo "Node version: $(node --version)"

# 2. Secrets audit — fail if .env is tracked or API keys are in git
if git ls-files .env | grep -q ".env"; then
  echo "FAIL: .env is tracked in git"
  exit 1
fi
if git log --all -p | grep -qE "sk-[a-zA-Z0-9]{32,}|ANTHROPIC_API_KEY=.+|OPENAI_API_KEY=.+"; then
  echo "FAIL: API key found in git history"
  exit 1
fi

# 3. Tool tests (minimal smoke tests)
echo "Testing calculator..."
# ... invoke agent with a math question, check result ...

echo "All tests passed."
exit 0
```

---

## 11. `tsconfig.json` Minimum Setup

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## References & Key Links

- [LangChain.js Agents Guide](https://docs.langchain.com/oss/javascript/langchain/agents)
- [createReactAgent (LangGraph prebuilt)](https://langchain-ai.github.io/langgraphjs/how-tos/create-react-agent/)
- [LangChain.js Tool Calling Guide](https://docs.langchain.com/oss/javascript/langchain/tools)
- [MemoryVectorStore (@langchain/classic)](https://github.com/langchain-ai/langchainjs/tree/main/langchain)
- [Tavily integration (@langchain/tavily)](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-tavily)
- [Pino Logger GitHub](https://github.com/pinojs/pino)
- [OpenAI Embeddings Models](https://platform.openai.com/docs/models/embeddings)
