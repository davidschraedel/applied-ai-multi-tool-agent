import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,         // 60s per test — agent calls can be slow
  expect: { timeout: 30_000 },
  fullyParallel: false,    // serial — single server instance
  retries: 0,
  use: {
    baseURL: "http://localhost:3001",
    headless: true,
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Start the dev server before tests
  webServer: {
    command: "PORT=3001 npx tsx src/server.ts",
    url: "http://localhost:3001",
    reuseExistingServer: true,
    timeout: 30_000,
    stdout: "ignore",
    stderr: "ignore",
  },
});
