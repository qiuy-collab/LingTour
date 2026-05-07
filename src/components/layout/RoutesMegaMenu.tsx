"use client";

import Link from "next/link";
import { useMemo } from "react";
import guangdongCities from "@/data/guangdong-cities.json";
import { storyRoutes } from "@/data/routes";

type Position = [number, number];

type CityFeature = {
  type: "Feature";
  properties: {
    adcode: number;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: Position[][] | Position[][][];
  };
};

type GuangdongGeoJson = {
  type: "FeatureCollection";
  features: CityFeature[];
};

const initialFeatures = (guangdongCities as unknown as GuangdongGeoJson).features;

const routeRegions = [
  {
    title: "Bay Area Core",
    note: "Guangzhou / Foshan / Shenzhen",
    adcodes: [440100, 440300, 440600],
    cities: ["Guangzhou", "Foshan", "Shenzhen"],
  },
  {
    title: "Chaoshan Coast",
    note: "Chaozhou / Shantou",
    adcodes: [445100, 440500],
    cities: ["Chaozhou", "Shantou"],
  },
  {
    title: "Hakka Mountains",
    note: "Meizhou",
    adcodes: [441400],
    cities: ["Meizhou"],
  },
  {
    title: "Southern Sea",
    note: "Zhanjiang",
    adcodes: [440800],
    cities: ["Zhanjiang"],
  },
  {
    title: "Northern Gateway",
    note: "Shaoguan",
    adcodes: [440200],
    cities: ["Shaoguan"],
  },
];

function getRings(feature: CityFeature): Position[][] {
  if (feature.geometry.type === "Polygon") {
    return feature.geometry.coordinates as Position[][];
  }

  return (feature.geometry.coordinates as Position[][][]).flat();
}

function getAllPoints(features: CityFeature[]) {
  return features.flatMap((feature) => getRings(feature).flat());
}

function buildProjection(features: CityFeature[]) {
  const points = getAllPoints(features);
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const width = 150;
  const height = 88;
  const padding = 8;
  const scale = Math.min((width - padding * 2) / (maxLng - minLng), (height - padding * 2) / (maxLat - minLat));
  const mapWidth = (maxLng - minLng) * scale;
  const mapHeight = (maxLat - minLat) * scale;
  const offsetX = (width - mapWidth) / 2;
  const offsetY = (height - mapHeight) / 2;

  return {
    width,
    height,
    point([lng, lat]: Position) {
      return [offsetX + (lng - minLng) * scale, height - offsetY - (lat - minLat) * scale] as Position;
    },
  };
}

function featureToPath(feature: CityFeature, project: (point: Position) => Position) {
  return getRings(feature)
    .map((ring) =>
      ring
        .map((point, index) => {
          const [x, y] = project(point);
          return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ") + " Z",
    )
    .join(" ");
}

function routesForCities(cities: string[]) {
  return storyRoutes.filter((route) => route.cities.some((city) => cities.includes(city)));
}

export function RoutesMegaMenu({ active }: { active: boolean }) {
  const mapPaths = useMemo(() => {
    if (!initialFeatures.length) {
      return null;
    }

    const projection = buildProjection(initialFeatures);

    return {
      width: projection.width,
      height: projection.height,
      paths: initialFeatures.map((feature) => ({
        adcode: feature.properties.adcode,
        path: featureToPath(feature, projection.point),
      })),
    };
  }, []);

  return (
    <div className="group/routes relative">
      <Link
        href="/routes"
        className={`px-3 py-3 text-sm transition ${
          active ? "text-[var(--cinnabar)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
        }`}
        aria-current={active ? "page" : undefined}
      >
        Routes
      </Link>

      <div className="invisible fixed left-0 top-[4.55rem] z-40 w-screen translate-y-3 border-y border-black/10 bg-[rgba(248,244,236,0.98)] opacity-0 shadow-[0_28px_80px_rgba(17,25,35,0.14)] backdrop-blur-xl transition-all duration-300 group-hover/routes:visible group-hover/routes:translate-y-0 group-hover/routes:opacity-100 group-focus-within/routes:visible group-focus-within/routes:translate-y-0 group-focus-within/routes:opacity-100">
        <div className="mx-auto max-w-[82rem] px-10 py-8">
          <div className="mb-7 flex items-end justify-between gap-8">
            <div>
              <p className="text-label text-[var(--cinnabar)]">Routes by region</p>
              <h2 className="mt-2 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)]">
                Pick a Guangdong region, then follow its story route.
              </h2>
            </div>
            <Link href="/routes" className="kinetic-link bg-[var(--night)] px-5 py-3 text-sm text-white">
              View all routes
            </Link>
          </div>

          <div className="grid gap-x-7 gap-y-8 md:grid-cols-3 xl:grid-cols-5">
            {routeRegions.map((region) => {
              const regionRoutes = routesForCities(region.cities);

              return (
                <div key={region.title} className="group/region">
                  <Link href={regionRoutes[0] ? `/routes/${regionRoutes[0].slug}` : "/routes"} className="block">
                    <div className="relative h-28 overflow-hidden bg-white/60 transition group-hover/region:-translate-y-1 group-hover/region:shadow-[0_20px_60px_rgba(17,25,35,0.12)]">
                      {mapPaths ? (
                        <svg
                          viewBox={`0 0 ${mapPaths.width} ${mapPaths.height}`}
                          className="h-full w-full scale-110"
                          role="img"
                          aria-label={`${region.title} highlighted on Guangdong map`}
                        >
                          <title>{region.title}</title>
                          {mapPaths.paths.map((city) => (
                            <path
                              key={city.adcode}
                              d={city.path}
                              fill={region.adcodes.includes(city.adcode) ? "#d42621" : "#dbe7df"}
                              stroke="#fffaf1"
                              strokeWidth={region.adcodes.includes(city.adcode) ? 1.2 : 0.7}
                              opacity={region.adcodes.includes(city.adcode) ? 1 : 0.72}
                            />
                          ))}
                        </svg>
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-[var(--muted)]">Map</div>
                      )}
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[var(--ink)] transition group-hover/region:text-[var(--cinnabar)]">
                      {region.title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">{region.note}</p>
                  </Link>
                  <div className="mt-4 grid gap-2">
                    {regionRoutes.map((route) => (
                      <Link
                        key={route.slug}
                        href={`/routes/${route.slug}`}
                        className="text-sm leading-6 text-[var(--ink)] transition hover:translate-x-1 hover:text-[var(--cinnabar)]"
                      >
                        {route.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
