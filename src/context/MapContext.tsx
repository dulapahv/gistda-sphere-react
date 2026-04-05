import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { SphereMap } from "../types";

interface MapContextValue {
  isReady: boolean;
  map: SphereMap | null;
}

const MapContext = createContext<MapContextValue | null>(null);

interface MapProviderProps {
  children: ReactNode;
  isReady: boolean;
  map: SphereMap | null;
}

export function MapProvider({
  map,
  isReady,
  children,
}: MapProviderProps): ReactNode {
  const value = useMemo<MapContextValue>(
    () => ({ map, isReady }),
    [map, isReady]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapContext(): MapContextValue {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error("useMapContext must be used within a SphereMap component");
  }

  return context;
}

export type { MapContextValue };
export { MapContext };
