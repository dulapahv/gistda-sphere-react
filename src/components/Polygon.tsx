import { type ReactNode, type Ref, useImperativeHandle } from "react";
import { useSphereContext } from "@/context/SphereContext";
import {
  countLocations,
  createGeometryRefMethods,
  createPolygonOperations,
  type GeometryRefMethods,
  type PolygonOperationMethods,
  readArea,
} from "@/internal/geometryRef";
import {
  type GeometryComponentProps,
  useGeometry,
} from "@/internal/useGeometry";
import type { GeometryInput, SpherePolygon } from "@/types";

export interface PolygonRef
  extends GeometryRefMethods,
    PolygonOperationMethods {
  /** Area in square meters, or formatted text when a language is given. */
  getArea: (language?: string) => number | string | null;
  /** The underlying `sphere.Polygon`. */
  getPolygon: () => SpherePolygon | null;
}

export interface PolygonProps extends GeometryComponentProps<SpherePolygon> {
  /**
   * Vertices of the polygon. `null` entries start a hole (inner ring). A
   * GeoJSON `Polygon`/`MultiPolygon` (or feature) is also accepted.
   */
  positions: GeometryInput;
  ref?: Ref<PolygonRef>;
}

/** A filled polygon on the map. Needs at least three vertices. */
export function Polygon({ positions, ref, ...props }: PolygonProps): ReactNode {
  const { sphere } = useSphereContext();
  const { overlayRef, portal } = useGeometry<SpherePolygon>({
    create: (api, options) =>
      countLocations(positions) < 3
        ? null
        : new api.Polygon(positions, options),
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
      ...createPolygonOperations(
        () => sphere,
        () => overlayRef.current
      ),
      getArea: (language) => readArea(sphere, overlayRef.current, language),
      getPolygon: () => overlayRef.current,
    }),
    [sphere, overlayRef]
  );

  return portal;
}
