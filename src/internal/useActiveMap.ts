import { useContext } from "react";
import { MapContext } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import type { SphereMap } from "@/types";

/**
 * The map a hook should act on: the enclosing `SphereMap` when inside one,
 * otherwise the provider's active map. Lets hooks work both inside the map
 * and in UI elsewhere under `SphereProvider` (e.g. a sidebar).
 */
export function useActiveMap(): { isReady: boolean; map: SphereMap | null } {
  const mapContext = useContext(MapContext);
  const { map, isMapReady, sphere } = useSphereContext();
  if (mapContext) {
    return { isReady: mapContext.isReady, map: mapContext.map };
  }
  return { isReady: isMapReady && sphere !== null, map };
}
