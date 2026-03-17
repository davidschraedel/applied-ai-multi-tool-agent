import { test, expect, Page } from "@playwright/test";

// Helper: send a message in the chat UI and wait for the agent reply bubble
async function sendMessage(page: Page, message: string): Promise<string> {
  const input = page.locator("#chat-input");
  const sendBtn = page.locator("#send-btn");

  // Count how many agent bubbles exist BEFORE sending
  const beforeCount = await page.locator(".bubble.agent").count();

  await input.fill(message);
  await sendBtn.click();

  // Wait until a NEW agent bubble appears and it's not the thinking spinner
  await page.waitForFunction(
    (before: number) => {
      const bubbles = document.querySelectorAll(".bubble.agent");
      if (bubbles.length <= before) return false;
      const last = bubbles[bubbles.length - 1];
      return !!last && !last.textContent?.includes("⏳");
    },
    beforeCount,
    { timeout: 55_000 }
  );

  const bubbles = page.locator(".bubble.agent");
  const count = await bubbles.count();
  return (await bubbles.nth(count - 1).textContent()) ?? "";
}

// ── Test 1: Page loads correctly ─────────────────────────────────────────────
test("page loads with required elements", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/AI Agent/i);
  await expect(page.locator("#chat-input")).toBeVisible();
  await expect(page.locator("#send-btn")).toBeVisible();
  await expect(page.locator("#messages")).toBeVisible();
  // The welcome agent bubble should be present
  await expect(page.locator(".bubble.agent").first()).toBeVisible();
});

// ── Test 2: Send a message and receive a reply ────────────────────────────────
test("send message and receive reply", async ({ page }) => {
  await page.goto("/");

  const reply = await sendMessage(page, "What is 5 + 5?");
  expect(reply.length).toBeGreaterThan(0);
  // The agent should return 10 (via calculator tool)
  expect(reply).toMatch(/10/);
});

// ── Test 3: Multi-turn memory — follow-up references earlier context ──────────
test("multi-turn memory: follow-up references earlier context", async ({ page }) => {
  await page.goto("/");

  // Turn 1: establish a fact
  await sendMessage(page, "My favourite number is 42. Remember that.");

  // Turn 2: recall the fact without re-stating it
  const reply2 = await sendMessage(page, "What is my favourite number?");
  expect(reply2).toMatch(/42/);
});
