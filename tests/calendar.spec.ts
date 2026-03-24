import { test, expect } from "@playwright/test";

test.describe("Calendar Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calendar");
  });

  test("renders month grid with weekday headers", async ({ page }) => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (const day of weekdays) {
      await expect(page.getByText(day, { exact: true }).first()).toBeVisible();
    }

    // Calendar grid has day buttons (at least 28 for any month)
    const dayButtons = page.locator("button").filter({ hasText: /^\d{1,2}$/ });
    await expect(dayButtons.first()).toBeVisible();
    expect(await dayButtons.count()).toBeGreaterThanOrEqual(28);
  });

  test("displays current month and year in header", async ({ page }) => {
    const now = new Date();
    const monthYear = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    await expect(
      page.getByRole("heading", { name: monthYear }),
    ).toBeVisible();
  });

  test("navigates to previous month", async ({ page }) => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const expectedHeader = prevMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    await page.getByRole("button", { name: "Previous month" }).click();
    await expect(
      page.getByRole("heading", { name: expectedHeader }),
    ).toBeVisible();
  });

  test("navigates to next month", async ({ page }) => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const expectedHeader = nextMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    await page.getByRole("button", { name: "Next month" }).click();
    await expect(
      page.getByRole("heading", { name: expectedHeader }),
    ).toBeVisible();
  });

  test("navigates forward and back returns to current month", async ({
    page,
  }) => {
    const now = new Date();
    const currentHeader = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    await page.getByRole("button", { name: "Next month" }).click();
    await page.getByRole("button", { name: "Previous month" }).click();
    await expect(
      page.getByRole("heading", { name: currentHeader }),
    ).toBeVisible();
  });

  test("today is highlighted with indigo styling", async ({ page }) => {
    const today = new Date().getDate().toString();

    // Today's button has indigo styling (either selected or today highlight)
    const todayButton = page
      .locator("button")
      .filter({ hasText: new RegExp(`^${today}$`) })
      .filter({ has: page.locator("span.text-sm") })
      .first();
    await expect(todayButton).toBeVisible();

    const classes = await todayButton.getAttribute("class");
    expect(classes).toMatch(/indigo/);
  });

  test("clicking a date selects it with active background", async ({
    page,
  }) => {
    // Click day 15 of the current month
    const dayButton = page
      .locator("button")
      .filter({ hasText: /^15$/ })
      .first();
    await dayButton.click();

    const classes = await dayButton.getAttribute("class");
    expect(classes).toContain("bg-indigo-600");
  });

  test("selected date shows detail panel with formatted date", async ({
    page,
  }) => {
    await page
      .locator("button")
      .filter({ hasText: /^15$/ })
      .first()
      .click();

    // Detail panel heading contains the day number
    const detailHeading = page.locator("h3").filter({ hasText: /15/ });
    await expect(detailHeading).toBeVisible();
  });

  test("detail panel shows no-workout state for empty date", async ({
    page,
  }) => {
    // Today is selected by default; with no backend the detail shows empty state
    await expect(page.getByText("No workout logged")).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("button", { name: "Start a workout" }),
    ).toBeVisible();
  });
});
