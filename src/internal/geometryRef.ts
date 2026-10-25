import type {
  Bound,
  GeometryInput,
  GeometryOptions,
  Location,
  SphereNamespace,
  SpherePolygon,
  SpherePolyline,
} from "@/types";
import {
  createSpatialMethods,
  type OverlaySpatialMethods,
  toSphereGeometryOptions,
  UPDATABLE_STYLE_KEYS,
} from "./geometry";

/** Ref methods shared by Polyline, Polygon, Circle, Dot and Rectangle. */
export interface GeometryRefMethods extends OverlaySpatialMethods {
  /** Bounding box of the geometry. */
  getBound: () => Bound | null;
  /** Geometric center of the geometry. */
  getCentroid: () => Location | null;
  /** A point guaranteed to lie on the geometry (used for labels). */
  getPivot: () => Location | null;
  /** Rotate the geometry clockwise by `angle` degrees around its pivot. */
  rotate: (angle: number) => void;
  /** Show (`true`), hide (`false`) or toggle the popup. */
  togglePopup: (show?: boolean, location?: Location) => void;
  /**
   * Update `lineWidth`, `lineColor`, `fillColor` and/or `lineStyle` without
   * re-creating the geometry. Other keys are ignored.
   */
  updateStyle: (options: Partial<GeometryOptions>) => void;
}

/** Builds the shared geometry ref methods for an overlay getter. */
export function createGeometryRefMethods(
  getSphere: () => SphereNamespace | null | undefined,
  getOverlay: () => SpherePolyline | null
): GeometryRefMethods {
  return {
    ...createSpatialMethods(getSphere, getOverlay),
    getBound: () => getOverlay()?.bound() ?? null,
    getCentroid: () => getOverlay()?.centroid() ?? null,
    getPivot: () => getOverlay()?.pivot() ?? null,
    rotate: (angle) => {
      getOverlay()?.rotate(angle);
    },
    togglePopup: (show, location) => {
      getOverlay()?.pop(show, location);
    },
    updateStyle: (options) => {
      const sphere = getSphere();
      const overlay = getOverlay();
      if (!(sphere && overlay)) {
        return;
      }
      const style: Partial<GeometryOptions> = {};
      for (const key of UPDATABLE_STYLE_KEYS) {
        if (options[key] !== undefined) {
          Object.assign(style, { [key]: options[key] });
        }
      }
      overlay.update(toSphereGeometryOptions(sphere, style));
    },
  };
}

/**
 * Area of a polygon-like overlay in square meters, or plain formatted text
 * (e.g. `"120 sq.km"`) when a language is given. Sphere's own formatted size
 * adds Thai units after an HTML `<br />`, which React would show literally;
 * use `formatThaiArea` for rai/ngan/square wa instead.
 */
export function readArea(
  sphere: SphereNamespace | null | undefined,
  overlay: SpherePolyline | null,
  language?: string
): number | string | null {
  const area = overlay?.size();
  if (typeof area !== "number") {
    return null;
  }
  return language && sphere ? sphere.Util.formatArea(area, language) : area;
}

/** Polygon set operations shared by Polygon and Rectangle refs. */
export interface PolygonOperationMethods {
  /** Part of this polygon outside `other` (not added to the map). */
  difference: (
    other: SpherePolygon,
    options?: GeometryOptions
  ) => SpherePolygon | null;
  /** Overlapping part of this polygon and `other` (not added to the map). */
  intersection: (
    other: SpherePolygon,
    options?: GeometryOptions
  ) => SpherePolygon | null;
  /** This polygon split by `splitter` (not added to the map). */
  split: (
    splitter: SpherePolygon,
    options?: GeometryOptions
  ) => SpherePolygon[];
  /** This polygon merged with `other` (not added to the map). */
  union: (
    other: SpherePolygon,
    options?: GeometryOptions
  ) => SpherePolygon | null;
}

/** Builds polygon set operations for an overlay getter. */
export function createPolygonOperations(
  getSphere: () => SphereNamespace | null | undefined,
  getOverlay: () => SpherePolygon | null
): PolygonOperationMethods {
  const convert = (options?: GeometryOptions) => {
    const sphere = getSphere();
    return options && sphere
      ? toSphereGeometryOptions(sphere, options)
      : undefined;
  };
  return {
    difference: (other, options) =>
      getOverlay()?.difference(other, convert(options)) ?? null,
    intersection: (other, options) =>
      getOverlay()?.intersection(other, convert(options)) ?? null,
    split: (splitter, options) =>
      getOverlay()?.split(splitter, convert(options)) ?? [],
    union: (other, options) =>
      getOverlay()?.union(other, convert(options)) ?? null,
  };
}

/**
 * Counts the locations in geometry input (ignoring `null` ring separators).
 * GeoJSON input is assumed complete and reported as `Infinity`.
 */
export function countLocations(input: GeometryInput): number {
  if (!Array.isArray(input)) {
    return Number.POSITIVE_INFINITY;
  }
  return input.filter((item) => item !== null).length;
}
