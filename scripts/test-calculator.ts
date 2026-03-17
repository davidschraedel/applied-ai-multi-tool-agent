// Calculator smoke test — invoked by scripts/test.sh via ts-node
import "dotenv/config";
import { calculatorTool } from "../src/tools/calculator.js";

const r1 = await calculatorTool.invoke({ expression: "2 + 2" });
const r2 = await calculatorTool.invoke({ expression: "42 * 17" });
const r3 = await calculatorTool.invoke({ expression: "hello world" });

const ok1 = r1.includes("4");
const ok2 = r2.includes("714");
const ok3 = r3.toLowerCase().includes("error");

if (ok1 && ok2 && ok3) {
  process.stdout.write("PASS\n");
  process.exit(0);
} else {
  process.stdout.write(`FAIL r1="${r1}" r2="${r2}" r3="${r3}"\n`);
  process.exit(1);
}
