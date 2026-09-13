"use client";

import { useEffect, useState } from "react";
import { LngLatBounds } from "maplibre-gl";
import { Map, MapMarker, MapRoute, MarkerContent, useMap } from "@/components/mapcn/map";
import type { buildRouteGeometry } from "./route-map-geometry";

type Geometry = ReturnType<typeof buildRouteGeometry>;
type MarkerGroup = { points: Geometry["points"]; screenX: number; screenY: number };

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

function RouteMarkers({ points, routeTitle }: { points: Geometry["points"]; routeTitle: string }) {
  const { map } = useMap();
  const [groups, setGroups] = useState<MarkerGroup[]>([]);

  useEffect(() => {
    if (!map || !points.length) return;

    const update = () => {
      const next: MarkerGroup[] = [];
      points.forEach((point) => {
        const projected = map.project(point.coordinates);
        const existing = next.find(
          (group) =>
            Math.hypot(group.screenX - projected.x, group.screenY - projected.y) < 34,
        );
        if (existing) {
          existing.points.push(point);
        } else {
          next.push({ points: [point], screenX: projected.x, screenY: projected.y });
        }
      });
      setGroups(next);
    };

    update();
    map.on("idle", update);

    return () => {
      map.off("idle", update);
    };
  }, [map, points]);

  return (
    <>
      {groups.map((group, index) => {
        const first = group.points[0];
        const label = group.points
          .map(
            (point) =>
              `Stop ${point.index + 1}: ${point.stop}${point.time ? `, ${point.time}` : ""}`,
          )
          .join(" | ");
        const text = group.points.length > 1 ? `${first.index + 1}+` : `${first.index + 1}`;

        return (
          <MapMarker
            key={`${first.index}-${index}`}
            longitude={first.coordinates[0]}
            latitude={first.coordinates[1]}
            anchor="center"
          >
            <MarkerContent>
              <span
                role="img"
                aria-label={label}
                title={label}
                className="grid h-8 min-w-8 cursor-default place-items-center border-2 border-[var(--paper)] bg-[var(--river-deep)] px-1 font-mono text-xs font-bold text-[var(--paper)]"
              >
                {text}
              </span>
            </MarkerContent>
          </MapMarker>
        );
      })}
      <span className="sr-only">{`Schematic stop positions for ${routeTitle}`}</span>
    </>
  );
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
      <RouteMarkers points={geometry.points} routeTitle={routeTitle} />
    </Map>
  );
}
