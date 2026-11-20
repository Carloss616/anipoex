/**
 * Whether the list was last fetched `minutes` or more ago. A time ahead of
 * now (a clock set back) counts as stale, or the list would wait for it.
 */
export const isListStale = (
  refreshedAt: number | undefined,
  minutes: number,
  now: number,
) =>
  refreshedAt === undefined ||
  refreshedAt > now ||
  now - refreshedAt >= minutes * 60_000;
