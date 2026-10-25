import { type ReactNode, type Ref, useImperativeHandle } from "react";
import { useSphereContext } from "@/context/SphereContext";
import {
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
import type { Location, Size, SphereRectangle } from "@/types";

export interface RectangleRef
  extends GeometryRefMethods,
    PolygonOperationMethods {
  /** Area in square meters, or formatted text when a language is given. */
  getArea: (language?: string) => number | string | null;
  /** The underlying `sphere.Rectangle`. */
  getRectangle: () => SphereRectangle | null;
}

export interface RectangleProps
  extends GeometryComponentProps<SphereRectangle> {
  /** Top-left corner. */
  position: Location;
  ref?: Ref<RectangleRef>;
  /** Size in degrees (`{ width, height }`), or the bottom-right corner. */
  size: Size | Location;
}

/** An axis-aligned rectangle on the map. */
export function Rectangle({
  position,
  size,
  ref,
  ...props
}: RectangleProps): ReactNode {
  const { sphere } = useSphereContext();
  const { overlayRef, portal } = useGeometry<SphereRectangle>({
    create: (api, options) => new api.Rectangle(position, size, options),
    props,
    shape: { position, size },
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
      getRectangle: () => overlayRef.current,
    }),
    [sphere, overlayRef]
  );

  return portal;
}
