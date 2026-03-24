import { test, expect } from "@playwright/test";

test.describe("Body Weight Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/weight");
  });

  test("renders page with entry form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Log Weight" }),
    ).toBeVisible();
    await expect(page.locator("form")).toBeVisible();
  });

  test("form has date picker and weight input", async ({ page }) => {
    const dateInput = page.locator("#bw-date");
    await expect(dateInput).toBeVisible();
    await expect(dateInput).toHaveAttribute("type", "date");

    const weightInput = page.locator("#bw-weight");
    await expect(weightInput).toBeVisible();
    await expect(weightInput).toHaveAttribute("type", "number");
    await expect(weightInput).toHaveAttribute("placeholder", "e.g. 175.5");
  });

  test("form has save button", async ({ page }) => {
    const saveButton = page.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
  });

  test("history section renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "History" }),
    ).toBeVisible();
  });
});
