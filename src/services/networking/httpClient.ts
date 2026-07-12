import { PIRATE_BAY_DEFAULT_TIMEOUT_MS } from '@/constants/pirateBay';
import { ScraperError } from '@/services/scraper/scraperErrors';

export type FetchTextOptions = {
  timeoutMs?: number;
};

export type HttpClient = {
  get: (url: string, options?: FetchTextOptions) => Promise<string>;
  getJson?: (url: string, options?: FetchTextOptions) => Promise<unknown>;
};

function mapHttpStatus(status: number): ScraperError {
  if (status === 403) {
    return new ScraperError({
      code: 'forbidden',
      message: 'The provider rejected the request.',
      status,
    });
  }

  if (status === 429) {
    return new ScraperError({
      code: 'rate_limited',
      message: 'The provider rate limited the request.',
      retryable: true,
      status,
    });
  }

  if (status >= 500) {
    return new ScraperError({
      code: 'provider_unavailable',
      message: 'The provider is currently unavailable.',
      retryable: true,
      status,
    });
  }

  return new ScraperError({
    code: 'http_error',
    message: `The provider returned HTTP ${status}.`,
    status,
  });
}

export async function fetchText(
  url: string,
  options: FetchTextOptions = {},
): Promise<string> {
  const timeoutMs = options.timeoutMs ?? PIRATE_BAY_DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw mapHttpStatus(response.status);
    }

    const contentType = response.headers.get('content-type');

    if (
      contentType &&
      !/\b(text\/html|application\/xhtml\+xml|text\/plain)\b/i.test(contentType)
    ) {
      throw new ScraperError({
        code: 'invalid_html',
        message: 'The provider returned a non-HTML response.',
      });
    }

    const text = await response.text();

    if (!text.trim()) {
      throw new ScraperError({
        code: 'invalid_html',
        message: 'The provider returned an empty response.',
        retryable: true,
      });
    }

    return text;
  } catch (error) {
    if (error instanceof ScraperError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ScraperError({
        code: 'timeout',
        message: 'The provider request timed out.',
        retryable: true,
        cause: error,
      });
    }

    throw new ScraperError({
      code: 'provider_unavailable',
      message: 'The provider request failed.',
      retryable: true,
      cause: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchJson<T = unknown>(
  url: string,
  options: FetchTextOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? PIRATE_BAY_DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json,text/plain;q=0.9,*/*;q=0.1',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw mapHttpStatus(response.status);
    }

    const contentType = response.headers.get('content-type');

    if (
      contentType &&
      !/\b(application\/json|text\/plain)\b/i.test(contentType)
    ) {
      throw new ScraperError({
        code: 'parse_failed',
        message: 'The provider returned a non-JSON response.',
      });
    }

    const text = await response.text();

    if (!text.trim()) {
      throw new ScraperError({
        code: 'parse_failed',
        message: 'The provider returned an empty JSON response.',
        retryable: true,
      });
    }

    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof ScraperError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ScraperError({
        code: 'timeout',
        message: 'The provider request timed out.',
        retryable: true,
        cause: error,
      });
    }

    if (error instanceof SyntaxError) {
      throw new ScraperError({
        code: 'parse_failed',
        message: 'Failed to parse provider JSON.',
        cause: error,
      });
    }

    throw new ScraperError({
      code: 'provider_unavailable',
      message: 'The provider request failed.',
      retryable: true,
      cause: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const defaultHttpClient: HttpClient = {
  get: fetchText,
  getJson: fetchJson,
};
