import { expect, test } from "@playwright/test";

test.describe("product landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("is public and explains the product", async ({ page }) => {
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", {
        name: "Know where your money goes—and what comes next.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "From daily spending to long-term plans",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Financial data deserves strong boundaries.",
      }),
    ).toBeVisible();
  });

  test("shows sanitized product previews", async ({ page }) => {
    await expect(
      page.getByRole("img", { name: /Dashboard preview/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Expense tracking preview/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Installment plan preview/ }),
    ).toBeVisible();
    await expect(
      page.getByText("No real customer data is used."),
    ).toBeVisible();
  });

  test("links visitors to sign in and registration", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "Sign in" }).first(),
    ).toHaveAttribute("href", "/login");
    await expect(
      page.getByRole("link", { name: "Create your free account" }),
    ).toHaveAttribute("href", "/register");
  });
});
