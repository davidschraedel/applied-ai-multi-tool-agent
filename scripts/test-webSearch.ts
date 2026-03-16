// Web search smoke test — invoked by scripts/test.sh via ts-node
import "dotenv/config";
import { webSearchTool } from "../src/tools/webSearch.js";

const result = await webSearchTool.invoke({ query: "what year is it" });

if (typeof result === "string" && result.length > 10) {
  process.stdout.write("PASS\n");
  process.exit(0);
} else {
  process.stdout.write(`FAIL: result="${String(result).slice(0, 80)}"\n`);
  process.exit(1);
}
