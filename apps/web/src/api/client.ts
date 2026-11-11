import type { ApiErrorBody } from '@syvra/shared';

// Public base URL of the API (no trailing slash). Set VITE_API_URL in production.
const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

// Every failed request becomes an ApiError, so callers handle one kind of error.
export class ApiError extends Error {
  constructor(
    public readonly status: number, // HTTP status, or 0 when the server could not be reached
    public readonly code: string, // e.g. 'VALIDATION_ERROR', 'EXERCISE_IN_USE'
    message: string,
    public readonly details?: ApiErrorBody['error']['details'],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  // Query string values; undefined ones are left out.
  query?: Record<string, string | undefined>;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${BASE_URL}/api${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server');
  }

  if (response.status === 204) return undefined as T;

  // The body may not be JSON (e.g. a gateway error page), so parsing can fail.
  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const error = (body as Partial<ApiErrorBody> | undefined)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? `Request failed (${response.status})`,
      error?.details,
    );
  }
  return body as T;
}
