import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { runAgent } from "./agent.js";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Serve static files from public/ (index.html, etc.)
app.use(express.static(path.join(__dirname, "../public")));

// ── POST /api/chat ────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body as {
    message?: string;
    sessionId?: string;
  };

  if (!message || typeof message !== "string" || message.trim() === "") {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const sid = typeof sessionId === "string" && sessionId.trim()
    ? sessionId.trim()
    : "default";

  logger.info({ event: "http_request", method: "POST", path: "/api/chat", sessionId: sid });

  try {
    const reply = await runAgent(message.trim(), sid);
    res.json({ reply });
  } catch (err) {
    const message_err = err instanceof Error ? err.message : String(err);
    logger.error({ event: "http_error", path: "/api/chat", error: message_err });
    res.status(500).json({ error: message_err });
  }
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info({ event: "server_start", port: PORT });
  console.log(`Server running at http://localhost:${PORT}`);
});
