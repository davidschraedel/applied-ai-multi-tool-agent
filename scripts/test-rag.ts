// RAG smoke test — invoked by scripts/test.sh via tsx
import "dotenv/config";
import { ragTool } from "../src/tools/rag.js";

// Give it a question that should match the docs
const result = await ragTool.invoke({ query: "how does the ReAct agent pattern work?" });

const hasSource = result.includes("[Source:");
const hasContent = result.length > 50;

if (hasSource && hasContent) {
  process.stdout.write("PASS\n");
  process.exit(0);
} else {
  process.stdout.write(`FAIL: hasSource=${hasSource} hasContent=${hasContent}\nResult: ${result.slice(0, 200)}\n`);
  process.exit(1);
}
