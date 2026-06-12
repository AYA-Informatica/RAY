import { test, expect } from "@playwright/test";

/** Visual regression snapshots for key pages. Run with --update-snapshots to set baselines. */
const PAGES = [
  { name: "splash", path: "/" },
  { name: "home", path: "/home" },
  { name: "search", path: "/search" },
  { name: "login", path: "/login" },
];

for (const { name, path } of PAGES) {
  test(`visual: ${name}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, animations: "disabled" });
  });
}
