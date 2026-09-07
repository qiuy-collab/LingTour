"use client";

import { useEffect } from "react";
import { LngLatBounds } from "maplibre-gl";
import { Map, MapMarker, MapRoute, MarkerContent, useMap } from "@/components/mapcn/map";
import type { buildRouteGeometry } from "./route-map-geometry";

type Geometry = ReturnType<typeof buildRouteGeometry>;

type Props = {
  geometry: Geometry;
  routeTitle: string;
  onReady: () => void;
  onError: () => void;
};

function RouteOverview({ points, routeTitle }: { points: Geometry["points"]; routeTitle: string }) {
  const { map } = useMap();

  useEffect(() => {
    if (!map || !points.length) return;
    const canvas = map.getCanvas();
    canvas.setAttribute("aria-label", `Schematic route map for ${routeTitle}`);
    canvas.setAttribute("tabindex", "-1");
    const fit = () => {
      const bounds = new LngLatBounds();
      points.forEach((point) => bounds.extend(point.coordinates));
      map.resize();
      map.fitBounds(bounds, {
        padding: 42,
        maxZoom: 12,
        bearing: 0,
        pitch: 0,
        duration: 0,
        animate: false,
      });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, points, routeTitle]);

  return null;
}

export default function RouteMapCanvas({ geometry, routeTitle, onReady, onError }: Props) {
  return (
    <Map
      center={geometry.points[0].coordinates}
      zoom={8}
      interactive={false}
      scrollZoom={false}
      dragRotate={false}
      touchZoomRotate={false}
      pitchWithRotate={false}
      bearing={0}
      pitch={0}
      fadeDuration={0}
      onReady={onReady}
      onError={onError}
    >
      <RouteOverview points={geometry.points} routeTitle={routeTitle} />
      {geometry.segments.map((coordinates, index) => (
        <MapRoute key={index} coordinates={coordinates} dashArray={[3, 3]} />
      ))}
      {geometry.points.map((point) => {
        const label = `Stop ${point.index + 1}: ${point.stop}${point.time ? `, ${point.time}` : ""}`;
        return (
          <MapMarker key={point.index} longitude={point.coordinates[0]} latitude={point.coordinates[1]} anchor="center">
            <MarkerContent>
              <span
                role="img"
                aria-label={label}
                title={label}
                className="grid h-8 min-w-8 cursor-default place-items-center border-2 border-[var(--paper)] bg-[var(--river-deep)] px-1 font-mono text-xs font-bold text-[var(--paper)]"
              >
                {point.index + 1}
              </span>
            </MarkerContent>
          </MapMarker>
        );
      })}
    </Map>
  );
}
