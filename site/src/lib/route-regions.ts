import type { Locale } from "@/lib/locale";

// ---------------------------------------------------------------------------
// Canonical default route regions for Guangdong.
//
// SINGLE SOURCE OF TRUTH → shared/route-regions.json
// This file re-exports from the shared JSON for site-side convenience.
// The API mirrors via api/src/common/constants/route-regions.ts.
// Migration files (1737225000000, 1740600000000) embed their own frozen
// copies for historical correctness and should NOT be changed.
// ---------------------------------------------------------------------------

import regionsData from "../../../shared/route-regions.json";

export type RouteRegion = {
  key: string;
  title: { zh: string; en: string };
  note: { zh: string; en: string };
  adcodes: number[];
};

export const DEFAULT_ROUTE_REGIONS: RouteRegion[] = regionsData as RouteRegion[];

export function pickRouteRegionText(
  value: { zh?: string; en?: string } | string | undefined,
  locale: Locale,
) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return locale === "zh"
    ? (value.zh ?? value.en ?? "")
    : (value.en ?? value.zh ?? "");
}

export function pickSecondaryRouteRegionText(
  value: { zh?: string; en?: string } | string | undefined,
  locale: Locale,
) {
  if (!value || typeof value === "string") return "";
  return locale === "zh"
    ? (value.en ?? "")
    : (value.zh ?? "");
}
