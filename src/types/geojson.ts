/**
 * Minimal GeoJSON (RFC 7946) types.
 *
 * Defined locally so the library has no runtime or type dependency on
 * `@types/geojson`. They are structurally compatible with those types.
 */

/** `[longitude, latitude]` or `[longitude, latitude, elevation]`. */
export type GeoJSONPosition = number[];

export interface GeoJSONPoint {
  coordinates: GeoJSONPosition;
  type: "Point";
}

export interface GeoJSONMultiPoint {
  coordinates: GeoJSONPosition[];
  type: "MultiPoint";
}

export interface GeoJSONLineString {
  coordinates: GeoJSONPosition[];
  type: "LineString";
}

export interface GeoJSONMultiLineString {
  coordinates: GeoJSONPosition[][];
  type: "MultiLineString";
}

export interface GeoJSONPolygon {
  coordinates: GeoJSONPosition[][];
  type: "Polygon";
}

export interface GeoJSONMultiPolygon {
  coordinates: GeoJSONPosition[][][];
  type: "MultiPolygon";
}

export interface GeoJSONGeometryCollection {
  geometries: GeoJSONGeometry[];
  type: "GeometryCollection";
}

export type GeoJSONGeometry =
  | GeoJSONPoint
  | GeoJSONMultiPoint
  | GeoJSONLineString
  | GeoJSONMultiLineString
  | GeoJSONPolygon
  | GeoJSONMultiPolygon
  | GeoJSONGeometryCollection;

export type GeoJSONProperties = Record<string, unknown> | null;

export interface GeoJSONFeature<
  G extends GeoJSONGeometry | null = GeoJSONGeometry,
  P extends GeoJSONProperties = GeoJSONProperties,
> {
  bbox?: number[];
  geometry: G;
  id?: string | number;
  properties: P;
  type: "Feature";
}

export interface GeoJSONFeatureCollection<
  G extends GeoJSONGeometry | null = GeoJSONGeometry,
  P extends GeoJSONProperties = GeoJSONProperties,
> {
  bbox?: number[];
  features: GeoJSONFeature<G, P>[];
  type: "FeatureCollection";
}

/** Any GeoJSON object: a geometry, a feature, or a feature collection. */
export type GeoJSON =
  | GeoJSONGeometry
  | GeoJSONFeature
  | GeoJSONFeatureCollection;
