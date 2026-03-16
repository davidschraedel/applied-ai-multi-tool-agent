import "dotenv/config";
import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import logger from "../logger.js";

const _tavilyClient = new TavilySearch({
  maxResults: 3,
  tavilyApiKey: process.env.TAVILY_API_KEY,
});

export const webSearchTool = tool(
  async ({ query }: { query: string }) => {
    logger.info({ event: "tool_call", tool: "web_search", args: { query } });

    try {
      const result = await _tavilyClient.invoke({ query });
      // TavilySearch returns a string or structured result; normalise to string
      const text = typeof result === "string" ? result : JSON.stringify(result);

      if (!text || text.trim() === "") {
        logger.warn({ event: "tool_result", tool: "web_search", result: "empty" });
        return "Web search returned no results.";
      }

      logger.info({
        event: "tool_result",
        tool: "web_search",
        resultLength: text.length,
      });
      return text;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ event: "tool_error", tool: "web_search", error: message });
      return `Web search error: ${message}`;
    }
  },
  {
    name: "web_search",
    description:
      "Searches the web for current or factual information using Tavily. " +
      "Use this for questions about recent events, facts, or anything that requires " +
      "up-to-date information from the internet. " +
      "Returns a summarised answer with source links.",
    schema: z.object({
      query: z
        .string()
        .describe("The search query — be specific for better results"),
    }),
  }
);
