"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import guangdongCities from "@/data/guangdong-cities.json";
import { regionShowcase } from "@/data/home";

type Position = [number, number];

type CityFeature = {
  type: "Feature";
  properties: {
    adcode: number;
    centroid?: Position;
    center?: Position;
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

type ActivePanel = "city" | "route";

const focusCityByCode = new Map(regionShowcase.map((city) => [city.adcode, city]));
const initialFeatures = (guangdongCities as unknown as GuangdongGeoJson).features;

const routeLabelTargets = new Map<
  number,
  {
    target: Position;
    line: "horizontal" | "vertical" | "elbow";
    anchor: "start" | "end";
  }
>([
  [440100, { target: [314, 376], line: "horizontal", anchor: "end" }],
  [440300, { target: [914, 524], line: "elbow", anchor: "start" }],
  [440600, { target: [250, 440], line: "horizontal", anchor: "end" }],
  [445100, { target: [1016, 302], line: "horizontal", anchor: "start" }],
  [440500, { target: [1016, 408], line: "horizontal", anchor: "start" }],
  [441400, { target: [930, 214], line: "elbow", anchor: "start" }],
  [440800, { target: [118, 536], line: "horizontal", anchor: "end" }],
  [440200, { target: [780, 142], line: "elbow", anchor: "start" }],
]);

function routeLeaderPath([x, y]: Position, [labelX, labelY]: Position, line: "horizontal" | "vertical" | "elbow") {
  if (line === "horizontal") {
    return `M${x.toFixed(2)} ${y.toFixed(2)} L${labelX.toFixed(2)} ${y.toFixed(2)}`;
  }

  if (line === "vertical") {
    return `M${x.toFixed(2)} ${y.toFixed(2)} L${x.toFixed(2)} ${labelY.toFixed(2)}`;
  }

  const midX = labelX > x ? labelX - 62 : labelX + 62;
  return `M${x.toFixed(2)} ${y.toFixed(2)} L${midX.toFixed(2)} ${y.toFixed(2)} L${midX.toFixed(
    2,
  )} ${labelY.toFixed(2)} L${labelX.toFixed(2)} ${labelY.toFixed(2)}`;
}

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
  const width = 1060;
  const height = 640;
  const paddingLeft = 300;
  const paddingRight = 70;
  const paddingY = 78;
  const scale = Math.min(
    (width - paddingLeft - paddingRight) / (maxLng - minLng),
    (height - paddingY * 2) / (maxLat - minLat),
  );
  const mapWidth = (maxLng - minLng) * scale;
  const mapHeight = (maxLat - minLat) * scale;
  const offsetX = paddingLeft + (width - paddingLeft - paddingRight - mapWidth) / 2;
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

export function GuangdongMapSection() {
  const router = useRouter();
  const [features] = useState<CityFeature[]>(initialFeatures);
  const [activeCode, setActiveCode] = useState(regionShowcase[0].adcode);
  const [activePanel, setActivePanel] = useState<ActivePanel>("city");
  const [slideIndex, setSlideIndex] = useState(0);

  const activeCity = focusCityByCode.get(activeCode) ?? regionShowcase[0];
  const activeGallery = activeCity.gallery.length ? activeCity.gallery : [activeCity.image];
  const activeImage = activeGallery[slideIndex % activeGallery.length];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((index) => index + 1);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const mapData = useMemo(() => {
    if (!features.length) {
      return null;
    }

    const projection = buildProjection(features);

    return {
      width: projection.width,
      height: projection.height,
      paths: features.map((feature) => ({
        adcode: feature.properties.adcode,
        path: featureToPath(feature, projection.point),
        point: feature.properties.centroid ? projection.point(feature.properties.centroid) : null,
      })),
    };
  }, [features]);

  const panelTitle = activePanel === "route" ? activeCity.routeShort : activeCity.name;
  const panelEyebrow = activePanel === "route" ? "Story route" : activeCity.label;
  const panelLead = activePanel === "route" ? activeCity.routeName : activeCity.summary;

  return (
    <section className="py-12 lg:py-24">
      <div className="site-container">
        <div className="mb-9 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Discover Guangdong</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              Choose a city, then follow the story behind it.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-[var(--muted)]">
            The map uses real Guangdong city boundaries. Hover a city to connect geography with cultural
            routes, interpretation support, and the images visitors remember first.
          </p>
        </div>

        <div className="relative overflow-hidden border border-[var(--line)] bg-[#fdfaf3] shadow-[var(--shadow-soft)] lg:min-h-[46rem]">
          <Link
            href={activePanel === "route" ? activeCity.routeHref : `/culture/${activeCity.slug}`}
            className="group relative z-10 m-4 block overflow-hidden bg-[rgba(17,25,35,0.92)] text-white shadow-[0_22px_70px_rgba(17,25,35,0.22)] backdrop-blur-md sm:w-[min(100%,16.5rem)] lg:absolute lg:left-7 lg:top-8 lg:m-0"
          >
            <div
              className="image-sheen flex h-[8.75rem] items-end bg-cover bg-center p-4 transition duration-500 group-hover:scale-[1.02]"
              style={{ backgroundImage: `url(${activeImage})` }}
            >
              <div className="relative z-10">
                <p className="text-label text-white/62">{panelEyebrow}</p>
                <h3 className="mt-2 font-[family:var(--font-display)] text-3xl leading-none">
                  {panelTitle}
                </h3>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <p className="text-xs leading-6 text-white/78">{panelLead}</p>
              <div className="flex gap-1.5">
                {activeGallery.map((image, index) => (
                  <span
                    key={image}
                    className={`h-1 w-6 transition ${
                      index === slideIndex % activeGallery.length ? "bg-white" : "bg-white/28"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Link>

          <div className="relative h-[25rem] lg:absolute lg:inset-0 lg:h-auto">
            <div className="h-full w-full p-4 lg:p-8">
              {mapData ? (
                <svg
                  viewBox={`0 0 ${mapData.width} ${mapData.height}`}
                  className="h-full w-full"
                  role="img"
                  aria-label="Interactive map of Guangdong cities"
                >
                  <title>Interactive map of Guangdong cities</title>
                  <rect width={mapData.width} height={mapData.height} fill="#fdfaf3" />
                  <g opacity="0.42">
                    <path d="M120 528 C250 438 380 492 512 408 S760 346 908 246" fill="none" stroke="#d7cfc1" />
                    <path d="M92 382 C244 330 302 244 420 236 S648 196 918 114" fill="none" stroke="#d7cfc1" />
                  </g>
                  {mapData.paths.map((city) => {
                    const hasContent = focusCityByCode.has(city.adcode);
                    const isActive = activeCode === city.adcode;

                    return (
                      <path
                        key={city.adcode}
                        d={city.path}
                        stroke="#fffaf1"
                        strokeWidth={isActive ? 2.4 : 1.2}
                        opacity={hasContent || isActive ? 1 : 0.72}
                        style={{
                          fill: isActive ? "#b64235" : hasContent ? "#9fb39e" : "#d8d0c2",
                          cursor: hasContent ? "pointer" : "default",
                          transition: "fill 200ms",
                        }}
                        onMouseEnter={() => {
                          if (hasContent) {
                            setActiveCode(city.adcode);
                            setActivePanel("city");
                          }
                        }}
                        onClick={() => {
                          const focusCity = focusCityByCode.get(city.adcode);

                          if (focusCity) {
                            router.push(`/culture/${focusCity.slug}`);
                          }
                        }}
                      />
                    );
                  })}
                  {mapData.paths.map((city) => {
                    const focusCity = focusCityByCode.get(city.adcode);
                    const labelConfig = routeLabelTargets.get(city.adcode);

                    if (!focusCity || !city.point || !labelConfig) {
                      return null;
                    }

                    const [x, y] = city.point;
                    const [labelX, labelY] = labelConfig.target;
                    const linePath = routeLeaderPath([x, y], [labelX, labelY], labelConfig.line);
                    const isActive = activeCode === city.adcode;
                    const lineColor = isActive && activePanel === "route" ? "#d42621" : "#b9b8b2";
                    const dotColor = isActive && activePanel === "route" ? "#d42621" : "#9d9b95";
                    const textColor = isActive && activePanel === "route" ? "#d42621" : "#8f908d";
                    const textWeight = isActive && activePanel === "route" ? "bold" : "600";
                    const textSize = isActive && activePanel === "route" ? "12px" : "11px";

                    return (
                      <Link
                        key={`${city.adcode}-route`}
                        href={focusCity.routeHref}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => {
                          setActiveCode(city.adcode);
                          setActivePanel("route");
                        }}
                        onClick={() => {
                          setActiveCode(city.adcode);
                          setActivePanel("route");
                        }}
                      >
                        <g>
                          <path
                            d={linePath}
                            fill="none"
                            strokeWidth={isActive && activePanel === "route" ? 1.7 : 1}
                            opacity={isActive && activePanel === "route" ? 0.96 : 0.7}
                            style={{ stroke: lineColor, transition: "stroke 200ms" }}
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r={isActive && activePanel === "route" ? 4.5 : 3.2}
                            style={{ fill: dotColor, transition: "fill 200ms" }}
                          />
                          <text
                            x={labelX}
                            y={labelConfig.line === "horizontal" ? y + 4 : labelY + 4}
                            textAnchor={labelConfig.anchor}
                            style={{ fill: textColor, fontSize: textSize, fontWeight: textWeight, transition: "fill 200ms" }}
                          >
                            {focusCity.routeShort}
                          </text>
                        </g>
                      </Link>
                    );
                  })}
                  {mapData.paths.map((city) => {
                    const focusCity = focusCityByCode.get(city.adcode);

                    if (!focusCity || !city.point) {
                      return null;
                    }

                    const [x, y] = city.point;

                    return (
                      <g key={`${city.adcode}-label`} pointerEvents="none">
                        <text
                          x={x + 8}
                          y={y - 8}
                          style={{ fill: "var(--night)", fontSize: "12px", fontWeight: "600" }}
                        >
                          {focusCity.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="flex min-h-[24rem] items-center justify-center text-sm text-[var(--muted)]">
                  Loading Guangdong city boundaries
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
