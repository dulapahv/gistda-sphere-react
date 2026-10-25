import { useMapControls, useMapEvent, useMapReady } from "gistda-sphere-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapCamera } from "../types";

/**
 * The map's live center, zoom, rotation and pitch. Updates at most once per
 * animation frame while the map moves.
 */
export function useCamera(): MapCamera | null {
  const { getCenter, getPitch, getRotate, getZoom } = useMapControls();
  const [camera, setCamera] = useState<MapCamera | null>(null);
  const frameRef = useRef<number | null>(null);

  const read = useCallback(() => {
    const center = getCenter();
    const zoom = getZoom();
    if (!center || zoom === null) {
      return;
    }
    setCamera({
      center,
      pitch: getPitch() ?? 0,
      rotation: getRotate() ?? 0,
      zoom,
    });
  }, [getCenter, getPitch, getRotate, getZoom]);

  const schedule = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      read();
    });
  }, [read]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    []
  );

  useMapReady(read);
  useMapEvent("location", schedule);
  useMapEvent("zoom", schedule);
  useMapEvent("rotate", schedule);
  useMapEvent("pitch", schedule);

  return camera;
}
