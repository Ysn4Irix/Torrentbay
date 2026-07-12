import { afterEach, describe, expect, test } from 'bun:test';

import { fetchJson, fetchText } from '@/services/networking/httpClient';
import { ScraperError } from '@/services/scraper/scraperErrors';

const originalFetch = globalThis.fetch;

type FetchHandler = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

function mockFetch(handler: FetchHandler) {
  globalThis.fetch = handler as unknown as typeof fetch;
}

async function expectScraperCode(
  promise: Promise<unknown>,
  code: ScraperError['code'],
) {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(ScraperError);
    expect((error as ScraperError).code).toBe(code);
    return error as ScraperError;
  }

  throw new Error(`Expected scraper error code ${code}`);
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('fetchText', () => {
  test('returns HTML text from fetch without executing JavaScript', async () => {
    mockFetch(
      async () =>
        new Response('<html><script>ignored()</script></html>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
        }),
    );

    await expect(
      fetchText('https://thepiratebay.org/search/test/0/99/0'),
    ).resolves.toBe('<html><script>ignored()</script></html>');
  });

  test('maps HTTP status codes to typed scraper errors', async () => {
    mockFetch(async () => new Response('too many', { status: 429 }));

    const error = await expectScraperCode(
      fetchText('https://thepiratebay.org/search/test/0/99/0'),
      'rate_limited',
    );

    expect(error.retryable).toBe(true);
    expect(error.status).toBe(429);
  });

  test('rejects empty and non-HTML responses', async () => {
    mockFetch(async () => new Response('   '));
    await expectScraperCode(
      fetchText('https://thepiratebay.org/search/test/0/99/0'),
      'invalid_html',
    );

    mockFetch(
      async () =>
        new Response('{"ok":true}', {
          headers: { 'content-type': 'application/json' },
        }),
    );
    await expectScraperCode(
      fetchText('https://thepiratebay.org/search/test/0/99/0'),
      'invalid_html',
    );
  });

  test('maps aborted requests to timeout errors', async () => {
    mockFetch(
      (_, init) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    );

    const error = await expectScraperCode(
      fetchText('https://thepiratebay.org/search/test/0/99/0', {
        timeoutMs: 1,
      }),
      'timeout',
    );

    expect(error.retryable).toBe(true);
  });
});

describe('fetchJson', () => {
  test('returns parsed JSON from fetch', async () => {
    mockFetch(
      async () =>
        new Response('[{"id":"1"}]', {
          headers: { 'content-type': 'application/json; charset=utf-8' },
        }),
    );

    await expect(
      fetchJson('https://apibay.org/q.php?q=test&cat=0'),
    ).resolves.toEqual([{ id: '1' }]);
  });

  test('maps HTTP and JSON parse failures to typed scraper errors', async () => {
    mockFetch(async () => new Response('forbidden', { status: 403 }));
    await expectScraperCode(
      fetchJson('https://apibay.org/q.php?q=test&cat=0'),
      'forbidden',
    );

    mockFetch(
      async () =>
        new Response('{bad json', {
          headers: { 'content-type': 'application/json' },
        }),
    );
    await expectScraperCode(
      fetchJson('https://apibay.org/q.php?q=test&cat=0'),
      'parse_failed',
    );
  });
});
