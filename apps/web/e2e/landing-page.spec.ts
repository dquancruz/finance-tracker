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

  test("keeps the landing page public and opens login", async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/);
    await page.getByRole("link", { name: "Sign in" }).first().click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});

test.describe("landing page security headers", () => {
  test("serves browser security headers", async ({ request }) => {
    const response = await request.get("/");

    expect(response.headers()["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response.headers()["x-frame-options"]).toBe("DENY");
    expect(response.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers()["content-security-policy"]).toMatch(
      /connect-src[^;]*(ws:|wss:)/,
    );
    const scriptSrc = response
      .headers()
      ["content-security-policy"]?.match(/script-src[^;]*/)?.[0];
    expect(scriptSrc).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  test("does not report CSP script violations on the landing page", async ({
    page,
  }) => {
    const cspErrors: string[] = [];
    page.on("console", (msg) => {
      if (
        msg.type() === "error" &&
        /content security policy/i.test(msg.text())
      ) {
        cspErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Know where your money goes—and what comes next.",
      }),
    ).toBeVisible();
    expect(cspErrors).toEqual([]);
  });
});
