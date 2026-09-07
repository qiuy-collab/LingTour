import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRouteBySlug, fetchCityBySlug } from "@/lib/api-data";
import { buildRouteGeometry } from "@/components/routes/route-map-geometry";
import { ApiRequestError } from "@/lib/api-client";

const get = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-client")>();
  return { ...actual, apiGet: get };
});

beforeEach(() => {
  // Returning the mock would register it as a Vitest cleanup hook.
  get.mockReset();
});

describe("API detail mapping", () => {
  it("does not invent zero coordinates for a partially located stop", async () => {
    get.mockResolvedValue({ slug: "route", title: "Route", cultureTag: "Coastal", cityName: "Zhanjiang", duration: "1 day", audience: "Travellers", summary: "", story: "", coverImage: "", stops: [
      { time: "08:00", stopName: "Lake", lat: null, lng: 110.277, isFeatured: true, image: "", details: [], story: "", culturalStory: "" },
      { time: "09:00", stopName: "Bay", lat: 21.2, lng: 110.4, isFeatured: false, image: "", details: [], story: "", culturalStory: "" },
    ] });
    const route = await fetchRouteBySlug("route");
    expect(route!.itinerary[0].lat).toBeNull();
    expect(route!.itinerary[0].isFeatured).toBe(true);
    expect(buildRouteGeometry(route!.itinerary)).toMatchObject({ missingCount: 1, segments: [] });
    expect(buildRouteGeometry(route!.itinerary).points.map(p => p.index)).toEqual([1]);
  });

  it("returns null only for a genuinely missing city", async () => {
    get.mockRejectedValue(new ApiRequestError({ statusCode: 404, message: "Not found" }));
    await expect(fetchCityBySlug("missing")).resolves.toBeNull();
    const failure = new ApiRequestError({ statusCode: 500, message: "Database unavailable" });
    get.mockRejectedValue(failure);
    await expect(fetchCityBySlug("city")).rejects.toBe(failure);
  });
});
