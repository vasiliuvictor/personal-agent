import { BraveSearchResult, SearchFrequency } from '../types';

const BRAVE_BASE = 'https://api.search.brave.com/res/v1/web/search';

async function fetchBrave(
  query: string,
  count: number,
  offset: number
): Promise<BraveSearchResult[]> {
  const params = new URLSearchParams({
    q:      query,
    count:  String(count),
    offset: String(offset),
  });

  const response = await fetch(`${BRAVE_BASE}?${params}`, {
    headers: {
      'Accept':               'application/json',
      'Accept-Encoding':      'gzip',
      'X-Subscription-Token': process.env['BRAVE_API_KEY']!,
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Brave API error: ${response.status} ${response.statusText}${body ? ` — ${body}` : ''}`);
  }

  const data = await response.json() as { web?: { results?: Record<string, unknown>[] } };
  return (data?.web?.results ?? []).slice(0, count).map((r) => ({
    title:       (r['title'] as string)       ?? '',
    url:         (r['url'] as string)         ?? '',
    description: (r['description'] as string) ?? '',
  }));
}

export async function searchBrave(
  query: string,
  _frequency: SearchFrequency,  // reserved for future use
  count = 20
): Promise<BraveSearchResult[]> {
  // Use a random offset to vary results across runs.
  // Fall back to offset 0 if the offset page returned nothing.
  const randomOffset = [0, 5, 10][Math.floor(Math.random() * 3)];

  if (randomOffset > 0) {
    try {
      const results = await fetchBrave(query, count, randomOffset);
      if (results.length >= 5) return results;
      console.log(`[brave] Only ${results.length} results at offset=${randomOffset}, retrying at offset=0`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`[brave] offset=${randomOffset} failed (${message}), retrying at offset=0`);
    }
  }

  return fetchBrave(query, count, 0);
}
