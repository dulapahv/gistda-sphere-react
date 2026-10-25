import { type ReactNode, type Ref, useImperativeHandle } from "react";
import { useSphereContext } from "@/context/SphereContext";
import { toSphereGeometryOptions } from "@/internal/geometry";
import {
  countLocations,
  createGeometryRefMethods,
  type GeometryRefMethods,
} from "@/internal/geometryRef";
import {
  type GeometryComponentProps,
  useGeometry,
} from "@/internal/useGeometry";
import type { GeometryInput, GeometryOptions, SpherePolyline } from "@/types";

export interface PolylineRef extends GeometryRefMethods {
  /** Length in meters, or formatted text when a language is given. */
  getLength: (language?: string) => number | string | null;
  /** The underlying `sphere.Polyline`. */
  getPolyline: () => SpherePolyline | null;
  /** A new polyline combining this one with another (not added to the map). */
  union: (
    other: SpherePolyline,
    options?: GeometryOptions
  ) => SpherePolyline | null;
}

export interface PolylineProps extends GeometryComponentProps<SpherePolyline> {
  /**
   * Vertices of the line. `null` entries split it into several lines. A
   * GeoJSON `LineString`/`MultiLineString` (or feature) is also accepted.
   */
  positions: GeometryInput;
  ref?: Ref<PolylineRef>;
}

/** A line (or multi-line) on the map. Needs at least two vertices. */
export function Polyline({
  positions,
  ref,
  ...props
}: PolylineProps): ReactNode {
  const { sphere } = useSphereContext();
  const { overlayRef, portal } = useGeometry<SpherePolyline>({
    create: (api, options) =>
      countLocations(positions) < 2
        ? null
        : new api.Polyline(positions, options),
    props,
    shape: positions,
  });

  useImperativeHandle(
    ref,
    () => ({
      ...createGeometryRefMethods(
        () => sphere,
        () => overlayRef.current
      ),
      getLength: (language) => overlayRef.current?.size(language) ?? null,
      getPolyline: () => overlayRef.current,
      union: (other, options) =>
        overlayRef.current && sphere
          ? overlayRef.current.union(
              other,
              options && toSphereGeometryOptions(sphere, options)
            )
          : null,
    }),
    [sphere, overlayRef]
  );

  return portal;
}
