import { pathToFileURL } from "node:url";
if (!process.env.PLAYWRIGHT_MODULE)
  throw new Error("Set PLAYWRIGHT_MODULE to an externally installed playwright-core index.mjs");
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const exceptions = [];
page.on("pageerror", (e) => exceptions.push(e.message));
await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Navoscope", exact: true }).waitFor();
assert.equal(
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link").count(),
  3,
);
await page.getByRole("link", { name: "Page 1 — Market Explorer" }).click();
await page.waitForURL("**/login**");
await page.getByRole("dialog").waitFor({ state: "visible" });
console.log("PASS homepage numbered navigation redirects unauthenticated visitor to login dialog");
await page.goto("http://127.0.0.1:3000/page-2", { waitUntil: "networkidle" });
await page.waitForURL("**/login**");
console.log("PASS direct private route redirects to hosted-auth login");
await page.setViewportSize({ width: 375, height: 812 });
await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  true,
);
await page.getByRole("link", { name: "Log in / Create account" }).click();
await page.getByRole("dialog").waitFor({ state: "visible" });
await page.keyboard.press("Escape");
await page.waitForURL("http://127.0.0.1:3000/");
console.log("PASS mobile landing has no horizontal overflow; login closes with Escape");
assert.deepEqual(exceptions, []);
console.log("PASS no uncaught browser exceptions in tested unauthenticated flows");
await browser.close();
