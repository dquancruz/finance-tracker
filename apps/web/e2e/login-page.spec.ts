import { expect, test } from '@playwright/test';

test.describe('login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('has an accessible, labeled credentials form', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Sign in' }),
    ).toBeVisible();

    const email = page.getByLabel('Email');
    const password = page.getByLabel('Password');
    await expect(email).toBeVisible();
    await expect(password).toHaveAttribute('type', 'password');

    await expect(
      page.getByRole('button', { name: 'Sign in', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sign in with Google' }),
    ).toBeVisible();
  });

  test('links to the register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Create one' }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
