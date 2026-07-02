import { describe, expect, it } from 'vitest';
import {
  hasPushPermission,
  requestPushPermission,
  showPushNotification,
} from './push-notifications';

// This suite runs in vitest's default (non-DOM) node environment, so
// `window`/`Notification` are unavailable — exercising the SSR/unsupported
// fallback paths that matter most (the app is also SSR-rendered by Next.js).

describe('requestPushPermission', () => {
  it('resolves to "denied" when Notification is unavailable', async () => {
    await expect(requestPushPermission()).resolves.toBe('denied');
  });
});

describe('hasPushPermission', () => {
  it('returns false when Notification is unavailable', () => {
    expect(hasPushPermission()).toBe(false);
  });
});

describe('showPushNotification', () => {
  it('no-ops silently when Notification is unavailable', () => {
    expect(() => showPushNotification('Title', 'Body')).not.toThrow();
  });
});
