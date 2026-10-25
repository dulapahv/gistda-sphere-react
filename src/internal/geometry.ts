import type {
  GeometryOptions,
  Location,
  SphereGeometryOptions,
  SphereNamespace,
  SphereOverlay,
} from "@/types";
import { toLineStyleValue } from "./enums";

/** Style options that Sphere can update on an existing geometry. */
export const UPDATABLE_STYLE_KEYS = [
  "lineWidth",
  "lineColor",
  "fillColor",
  "lineStyle",
] as const;

export type GeometryStyle = Pick<
  GeometryOptions,
  (typeof UPDATABLE_STYLE_KEYS)[number]
>;

/** Returns true when the value looks like a `{ lon, lat }` location. */
export function isLocation(value: unknown): value is Location {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<Location>;
  return (
    typeof candidate.lon === "number" &&
    Number.isFinite(candidate.lon) &&
    typeof candidate.lat === "number" &&
    Number.isFinite(candidate.lat)
  );
}

/** Copies only the defined entries of an object. */
export function withoutUndefined<T extends object>(value: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(value) as (keyof T)[]) {
    if (value[key] !== undefined) {
      result[key] = value[key];
    }
  }
  return result;
}

/**
 * Builds the options object Sphere expects from this library's friendly
 * geometry options: drops undefined values and converts `lineStyle` names
 * to runtime dash arrays.
 */
export function toSphereGeometryOptions(
  sphere: SphereNamespace,
  options: GeometryOptions | (GeometryOptions & Record<string, unknown>)
): SphereGeometryOptions & Record<string, unknown> {
  const { lineStyle, ...rest } = options as GeometryOptions &
    Record<string, unknown>;
  const result: SphereGeometryOptions & Record<string, unknown> =
    withoutUndefined(rest);
  const dash = toLineStyleValue(sphere, lineStyle);
  if (dash) {
    result.lineStyle = dash;
  }
  return result;
}

/** Target accepted by spatial helpers: a location or another overlay. */
export type SpatialTarget = Location | SphereOverlay;

/**
 * Sphere's spatial predicates (`contains`, `intersects`, `within`,
 * `distance`) throw when given a plain location, despite the documentation.
 * Wrapping the location in a `Dot` makes them work.
 */
export function toSpatialOverlay(
  sphere: SphereNamespace,
  target: SpatialTarget
): SphereOverlay {
  return isLocation(target) ? new sphere.Dot(target) : target;
}

/** Spatial methods shared by every overlay ref. */
export interface OverlaySpatialMethods {
  /** Whether the target (location or overlay) lies inside this overlay. */
  contains: (target: SpatialTarget) => boolean;
  /** Shortest geodesic distance to the target in meters, or formatted text with a language. */
  distanceTo: (
    target: SpatialTarget,
    language?: string
  ) => number | string | null;
  /** Whether this overlay and the target share any space. */
  intersects: (target: SpatialTarget) => boolean;
  /** Move this overlay by a `{ lon, lat }` offset in degrees. */
  shift: (offset: Location) => void;
  /** This overlay as a GeoJSON feature. */
  toGeoJSON: () => object | null;
  /** Whether this overlay lies inside the target overlay. */
  within: (target: SphereOverlay) => boolean;
}

/**
 * Creates the spatial helpers exposed on overlay refs. Methods return safe
 * defaults (`false`/`null`) while the overlay or the API is not available.
 */
export function createSpatialMethods(
  getSphere: () => SphereNamespace | null | undefined,
  getOverlay: () => SphereOverlay | null
): OverlaySpatialMethods {
  return {
    contains: (target) => {
      const sphere = getSphere();
      const overlay = getOverlay();
      return sphere && overlay
        ? overlay.contains(toSpatialOverlay(sphere, target))
        : false;
    },
    distanceTo: (target, language) => {
      const sphere = getSphere();
      const overlay = getOverlay();
      return sphere && overlay
        ? overlay.distance(toSpatialOverlay(sphere, target), language)
        : null;
    },
    intersects: (target) => {
      const sphere = getSphere();
      const overlay = getOverlay();
      return sphere && overlay
        ? overlay.intersects(toSpatialOverlay(sphere, target))
        : false;
    },
    shift: (offset) => {
      getOverlay()?.shift(offset);
    },
    toGeoJSON: () => getOverlay()?.toJSON() ?? null,
    within: (target) => getOverlay()?.within(target) ?? false,
  };
}
