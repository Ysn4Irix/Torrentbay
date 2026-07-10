import { describe, expect, test } from 'bun:test';

import { mapScraperError } from '@/features/search/utils/mapScraperError';
import { ScraperError } from '@/services/scraper/scraperErrors';

describe('mapScraperError', () => {
  test('maps retryable provider states to user-facing states', () => {
    expect(
      mapScraperError(
        new ScraperError({
          code: 'timeout',
          message: 'Timed out',
          retryable: true,
        }),
      ),
    ).toMatchObject({ kind: 'timeout', retryable: true });

    expect(
      mapScraperError(
        new ScraperError({
          code: 'rate_limited',
          message: 'Too many',
          retryable: true,
        }),
      ),
    ).toMatchObject({ kind: 'rate_limited', retryable: true });
  });

  test('distinguishes wrapped network failures from provider outages', () => {
    expect(
      mapScraperError(
        new ScraperError({
          code: 'provider_unavailable',
          message: 'Failed',
          retryable: true,
          cause: new TypeError('Network request failed'),
        }),
      ),
    ).toMatchObject({ kind: 'network', title: 'You appear offline' });

    expect(
      mapScraperError(
        new ScraperError({
          code: 'provider_unavailable',
          message: 'Down',
          retryable: true,
        }),
      ),
    ).toMatchObject({ kind: 'provider_unavailable' });
  });

  test('maps parser drift and unknown errors', () => {
    expect(
      mapScraperError(
        new ScraperError({
          code: 'layout_changed',
          message: 'Changed',
        }),
      ),
    ).toMatchObject({ kind: 'layout_changed' });

    expect(mapScraperError(new Error('Unknown'))).toMatchObject({
      kind: 'unknown',
    });
  });
});
