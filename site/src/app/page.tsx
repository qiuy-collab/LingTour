/**
 * Home Page — Server Component
 *
 * Fetches all homepage data on the server during SSR/ISR so the user
 * sees real content on first paint, not a loading spinner.
 *
 * Data is passed to <HomeClient> which handles interactive features
 * (language switching, locale-based re-fetch).
 *
 * This fixes the "blank page on first visit" issue caused by the old
 * approach where the entire page was a Client Component that only
 * fetched data after client-side hydration.
 */

import { cookies } from "next/headers";
import type { Locale } from "@/lib/locale";
import {
  fetchHomeDataServer,
  fetchStoreProductsServer,
  fetchRoutesServerForHome,
  fetchEventsServer,
} from "@/lib/server-data";
import type { EventData } from "@/lib/api-data";
import HomeClient from "./HomeClient";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  // Read locale from cookie (set by middleware or client-side setLocale)
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("lingtour-locale")?.value;
  const locale: Locale = localeCookie === "zh" ? "zh" : "en";

  // Fetch all data server-side in parallel.
  // Each function uses Promise.allSettled internally, so partial failures
  // don't crash the page — missing data falls back to defaults.
  const [homeData, products, routes, events] = await Promise.all([
    fetchHomeDataServer(locale),
    fetchStoreProductsServer(locale),
    fetchRoutesServerForHome(locale),
    fetchEventsServer(locale),
  ]);

  return (
    <HomeClient
      initialHomeData={homeData}
      initialProducts={products}
      initialRoutes={routes}
      initialEvents={events}
    />
  );
}
