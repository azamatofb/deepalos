import { test, expect } from "@playwright/test";

test("loads the auto display shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Auto Display")).toBeVisible();
  await expect(page.getByText("YouTube")).toBeVisible();
  await expect(page.getByText("Yandex Map")).toBeVisible();
});
