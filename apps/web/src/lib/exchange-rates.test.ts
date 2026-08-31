import { describe, expect, it, vi, afterEach } from 'vitest';
import { FALLBACK_EXCHANGE_RATES, fetchExchangeRates } from './exchange-rates';

vi.mock('./api-client', () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from './api-client';

describe('fetchExchangeRates', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns fallback rates when the API request fails', async () => {
    vi.mocked(apiClient).mockRejectedValue(new Error('network error'));

    await expect(fetchExchangeRates('token')).resolves.toEqual({
      ...FALLBACK_EXCHANGE_RATES,
    });
  });

  it('returns live rates when the API succeeds', async () => {
    vi.mocked(apiClient).mockResolvedValue({ USD: 1, GTQ: 7.63, EUR: 0.86 });

    const rates = await fetchExchangeRates('token');
    expect(rates.GTQ).toBe(7.63);
    expect(apiClient).toHaveBeenCalledWith('/exchange-rates', undefined, 'token');
  });
});
