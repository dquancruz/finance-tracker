/**
 * Typed fetch wrapper for the finance-tracker API.
 * Prepends NEXT_PUBLIC_API_URL, adds Bearer token, throws ApiError on non-2xx.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ErrorResponseBody {
  message?: string;
  error?: string;
}

function isErrorResponseBody(value: unknown): value is ErrorResponseBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('message' in value || 'error' in value)
  );
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const url = `${baseUrl}${path}`;

  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body: unknown = await response.json();
      if (isErrorResponseBody(body)) {
        message = body.message ?? body.error ?? message;
      }
    } catch {
      // body could not be parsed as JSON — keep default message
    }
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}
