import guangdongCities from "@/data/guangdong-cities.json";

export type Position = [number, number];

export type CityFeature = {
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

export type GuangdongGeoJson = {
  type: "FeatureCollection";
  features: CityFeature[];
};

const features: CityFeature[] = (guangdongCities as unknown as GuangdongGeoJson).features;

export function getMapFeatures(): CityFeature[] {
  return features;
}

export function getRings(feature: CityFeature): Position[][] {
  if (feature.geometry.type === "Polygon") {
    return feature.geometry.coordinates as Position[][];
  }

  return (feature.geometry.coordinates as Position[][][]).flat();
}

export function getAllPoints(features: CityFeature[]) {
  return features.flatMap((feature) => getRings(feature).flat());
}

export function buildProjection(
  features: CityFeature[],
  width: number,
  height: number,
  padding?: number | { left?: number; right?: number; top?: number; bottom?: number },
) {
  const points = getAllPoints(features);
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  if (typeof padding === "object") {
    const { left = 0, right = 0, top = 0, bottom = 0 } = padding;
    const innerWidth = width - left - right;
    const innerHeight = height - top - bottom;
    const scale = Math.min(innerWidth / (maxLng - minLng), innerHeight / (maxLat - minLat));
    const mapWidth = (maxLng - minLng) * scale;
    const mapHeight = (maxLat - minLat) * scale;
    const offsetX = left + (innerWidth - mapWidth) / 2;
    const offsetY = top + (innerHeight - mapHeight) / 2;

    return {
      width,
      height,
      point([lng, lat]: Position): Position {
        return [offsetX + (lng - minLng) * scale, height - offsetY - (lat - minLat) * scale] as Position;
      },
    };
  }

  const p = padding ?? 0;
  const scale = Math.min((width - p * 2) / (maxLng - minLng), (height - p * 2) / (maxLat - minLat));
  const mapWidth = (maxLng - minLng) * scale;
  const mapHeight = (maxLat - minLat) * scale;
  const offsetX = (width - mapWidth) / 2;
  const offsetY = (height - mapHeight) / 2;

  return {
    width,
    height,
    point([lng, lat]: Position): Position {
      return [offsetX + (lng - minLng) * scale, height - offsetY - (lat - minLat) * scale] as Position;
    },
  };
}

export function featureToPath(
  feature: CityFeature,
  project: (point: Position) => Position,
) {
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
