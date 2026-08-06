import { expect, test } from '@playwright/test';

test.describe('PWA installability assets', () => {
  test('serves a valid web app manifest', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.ok()).toBeTruthy();

    const manifest = (await response.json()) as {
      name: string;
      display: string;
      icons: Array<{ src: string; sizes: string }>;
    };
    expect(manifest.name).toBe('Finance Tracker');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('serves the generated 192 and 512 PNG icons referenced by the manifest', async ({
    request,
  }) => {
    const icon192 = await request.get('/icons/icon-192.png');
    expect(icon192.ok()).toBeTruthy();
    expect(icon192.headers()['content-type']).toContain('image/png');

    const icon512 = await request.get('/icons/icon-512.png');
    expect(icon512.ok()).toBeTruthy();
    expect(icon512.headers()['content-type']).toContain('image/png');
  });

  test('serves the offline fallback page and service worker', async ({
    request,
  }) => {
    const offline = await request.get('/offline.html');
    expect(offline.ok()).toBeTruthy();
    expect(await offline.text()).toContain("You're offline");

    const sw = await request.get('/sw.js');
    expect(sw.ok()).toBeTruthy();
  });

  test('the login page links the manifest and includes theme-color meta tags for light and dark', async ({
    page,
  }) => {
    await page.goto('/login');

    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      'href',
      '/manifest.webmanifest',
    );

    // theme-color varies by color scheme (see apps/web/src/app/layout.tsx's
    // `viewport.themeColor`), so it renders as two media-conditioned meta
    // tags rather than a single static one.
    await expect(
      page.locator('meta[name="theme-color"][media="(prefers-color-scheme: light)"]'),
    ).toHaveAttribute('content', '#fafafa');
    await expect(
      page.locator('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]'),
    ).toHaveAttribute('content', '#09090b');
  });
});
