import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // In development use pino-pretty if available; fall back to raw JSON
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

export default logger;
