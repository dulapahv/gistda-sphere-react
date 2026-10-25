import type {
  Bound,
  GeoJSON,
  GeoJSONFeature,
  GeoJSONGeometry,
  GeoJSONPosition,
} from "@/types";

/** Normalizes any GeoJSON object into a flat list of features. */
export function toFeatures(data: GeoJSON): GeoJSONFeature[] {
  switch (data.type) {
    case "FeatureCollection":
      return data.features;
    case "Feature":
      return [data];
    default:
      return [{ geometry: data, properties: {}, type: "Feature" }];
  }
}

/**
 * Splits a geometry into the simple parts Sphere renders as one overlay
 * each. Geometry collections and multi-points are expanded; multi-lines and
 * multi-polygons are kept whole (Sphere supports them directly).
 */
export function toRenderableGeometries(
  geometry: GeoJSONGeometry | null
): GeoJSONGeometry[] {
  if (!geometry) {
    return [];
  }
  if (geometry.type === "GeometryCollection") {
    return geometry.geometries.flatMap(toRenderableGeometries);
  }
  if (geometry.type === "MultiPoint") {
    return geometry.coordinates.map((coordinates) => ({
      coordinates,
      type: "Point" as const,
    }));
  }
  return [geometry];
}

/** Collects every position of a geometry. */
function collectPositions(
  geometry: GeoJSONGeometry | null,
  into: GeoJSONPosition[]
): void {
  if (!geometry) {
    return;
  }
  switch (geometry.type) {
    case "Point":
      into.push(geometry.coordinates);
      return;
    case "MultiPoint":
    case "LineString":
      into.push(...geometry.coordinates);
      return;
    case "MultiLineString":
    case "Polygon":
      for (const line of geometry.coordinates) {
        into.push(...line);
      }
      return;
    case "MultiPolygon":
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          into.push(...ring);
        }
      }
      return;
    case "GeometryCollection":
      for (const part of geometry.geometries) {
        collectPositions(part, into);
      }
      return;
    default:
      return;
  }
}

/** Bounding box of any GeoJSON object, or `null` when it has no positions. */
export function computeBound(data: GeoJSON): Bound | null {
  const positions: GeoJSONPosition[] = [];
  for (const feature of toFeatures(data)) {
    collectPositions(feature.geometry, positions);
  }
  if (positions.length === 0) {
    return null;
  }
  const bound: Bound = {
    maxLat: Number.NEGATIVE_INFINITY,
    maxLon: Number.NEGATIVE_INFINITY,
    minLat: Number.POSITIVE_INFINITY,
    minLon: Number.POSITIVE_INFINITY,
  };
  for (const [lon, lat] of positions) {
    if (typeof lon === "number" && typeof lat === "number") {
      bound.minLon = Math.min(bound.minLon, lon);
      bound.maxLon = Math.max(bound.maxLon, lon);
      bound.minLat = Math.min(bound.minLat, lat);
      bound.maxLat = Math.max(bound.maxLat, lat);
    }
  }
  return Number.isFinite(bound.minLon) ? bound : null;
}
