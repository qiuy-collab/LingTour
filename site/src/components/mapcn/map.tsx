"use client";

/**
 * Adapted from mapcn's official src/registry/map.tsx (MIT).
 * Copyright (c) 2025 Anmoldeep Singh. See ./LICENSE.
 * https://github.com/AnmolSaini16/mapcn/blob/main/src/registry/map.tsx
 *
 * Retains the Map context/lifecycle, portal markers and GeoJSON route layer.
 * This deliberately small subset omits unused controls, popups, theme switching
 * and chart layers. Culvoy adds local workers and bounded failure handling.
 */
import * as MapLibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const defaultStyle =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// Generated from the installed package by scripts/copy-maplibre-worker.mjs.
// Same-origin module workers need neither unpkg nor blob: in worker-src CSP.
if (typeof window !== "undefined") {
  MapLibreGL.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
}

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a Map component");
  return context;
}

type MapRef = MapLibreGL.Map;

type MapProps = {
  children?: ReactNode;
  className?: string;
  style?: string | MapLibreGL.StyleSpecification;
  /** Called once the initial basemap has finished loading. */
  onReady?: () => void;
  /** First initialization, WebGL, tile or loading-timeout failure only. */
  onError?: () => void;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

const Map = forwardRef<MapRef, MapProps>(function Map(
  { children, className, style = defaultStyle, onReady, onError, ...props },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const initialOptions = useRef({ style, ...props });
  const callbacks = useRef({ onReady, onError });
  callbacks.current = { onReady, onError };

  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

  useEffect(() => {
    if (!containerRef.current) return;
    let failed = false;
    let disposed = false;
    let ready = false;
    let map: MapLibreGL.Map | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const failOnce = (event?: unknown) => {
      if (failed || disposed) return;
      console.warn("Route map unavailable", event);
      failed = true;
      clearTimeout(timeout);
      callbacks.current.onError?.();
    };
    const loadHandler = () => setIsLoaded(true);
    const styleLoadHandler = () => setIsStyleLoaded(true);
    const idleHandler = () => {
      if (ready || failed || disposed) return;
      ready = true;
      clearTimeout(timeout);
      callbacks.current.onReady?.();
    };

    try {
      map = new MapLibreGL.Map({
        container: containerRef.current,
        renderWorldCopies: false,
        attributionControl: { compact: false },
        ...initialOptions.current,
      });
      map.on("error", failOnce);
      map.on("webglcontextlost", failOnce);
      map.on("load", loadHandler);
      map.on("style.load", styleLoadHandler);
      map.on("idle", idleHandler);
      timeout = setTimeout(failOnce, 15000);
      setMapInstance(map);
    } catch (error) {
      // No WebGL (or blocked workers) must not take the itinerary down.
      failOnce(error);
    }

    return () => {
      disposed = true;
      clearTimeout(timeout);
      if (map) {
        map.off("error", failOnce);
        map.off("webglcontextlost", failOnce);
        map.off("load", loadHandler);
        map.off("style.load", styleLoadHandler);
        map.off("idle", idleHandler);
        map.remove();
      }
      setMapInstance(null);
      setIsLoaded(false);
      setIsStyleLoaded(false);
    };
  }, []);

  const contextValue = useMemo(
    () => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }),
    [mapInstance, isLoaded, isStyleLoaded],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={["relative h-full w-full", className].filter(Boolean).join(" ")}>
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children: ReactNode;
} & Omit<MapLibreGL.MarkerOptions, "element" | "draggable">;

const MarkerContext = createContext<MapLibreGL.Marker | null>(null);

function MapMarker({ longitude, latitude, children, ...markerOptions }: MapMarkerProps) {
  const { map } = useMap();
  const initialOptions = useRef(markerOptions);
  const initialPosition = useRef<[number, number]>([longitude, latitude]);
  const [marker, setMarker] = useState<MapLibreGL.Marker | null>(null);

  useEffect(() => {
    if (!map) return;
    const instance = new MapLibreGL.Marker({
      ...initialOptions.current,
      element: document.createElement("div"),
      draggable: false,
    }).setLngLat(initialPosition.current).addTo(map);
    setMarker(instance);
    return () => {
      instance.remove();
      setMarker(null);
    };
  }, [map]);

  useEffect(() => {
    if (!marker) return;
    const current = marker.getLngLat();
    if (current.lng !== longitude || current.lat !== latitude) {
      marker.setLngLat([longitude, latitude]);
    }
  }, [marker, longitude, latitude]);

  return marker ? <MarkerContext.Provider value={marker}>{children}</MarkerContext.Provider> : null;
}

function MarkerContent({ children, className }: { children: ReactNode; className?: string }) {
  const marker = useContext(MarkerContext);
  if (!marker) throw new Error("MarkerContent must be used within MapMarker");
  return createPortal(
    <div className={["relative", className].filter(Boolean).join(" ")}>{children}</div>,
    marker.getElement(),
  );
}

type MapRouteProps = {
  id?: string;
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  dashArray?: [number, number];
};

function MapRoute({
  id: propId,
  coordinates,
  color = "#14343d",
  width = 2,
  opacity = 0.85,
  dashArray,
}: MapRouteProps) {
  const { map, isLoaded } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;

  useEffect(() => {
    if (!isLoaded || !map) return;
    map.addSource(sourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: { "line-join": "round", "line-cap": "round" },
    });
    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // The parent map may already have been removed during failure cleanup.
      }
    };
  }, [isLoaded, map, sourceId, layerId]);

  useEffect(() => {
    if (!isLoaded || !map) return;
    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: coordinates.length < 2 ? [] : [{
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates },
      }],
    });
  }, [isLoaded, map, coordinates, sourceId]);

  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return;
    map.setPaintProperty(layerId, "line-color", color);
    map.setPaintProperty(layerId, "line-width", width);
    map.setPaintProperty(layerId, "line-opacity", opacity);
    map.setPaintProperty(layerId, "line-dasharray", dashArray);
  }, [isLoaded, map, layerId, color, width, opacity, dashArray]);

  return null;
}

export { Map, useMap, MapMarker, MarkerContent, MapRoute };
export type { MapRef, MapProps, MapMarkerProps, MapRouteProps };
