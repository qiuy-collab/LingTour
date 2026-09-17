/**
 * Clamp untrusted page/limit inputs (query strings) into safe values.
 * Public list endpoints feed these straight into `skip`/`take`: a NaN or
 * negative page makes Postgres throw (500), and a huge limit serialises
 * the whole table (report P2-F).
 */
export function clampPagination(
  page: unknown,
  limit: unknown,
  fallbackLimit = 20,
  maxLimit = 50,
): { page: number; limit: number; skip: number } {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const safePage =
    Number.isFinite(parsedPage) && parsedPage >= 1
      ? Math.floor(parsedPage)
      : 1;
  const safeLimit =
    Number.isFinite(parsedLimit) && parsedLimit >= 1
      ? Math.min(Math.floor(parsedLimit), maxLimit)
      : fallbackLimit;
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}
