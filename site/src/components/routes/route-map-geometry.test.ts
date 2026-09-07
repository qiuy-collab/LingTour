import { describe, expect, it } from "vitest";
import { buildRouteGeometry, validRouteCoordinates, type RouteMapStop } from "./route-map-geometry";

function stop(lat: number | null, lng: number | null): RouteMapStop {
  return { time: "09:00", stop: "Test location", lat, lng };
}

describe("validRouteCoordinates", () => {
  it.each([
    [null, 113], [23, null], [NaN, 113], [23, NaN],
    [Infinity, 113], [23, -Infinity], [90.01, 113], [-90.01, 113],
    [23, 180.01], [23, -180.01], [0, 0],
  ])("rejects unavailable or invalid latitude %s / longitude %s", (lat, lng) => {
    expect(validRouteCoordinates(stop(lat, lng))).toBeNull();
  });

  it("does not coerce legacy string coordinates", () => {
    expect(validRouteCoordinates({ lat: "23" as unknown as number, lng: 113 })).toBeNull();
  });

  it("keeps valid axis and boundary coordinates, in longitude-first order", () => {
    expect(validRouteCoordinates(stop(0, 113))).toEqual([113, 0]);
    expect(validRouteCoordinates(stop(23, 0))).toEqual([0, 23]);
    expect(validRouteCoordinates(stop(90, -180))).toEqual([-180, 90]);
    expect(validRouteCoordinates(stop(-90, 180))).toEqual([180, -90]);
  });
});

describe("buildRouteGeometry", () => {
  it("preserves original stop numbers and leaves missing legs disconnected", () => {
    const result = buildRouteGeometry([
      stop(null, null), stop(23, 113), stop(24, 114), stop(0, 0),
      stop(25, 115), stop(26, 116), stop(NaN, 117), stop(27, 118),
    ]);
    expect(result.points.map((point) => point.index + 1)).toEqual([2, 3, 5, 6, 8]);
    expect(result.segments).toEqual([
      [[113, 23], [114, 24]], [[115, 25], [116, 26]],
    ]);
    expect(result.missingCount).toBe(3);
  });

  it("keeps lone locations but never emits one-point lines", () => {
    const result = buildRouteGeometry([stop(23, 113), stop(null, 114), stop(25, 115)]);
    expect(result.points).toHaveLength(2);
    expect(result.segments).toEqual([]);
  });

  it("handles empty, entirely missing and repeated locations", () => {
    expect(buildRouteGeometry([])).toEqual({ points: [], segments: [], missingCount: 0 });
    expect(buildRouteGeometry([stop(null, null)])).toEqual({ points: [], segments: [], missingCount: 1 });
    expect(buildRouteGeometry([stop(23, 113), stop(23, 113)]).points).toHaveLength(2);
  });

  it("retains text and order without mutating the itinerary", () => {
    const stops = Object.freeze([
      Object.freeze({ time: "10:00", stop: "Market", lat: 23, lng: 113 }),
      Object.freeze({ time: "12:00", stop: "Museum", lat: 22, lng: 112 }),
    ]);
    const result = buildRouteGeometry(stops);
    expect(result.points[0]).toEqual({ index: 0, time: "10:00", stop: "Market", coordinates: [113, 23] });
    expect(result.segments).toEqual([[[113, 23], [112, 22]]]);
  });
});
