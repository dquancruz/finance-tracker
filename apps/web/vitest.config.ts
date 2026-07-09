import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // `e2e/` holds Playwright specs (see playwright.config.ts) — they import
    // from '@playwright/test', not vitest, and must not be picked up here.
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
