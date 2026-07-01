import { describe, expect, it } from 'vitest';
import { buildExpenseQueryString } from './expense-query';

describe('buildExpenseQueryString', () => {
  it('returns an empty string when no filters are set', () => {
    expect(buildExpenseQueryString({})).toBe('');
  });

  it('omits empty/undefined values', () => {
    expect(buildExpenseQueryString({ type: '', categoryId: undefined })).toBe(
      '',
    );
  });

  it('serializes all provided filters', () => {
    const query = buildExpenseQueryString({
      type: 'simple',
      categoryId: 'cat-1',
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
      sortBy: 'amount',
      sortOrder: 'asc',
      page: 2,
      limit: 10,
    });

    expect(query).toBe(
      '?type=simple&categoryId=cat-1&dateFrom=2026-01-01&dateTo=2026-01-31&sortBy=amount&sortOrder=asc&page=2&limit=10',
    );
  });
});
