import { expect, test } from '@playwright/test';

test.describe('register page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('has an accessible, labeled registration form', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Create an account' }),
    ).toBeVisible();

    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toHaveAttribute(
      'type',
      'password',
    );
  });

  test('shows client-side validation errors without hitting the network', async ({
    page,
  }) => {
    // Fill with values that are individually invalid so `validate()` in
    // register/page.tsx short-circuits before any fetch to the API — this
    // assertion holds regardless of whether a backend is running.
    await page.getByLabel('Full name').fill('J');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password').fill('short');

    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(
      page.getByText('Name must be at least 2 characters.'),
    ).toBeVisible();
    await expect(
      page.getByText('Please enter a valid email address.'),
    ).toBeVisible();
    await expect(
      page.getByText('Password must be at least 8 characters.'),
    ).toBeVisible();
  });

  test('links to the login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
