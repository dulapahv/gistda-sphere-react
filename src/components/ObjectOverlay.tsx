import { type Ref, useEffect, useImperativeHandle, useRef } from "react";
import { useMapContext } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import { toSphereGeometryOptions } from "@/internal/geometry";
import { useDeepMemo, useLatest } from "@/internal/hooks";
import type {
  Bound,
  FitBoundsOptions,
  GeometryOptions,
  Location,
  MarkerOptions,
  ObjectOptions,
  SphereObjectOverlay,
  SphereOverlay,
} from "@/types";

export interface ObjectOverlayRef {
  /** The underlying `sphere.Overlays.Object`. */
  getObject: () => SphereObjectOverlay | null;
  /** Overlays created once the object has loaded. */
  getOverlays: () => SphereOverlay[];
}

export interface ObjectOverlayProps
  extends Omit<GeometryOptions, "label">,
    ObjectOptions {
  /** Object dataset (defaults to Sphere's default data). */
  dataset?: string;
  /** Fit the map to the object once it loads (`true` or fit options). */
  fitBounds?: boolean | FitBoundsOptions;
  /** Marker icon for point objects. */
  icon?: MarkerOptions["icon"];
  /**
   * Object ID, e.g. an area/POI ID returned by search such as `"A10000000"`
   * (Bangkok). Areas are drawn as polygons, points as markers.
   */
  id: string;
  /** Label text, or `true` to label the object with its name. */
  label?: string | boolean;
  onClick?: (overlay: SphereOverlay, location: Location) => void;
  /**
   * Called when the object has not loaded within `timeout`. Sphere gives no
   * error of its own when the ID is unknown or the API key lacks the POI
   * service, so this is the only way to notice.
   */
  onError?: (error: Error) => void;
  /** Called with the object's data and created overlays once loaded. */
  onLoad?: (data: unknown, overlays: SphereOverlay[]) => void;
  ref?: Ref<ObjectOverlayRef>;
  /** Milliseconds to wait before calling `onError`. Default `15000`; `0` disables it. */
  timeout?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

/** Combines the bounds of the overlays an object created. */
function boundOf(overlays: SphereOverlay[]): Bound | null {
  let result: Bound | null = null;
  for (const overlay of overlays) {
    const candidate = (overlay as { bound?: () => Bound }).bound?.();
    const location = overlay.location();
    const bound =
      candidate ??
      (location && "lon" in location
        ? {
            maxLat: location.lat,
            maxLon: location.lon,
            minLat: location.lat,
            minLon: location.lon,
          }
        : null);
    if (bound) {
      result = result
        ? {
            maxLat: Math.max(result.maxLat, bound.maxLat),
            maxLon: Math.max(result.maxLon, bound.maxLon),
            minLat: Math.min(result.minLat, bound.minLat),
            minLon: Math.min(result.minLon, bound.minLon),
          }
        : bound;
    }
  }
  return result;
}

/**
 * Shows a predefined Sphere object (an administrative area, landmark or
 * POI) by ID, loaded from the Sphere POI service. Requires a key with the
 * POI service enabled.
 */
export function ObjectOverlay({
  id,
  dataset,
  fitBounds,
  label,
  icon,
  onClick,
  onError,
  onLoad,
  ref,
  timeout = DEFAULT_TIMEOUT_MS,
  ...options
}: ObjectOverlayProps): null {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const objectRef = useRef<SphereObjectOverlay | null>(null);
  const callbacksRef = useLatest({ onClick, onError, onLoad });
  const stableOptions = useDeepMemo({ ...options, icon });
  const stableFitBounds = useDeepMemo(fitBounds);

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }
    const objectOptions: Record<string, unknown> = toSphereGeometryOptions(
      sphere,
      stableOptions
    );
    if (label === true) {
      objectOptions.label = sphere.ObjectLabel.Title;
    } else if (typeof label === "string") {
      objectOptions.label = label;
    }

    const object = new sphere.Overlays.Object(id, dataset, objectOptions);
    objectRef.current = object;

    const timer =
      timeout > 0
        ? setTimeout(() => {
            callbacksRef.current.onError?.(
              new Error(
                `The Sphere object "${id}" did not load. Check the ID and that your API key has the POI service enabled.`
              )
            );
          }, timeout)
        : undefined;

    const handleLoad = (data: unknown) => {
      if (object.items?.[0] !== data) {
        return;
      }
      clearTimeout(timer);
      const overlays = (object.overlays ?? []) as SphereOverlay[];
      if (stableFitBounds) {
        const bound = boundOf(overlays);
        if (bound) {
          map.bound(
            bound,
            typeof stableFitBounds === "object"
              ? stableFitBounds
              : { padding: 40 }
          );
        }
      }
      callbacksRef.current.onLoad?.(data, overlays);
    };
    const handleClick = (overlay: SphereOverlay, location: Location) => {
      if ((object.overlays as SphereOverlay[] | undefined)?.includes(overlay)) {
        callbacksRef.current.onClick?.(overlay, location);
      }
    };

    map.Event.bind("overlayLoad", handleLoad);
    map.Event.bind("overlayClick", handleClick);
    map.Overlays.load(object);

    return () => {
      clearTimeout(timer);
      map.Event.unbind("overlayLoad", handleLoad);
      map.Event.unbind("overlayClick", handleClick);
      map.Overlays.unload(object);
      if (objectRef.current === object) {
        objectRef.current = null;
      }
    };
  }, [
    isReady,
    map,
    sphere,
    id,
    dataset,
    label,
    stableOptions,
    stableFitBounds,
    timeout,
    callbacksRef,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      getObject: () => objectRef.current,
      getOverlays: () => (objectRef.current?.overlays ?? []) as SphereOverlay[],
    }),
    []
  );

  return null;
}
