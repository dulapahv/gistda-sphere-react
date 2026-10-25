import {
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
} from "react";
import { useSphereContext } from "@/context/SphereContext";
import { isLocation } from "@/internal/geometry";
import {
  createGeometryRefMethods,
  type GeometryRefMethods,
} from "@/internal/geometryRef";
import { useDeepMemo } from "@/internal/hooks";
import {
  type GeometryComponentProps,
  useGeometry,
} from "@/internal/useGeometry";
import type { Location, SphereDot } from "@/types";

export interface DotRef extends GeometryRefMethods {
  /** The underlying `sphere.Dot`. */
  getDot: () => SphereDot | null;
  /** Current position of the dot. */
  getPosition: () => Location | null;
  /** Move the dot. */
  setPosition: (location: Location) => void;
}

export interface DotProps
  extends Omit<GeometryComponentProps<SphereDot>, "onDrop"> {
  /** Called after the user drops a draggable dot, with its new position. */
  onDrop?: (dot: SphereDot, location: Location) => void;
  /** Position of the dot. Changing it moves the dot without re-creating it. */
  position: Location;
  ref?: Ref<DotRef>;
}

/** Reads a single location from an overlay. */
function readLocation(dot: SphereDot): Location | null {
  const value = dot.location();
  return isLocation(value) ? { lat: value.lat, lon: value.lon } : null;
}

/** A dot (point drawn as a circle of `lineWidth` pixels) on the map. */
export function Dot({ position, ref, onDrop, ...props }: DotProps): ReactNode {
  const { sphere } = useSphereContext();
  const { overlayRef, portal } = useGeometry<SphereDot>({
    create: (api, options) => new api.Dot(position, options),
    props: {
      ...props,
      onDrop: onDrop
        ? (dot) => {
            const location = readLocation(dot);
            if (location) {
              onDrop(dot, location);
            }
          }
        : undefined,
    },
    shape: null,
  });

  const stablePosition = useDeepMemo(position);
  useEffect(() => {
    const dot = overlayRef.current;
    if (!dot) {
      return;
    }
    const current = readLocation(dot);
    if (
      current?.lat !== stablePosition.lat ||
      current?.lon !== stablePosition.lon
    ) {
      dot.location(stablePosition);
    }
  }, [stablePosition, overlayRef]);

  useImperativeHandle(
    ref,
    () => ({
      ...createGeometryRefMethods(
        () => sphere,
        () => overlayRef.current
      ),
      getDot: () => overlayRef.current,
      getPosition: () =>
        overlayRef.current ? readLocation(overlayRef.current) : null,
      setPosition: (location) => {
        overlayRef.current?.location(location);
      },
    }),
    [sphere, overlayRef]
  );

  return portal;
}
