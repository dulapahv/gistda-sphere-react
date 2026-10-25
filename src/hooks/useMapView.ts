import { useEffect, useState } from "react";
import { type MapView, readView } from "@/internal/mapControls";
import { useActiveMap } from "@/internal/useActiveMap";

/**
 * The map's current view (center, zoom, rotation, tilt and visible box),
 * updated each time the map stops moving. `null` until the map is ready.
 * Works inside `SphereMap` and anywhere else under `SphereProvider`.
 */
export function useMapView(): MapView | null {
  const { map, isReady } = useActiveMap();
  const [view, setView] = useState<MapView | null>(null);

  useEffect(() => {
    if (!(isReady && map)) {
      setView(null);
      return;
    }
    const update = () => {
      setView(readView(map));
    };
    update();
    map.Renderer.on("moveend", update);
    return () => {
      map.Renderer.off("moveend", update);
    };
  }, [map, isReady]);

  return view;
}
