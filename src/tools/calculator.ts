import "dotenv/config";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import logger from "../logger.js";

// A safe math evaluator that only allows numbers and basic operators,
// rejecting dangerous input that eval() would accept.
function safeMath(expression: string): number {
  // Strip all whitespace for uniform matching
  const sanitized = expression.replace(/\s+/g, "");

  // Only allow digits, decimal points, and basic arithmetic operators + parentheses
  if (!/^[\d.+\-*/()^%\s]+$/.test(sanitized)) {
    throw new Error(`Expression contains invalid characters: "${expression}"`);
  }

  // Use Function constructor instead of eval — slightly safer, same power
  // eslint-disable-next-line no-new-func
  const result = new Function(`"use strict"; return (${sanitized})`)() as unknown;

  if (typeof result !== "number" || !isFinite(result)) {
    throw new Error(`Expression did not evaluate to a finite number: "${expression}"`);
  }

  return result;
}

export const calculatorTool = tool(
  async ({ expression }: { expression: string }) => {
    logger.info({ event: "tool_call", tool: "calculator", args: { expression } });

    try {
      const result = safeMath(expression);
      const reply = `${expression} = ${result}`;
      logger.info({ event: "tool_result", tool: "calculator", result: reply });
      return reply;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ event: "tool_error", tool: "calculator", error: message });
      return `Calculator error: ${message}`;
    }
  },
  {
    name: "calculator",
    description:
      "Evaluates a mathematical expression and returns the result. " +
      "Use this whenever the user asks you to compute or calculate something. " +
      "Input must be a valid arithmetic expression using numbers and operators (+, -, *, /, **, %). " +
      "Examples: '2 + 2', '(100 * 3) / 4', '2 ** 10'.",
    schema: z.object({
      expression: z
        .string()
        .describe(
          "A mathematical expression to evaluate, e.g. '42 * 17' or '(100 - 32) * 5/9'"
        ),
    }),
  }
);
