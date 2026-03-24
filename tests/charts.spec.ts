import { test, expect } from "@playwright/test";

test.describe("Charts Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/charts");
  });

  test("renders page heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Charts" }),
    ).toBeVisible();
  });

  test("exercise selector is visible with default placeholder", async ({
    page,
  }) => {
    const select = page.locator("#exercise-select");
    await expect(select).toBeVisible();
    await expect(select).toContainText("Select an exercise");
  });

  test("exercise selector has a label", async ({ page }) => {
    await expect(page.getByText("Exercise", { exact: true })).toBeVisible();
  });

  test("shows empty state when no exercise is selected", async ({ page }) => {
    await expect(
      page.getByText("Select an exercise to view progression"),
    ).toBeVisible();
  });

  test("bottom tab bar shows Charts tab as active", async ({ page }) => {
    const chartsTab = page.getByRole("link", { name: "Charts" });
    await expect(chartsTab).toBeVisible();
    await expect(chartsTab).toHaveClass(/text-indigo/);
  });

  test("can navigate to Weight page via bottom tab", async ({ page }) => {
    await page.getByRole("link", { name: "Weight" }).click();
    await expect(page).toHaveURL(/\/weight/);
  });

  test("can navigate back to Charts page via bottom tab", async ({ page }) => {
    await page.getByRole("link", { name: "Weight" }).click();
    await expect(page).toHaveURL(/\/weight/);

    await page.getByRole("link", { name: "Charts" }).click();
    await expect(page).toHaveURL(/\/charts/);
    await expect(
      page.getByRole("heading", { name: "Charts" }),
    ).toBeVisible();
  });
});
