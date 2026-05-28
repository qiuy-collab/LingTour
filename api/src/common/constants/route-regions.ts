// ---------------------------------------------------------------------------
// Canonical default route regions for Guangdong.
//
// SINGLE SOURCE OF TRUTH → shared/route-regions.json
// This file re-exports from the shared JSON for API-side convenience.
// The site frontend mirrors via site/src/lib/route-regions.ts.
// Migration files (1737225000000, 1740600000000) embed their own frozen
// copies for historical correctness and should NOT be changed.
// ---------------------------------------------------------------------------

import regionsData from '../../../../shared/route-regions.json';

export interface RouteRegion {
  key: string;
  title: { zh: string; en: string };
  note: { zh: string; en: string };
  adcodes: number[];
}

export const DEFAULT_ROUTE_REGIONS: RouteRegion[] = regionsData as RouteRegion[];
