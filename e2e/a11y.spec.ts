import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Accessibility audits for key public pages, via axe-core. */
const PAGES = [
  { name: "splash", path: "/" },
  { name: "home", path: "/home" },
  { name: "search", path: "/search" },
  { name: "login", path: "/login" },
];

for (const { name, path } of PAGES) {
  test(`a11y: ${name} has no violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .disableRules(["color-contrast"]) // re-enable once design tokens are audited
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}
