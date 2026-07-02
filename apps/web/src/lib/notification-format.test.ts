import { describe, expect, it } from 'vitest';
import {
  formatRelativeTime,
  formatUnreadBadge,
  notificationTone,
  notificationToneBadgeClass,
} from './notification-format';

describe('formatRelativeTime', () => {
  const now = new Date('2026-01-15T12:00:00.000Z');

  it('returns "Just now" for sub-minute differences', () => {
    expect(
      formatRelativeTime(new Date('2026-01-15T11:59:30.000Z'), now),
    ).toBe('Just now');
  });

  it('formats minutes ago', () => {
    expect(
      formatRelativeTime(new Date('2026-01-15T11:45:00.000Z'), now),
    ).toBe('15m ago');
  });

  it('formats hours ago', () => {
    expect(
      formatRelativeTime(new Date('2026-01-15T09:00:00.000Z'), now),
    ).toBe('3h ago');
  });

  it('formats days ago', () => {
    expect(
      formatRelativeTime(new Date('2026-01-12T12:00:00.000Z'), now),
    ).toBe('3d ago');
  });

  it('accepts an ISO date string', () => {
    expect(formatRelativeTime('2026-01-15T11:00:00.000Z', now)).toBe(
      '1h ago',
    );
  });
});

describe('formatUnreadBadge', () => {
  it('returns an empty string for zero or negative counts', () => {
    expect(formatUnreadBadge(0)).toBe('');
    expect(formatUnreadBadge(-1)).toBe('');
  });

  it('returns the exact count under 10', () => {
    expect(formatUnreadBadge(5)).toBe('5');
    expect(formatUnreadBadge(9)).toBe('9');
  });

  it('caps at "9+" for double digits', () => {
    expect(formatUnreadBadge(10)).toBe('9+');
    expect(formatUnreadBadge(42)).toBe('9+');
  });
});

describe('notificationTone / notificationToneBadgeClass', () => {
  it('maps each notification type to a distinct tone', () => {
    expect(notificationTone('budget_overrun')).toBe('alert');
    expect(notificationTone('payment_due')).toBe('warning');
    expect(notificationTone('system')).toBe('info');
  });

  it('returns a distinct badge class per tone', () => {
    const tones = ['alert', 'warning', 'info'] as const;
    const classes = new Set(tones.map(notificationToneBadgeClass));
    expect(classes.size).toBe(3);
  });
});
