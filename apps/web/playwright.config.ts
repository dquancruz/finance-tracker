import { defineConfig, devices } from '@playwright/test';

/**
 * E2E smoke tests against a production build of the Next.js app
 * (`next build && next start`), started automatically by the `webServer`
 * block below. These tests intentionally avoid depending on a live API/DB —
 * they cover what's testable at the frontend/routing layer alone (auth
 * redirects, form accessibility, static PWA assets) so they can run in CI
 * without provisioning a backend. Full authenticated user-journey E2E tests
 * (login → create expense → see it on the dashboard) are a natural
 * follow-up once a seeded test backend/DB is available in CI.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['dot'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start -- -p 3100',
    url: 'http://127.0.0.1:3100/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: '3100',
      NEXTAUTH_URL: 'http://127.0.0.1:3100',
      // NextAuth v5 auto-trusts the request host on Vercel; anywhere else
      // (local `next start`, CI, Railway, etc.) it throws `UntrustedHost`
      // unless explicitly told to trust it. Safe here since this only runs
      // against a throwaway local test server, never a real deployment.
      AUTH_TRUST_HOST: 'true',
      NEXTAUTH_SECRET:
        process.env.NEXTAUTH_SECRET ?? 'e2e-test-secret-not-for-production-use',
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:39999',
      NEXT_PUBLIC_WS_URL:
        process.env.NEXT_PUBLIC_WS_URL ?? 'http://127.0.0.1:39999',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? 'e2e-test-client-id',
      GOOGLE_CLIENT_SECRET:
        process.env.GOOGLE_CLIENT_SECRET ?? 'e2e-test-client-secret',
    },
  },
});
