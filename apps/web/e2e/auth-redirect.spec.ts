import { expect, test } from "@playwright/test";

test.describe("route protection", () => {
  test("redirects an unauthenticated visitor from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login(\?|$)/);
    // middleware.ts sets callbackUrl so the user lands back where they
    // started once they've signed in.
    await expect(page).toHaveURL(/callbackUrl=%2Fdashboard/);
  });

  test("redirects an unauthenticated visitor from a nested route to /login", async ({
    page,
  }) => {
    await page.goto("/expenses");

    await expect(page).toHaveURL(/\/login\?/);
    await expect(page).toHaveURL(/callbackUrl=%2Fexpenses/);
  });

  test("does not redirect away from the public /login and /register pages", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/register");
    await expect(page).toHaveURL(/\/register$/);
  });
});
