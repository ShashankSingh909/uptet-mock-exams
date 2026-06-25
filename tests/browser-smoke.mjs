import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(import.meta.dirname, "..");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

async function startServer() {
  const server = createServer(async (request, response) => {
    const requestPath = new URL(request.url, "http://localhost").pathname;
    const fileName = requestPath === "/" ? "index.html" : requestPath.slice(1);
    const filePath = path.resolve(root, fileName);
    if (!filePath.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(filePath);
      response.writeHead(200, {
        "content-type": mime[path.extname(filePath)] ?? "application/octet-stream",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

test("mobile exam persists, navigates, times out, reviews, and resets", async () => {
  const { server, baseUrl } = await startServer();
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  try {
    await page.goto(`${baseUrl}/paper1.html`);
    await mkdir(path.join(root, "tmp", "qa"), { recursive: true });
    await page.screenshot({
      path: path.join(root, "tmp", "qa", "implementation-mobile-final.png"),
    });
    assert.match(await page.locator("#timer").innerText(), /^02:29|^02:30/);
    assert.equal(await page.locator(".answered .stat-number").innerText(), "0");
    assert.equal(await page.locator(".answer-explanation").count(), 0);
    assert.equal(await page.locator("#submit-exam-live").isDisabled(), true);

    await page.locator(".option-row").first().click();
    assert.equal(await page.locator(".answered .stat-number").innerText(), "1");
    await page.reload();
    assert.equal(await page.locator('input[name="answer"]:checked').getAttribute("value"), "a");

    await page.getByRole("button", { name: "सभी प्रश्न" }).click();
    await page.locator('[data-palette-jump="150"]').click();
    assert.equal(await page.locator(".question-meta h2").innerText(), "प्रश्न 150");

    await page.evaluate(() => {
      const key = "uptet-exam:paper1:v1";
      const state = JSON.parse(localStorage.getItem(key));
      state.active.startedAt = Date.now() - 9_001_000;
      localStorage.setItem(key, JSON.stringify(state));
    });
    await page.reload();
    assert.match(await page.locator(".result-hero").innerText(), /समय पूरा/);
    assert.equal(await page.getByText("149", { exact: true }).count(), 1);

    await page.getByRole("button", { name: "उत्तर और व्याख्या देखें" }).click();
    assert.equal(await page.locator(".review-card").count(), 150);
    assert.equal(await page.locator(".answer-explanation").count(), 150);

    await page.getByRole("button", { name: "परिणाम पर लौटें" }).click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "नया प्रयास शुरू करें" }).click();
    assert.equal(await page.locator(".question-meta h2").innerText(), "प्रश्न 1");
    assert.equal(await page.getByRole("button", { name: "नवीनतम समीक्षा" }).isVisible(), true);
  } finally {
    await context.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("selector and desktop exam fit without horizontal overflow", async () => {
  const { server, baseUrl } = await startServer();
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${baseUrl}/index.html`);
    assert.equal(await page.locator('a[href="paper1.html"]').count(), 1);
    assert.equal(await page.locator('a[href="paper2.html"]').count(), 1);
    await page.goto(`${baseUrl}/paper2.html`);
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth,
    }));
    assert.ok(dimensions.scrollWidth <= dimensions.innerWidth);
    assert.equal(await page.locator(".option-row").count(), 4);
  } finally {
    await context.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
