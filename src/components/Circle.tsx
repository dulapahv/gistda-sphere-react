import { type ReactNode, type Ref, useImperativeHandle } from "react";
import { useSphereContext } from "@/context/SphereContext";
import {
  createGeometryRefMethods,
  type GeometryRefMethods,
  readArea,
} from "@/internal/geometryRef";
import {
  type GeometryComponentProps,
  useGeometry,
} from "@/internal/useGeometry";
import type { Location, SphereCircle } from "@/types";

export interface CircleRef extends GeometryRefMethods {
  /** Area in square meters, or formatted text when a language is given. */
  getArea: (language?: string) => number | string | null;
  /** Center of the circle. */
  getCenter: () => Location | null;
  /** The underlying `sphere.Circle`. */
  getCircle: () => SphereCircle | null;
  /** Radius in meters, or formatted text when a language is given. */
  getRadius: (language?: string) => number | string | null;
}

export interface CircleProps extends GeometryComponentProps<SphereCircle> {
  /** Center of the circle. */
  center: Location;
  /** Radius in degrees (about 111 km per degree of latitude). */
  radius: number;
  ref?: Ref<CircleRef>;
}

/** A circle on the map. */
export function Circle({
  center,
  radius,
  ref,
  ...props
}: CircleProps): ReactNode {
  const { sphere } = useSphereContext();
  const { overlayRef, portal } = useGeometry<SphereCircle>({
    create: (api, options) => new api.Circle(center, radius, options),
    props,
    shape: { center, radius },
  });

  useImperativeHandle(
    ref,
    () => ({
      ...createGeometryRefMethods(
        () => sphere,
        () => overlayRef.current
      ),
      getArea: (language) => readArea(sphere, overlayRef.current, language),
      getCenter: () => {
        const location = overlayRef.current?.location() as Location | undefined;
        return location ? { lat: location.lat, lon: location.lon } : null;
      },
      getCircle: () => overlayRef.current,
      getRadius: (language) => overlayRef.current?.radius(language) ?? null,
    }),
    [sphere, overlayRef]
  );

  return portal;
}
