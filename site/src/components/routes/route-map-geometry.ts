export type RouteMapStop = {
  time: string;
  stop: string;
  lat: number | null;
  lng: number | null;
};

export type RouteMapPoint = {
  /** Original zero-based itinerary index, never renumbered after filtering. */
  index: number;
  time: string;
  stop: string;
  coordinates: [number, number];
};

export function validRouteCoordinates(
  stop: Pick<RouteMapStop, "lat" | "lng">,
): [number, number] | null {
  const { lat, lng } = stop;
  if (
    typeof lat !== "number" || typeof lng !== "number" ||
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    Math.abs(lat) > 90 || Math.abs(lng) > 180 ||
    (lat === 0 && lng === 0)
  ) return null;
  return [lng, lat];
}

/** Geographical order only: these straight lines are not roads or directions. */
export function buildRouteGeometry(stops: readonly RouteMapStop[]) {
  const points: RouteMapPoint[] = [];
  const segments: [number, number][][] = [];
  let segment: [number, number][] = [];

  const endSegment = () => {
    if (segment.length > 1) segments.push(segment);
    segment = [];
  };

  stops.forEach((stop, index) => {
    const coordinates = validRouteCoordinates(stop);
    if (!coordinates) {
      // An unknown location is a genuine gap, never a shortcut to the next stop.
      endSegment();
      return;
    }
    points.push({ index, time: stop.time, stop: stop.stop, coordinates });
    segment.push(coordinates);
  });
  endSegment();

  return { points, segments, missingCount: stops.length - points.length };
}
