import { useEffect } from "react";
import { useMapContext } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import type { PredefinedOverlay as PredefinedOverlayName } from "@/types";

/**
 * Names of Sphere's live data overlays. Declared here as well so that
 * importing `PredefinedOverlay` from the package gives both this type and
 * the component.
 */
export type PredefinedOverlay = PredefinedOverlayName;

export interface PredefinedOverlayProps {
  /** Cameras only: include motion (live video) cameras. Default `true`. */
  motion?: boolean;
  /** Show a popup when an item is clicked. Default `true`. */
  popup?: boolean;
  /** Auto-refresh interval in seconds (events refresh every 180 s by default). */
  refresh?: number;
  /** Which live overlay to show. */
  type: PredefinedOverlayName;
}

/**
 * Shows one of Sphere's live data overlays while mounted: traffic `cameras`
 * (CCTV), road `events`, or Thai air quality `aqi`.
 *
 * These overlays are page-wide singletons in the Sphere API, so the same
 * overlay should not be shown on two maps at once.
 */
export function PredefinedOverlay({
  type,
  popup,
  motion,
  refresh,
}: PredefinedOverlayProps): null {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();

  useEffect(() => {
    const config = sphere?.Overlays?.[type];
    if (!(isReady && map && config)) {
      return;
    }
    if (popup !== undefined) {
      config.popup = popup;
    }
    if (motion !== undefined) {
      config.motion = motion;
    }
    if (refresh !== undefined) {
      config.refresh = refresh;
    }
    map.Overlays.load(config);
    return () => {
      map.Overlays.unload(config);
    };
  }, [isReady, map, sphere, type, popup, motion, refresh]);

  return null;
}
