import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import logger from "../logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Embeddings model ──────────────────────────────────────────────────────────
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Vector store singleton — initialised once on first import ─────────────────
let _vectorStore: MemoryVectorStore | null = null;

async function getVectorStore(): Promise<MemoryVectorStore> {
  if (_vectorStore) return _vectorStore;

  const docsDir = path.join(__dirname, "../docs");
  logger.info({ event: "rag_init", docsDir }, "Loading documents for RAG");

  // Load .txt and .csv files from src/docs/
  // CSVLoader creates one Document per row — better for tabular data retrieval
  const loader = new DirectoryLoader(docsDir, {
    ".txt": (filePath: string) => new TextLoader(filePath),
    ".csv": (filePath: string) => new CSVLoader(filePath),
  });
  const rawDocs = await loader.load();

  if (rawDocs.length === 0) {
    logger.warn({ event: "rag_init_warn" }, "No documents found in docs directory");
  }

  // Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const splitDocs = await splitter.splitDocuments(rawDocs);

  logger.info(
    { event: "rag_init_done", rawDocCount: rawDocs.length, chunkCount: splitDocs.length },
    "RAG vector store initialised"
  );

  _vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  return _vectorStore;
}

// ── RAG Tool ──────────────────────────────────────────────────────────────────
export const ragTool = tool(
  async ({ query }: { query: string }) => {
    logger.info({ event: "tool_call", tool: "document_search", args: { query } });

    try {
      const store = await getVectorStore();
      const results = await store.similaritySearch(query, 3);

      if (results.length === 0) {
        logger.warn({ event: "tool_result", tool: "document_search", result: "no_results" });
        return "No relevant documents found for that query.";
      }

      const formatted = results
        .map((doc) => {
          // Normalise the source path to just the filename for readability
          const sourcePath = doc.metadata.source as string;
          const fileName = path.basename(sourcePath);
          return `[Source: ${fileName}]\n${doc.pageContent}`;
        })
        .join("\n\n---\n\n");

      logger.info({
        event: "tool_result",
        tool: "document_search",
        resultCount: results.length,
      });
      return formatted;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ event: "tool_error", tool: "document_search", error: message });
      return `Document search error: ${message}`;
    }
  },
  {
    name: "document_search",
    description:
      "Searches internal project documentation for information about " +
      "LangChain, LangGraph, RAG, vector embeddings, structured logging, " +
      "and the agent's tools. Use this when the user asks a technical question " +
      "about how this project works, the tools available, or these AI concepts. " +
      "Returns the most relevant document passages with source attribution.",
    schema: z.object({
      query: z
        .string()
        .describe("The search query to look up in the project documentation"),
    }),
  }
);

// Eagerly initialise on import so the first user request isn't slow
getVectorStore().catch((err) => {
  logger.error({ event: "rag_init_error", error: String(err) }, "RAG initialisation failed");
});
