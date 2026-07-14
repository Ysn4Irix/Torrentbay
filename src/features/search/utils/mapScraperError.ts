import {
  ScraperError,
  ScraperErrorCode,
  toScraperError,
} from '@/services/scraper/scraperErrors';

export type SearchErrorKind =
  | 'timeout'
  | 'provider_unavailable'
  | 'rate_limited'
  | 'network'
  | 'layout_changed'
  | 'unknown';

export type SearchErrorState = {
  kind: SearchErrorKind;
  title: string;
  message: string;
  retryable: boolean;
};

function isNetworkCause(error: ScraperError): boolean {
  const cause = (error as Error & { cause?: unknown }).cause;

  return cause instanceof TypeError;
}

function mapKnownCode(
  code: ScraperErrorCode,
  retryable: boolean,
): SearchErrorState {
  switch (code) {
    case 'timeout':
      return {
        kind: 'timeout',
        title: 'Search timed out',
        message:
          'The provider took too long to respond. Try again in a moment.',
        retryable: true,
      };
    case 'provider_unavailable':
      return {
        kind: 'provider_unavailable',
        title: 'Provider unavailable',
        message:
          'The external search provider did not respond. Your query has been preserved.',
        retryable: true,
      };
    case 'rate_limited':
      return {
        kind: 'rate_limited',
        title: 'Too many searches',
        message:
          'The provider is rate limiting requests. Wait a bit, then retry.',
        retryable: true,
      };
    case 'layout_changed':
    case 'invalid_html':
    case 'parse_failed':
      return {
        kind: 'layout_changed',
        title: 'Results could not be read',
        message: 'The provider response could not be read. Try again later.',
        retryable: true,
      };
    default:
      return {
        kind: 'unknown',
        title: 'Search failed',
        message: 'Something went wrong while searching. Please try again.',
        retryable,
      };
  }
}

export function mapScraperError(error: unknown): SearchErrorState {
  const scraperError = toScraperError(error);

  if (
    scraperError.code === 'provider_unavailable' &&
    isNetworkCause(scraperError)
  ) {
    return {
      kind: 'network',
      title: 'You’re offline',
      message:
        'Reconnect to search the provider. Saved favorites and history are still available.',
      retryable: true,
    };
  }

  return mapKnownCode(scraperError.code, scraperError.retryable);
}
