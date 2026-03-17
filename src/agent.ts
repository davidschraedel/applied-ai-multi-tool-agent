import "dotenv/config";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { calculatorTool } from "./tools/calculator.js";
import { webSearchTool } from "./tools/webSearch.js";
import logger from "./logger.js";

// ── LLM ──────────────────────────────────────────────────────────────────────
const model = new ChatAnthropic({
  model: "claude-3-haiku-20240307",
  temperature: 0,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Tools ─────────────────────────────────────────────────────────────────────
// RAG tool added in Phase 2 — only calculator + webSearch for Phase 1
const tools = [calculatorTool, webSearchTool];

// ── Agent ─────────────────────────────────────────────────────────────────────
const agent = createReactAgent({ llm: model, tools });

// ── Per-session memory ────────────────────────────────────────────────────────
// Map<sessionId, message history array>
const sessions = new Map<string, BaseMessage[]>();

/**
 * Invoke the agent with a user message, maintaining per-session memory.
 * Returns the agent's reply as a plain string.
 */
export async function runAgent(
  userMessage: string,
  sessionId: string = "default"
): Promise<string> {
  // Initialise session if new
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  const history = sessions.get(sessionId)!;

  // Append the user turn
  history.push(new HumanMessage(userMessage));

  logger.info({
    event: "agent_invoke",
    sessionId,
    userMessage,
    historyLength: history.length,
  });

  try {
    // Invoke the ReAct agent with full history for multi-turn memory
    const result = await agent.invoke(
      { messages: history },
      { recursionLimit: 10 }
    );

    // The last message in result.messages is the final AI reply
    const lastMsg = result.messages[result.messages.length - 1];
    const reply =
      typeof lastMsg.content === "string"
        ? lastMsg.content
        : JSON.stringify(lastMsg.content);

    // Append the agent's full turn (including any tool call messages) to history
    // so follow-up turns have access to tool results
    for (const msg of result.messages.slice(history.length - 1)) {
      history.push(msg);
    }

    logger.info({ event: "agent_reply", sessionId, reply });
    return reply;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ event: "agent_error", sessionId, error: message });
    return `Agent error: ${message}`;
  }
}
