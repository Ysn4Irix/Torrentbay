import { useEffect } from 'react';

import { useSearchStore } from '@/store/searchStore';

export function useInstantTorrentSearch(
  query: string,
  enabled = true,
  delayMs = 450,
) {
  const runSearch = useSearchStore((state) => state.search);
  const invalidateActiveRequest = useSearchStore(
    (state) => state.invalidateActiveRequest,
  );

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!enabled || trimmedQuery.length < 2) {
      invalidateActiveRequest();
      return;
    }

    const timeoutId = setTimeout(() => {
      void runSearch({ query: trimmedQuery, page: 1, commit: false });
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [delayMs, enabled, invalidateActiveRequest, query, runSearch]);
}
