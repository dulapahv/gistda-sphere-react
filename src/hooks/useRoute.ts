import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMap } from "../context/SphereContext";
import type {
  GeometryOptions,
  Language,
  Location,
  RouteLabelType,
  RouteMode,
  RouteType,
  SphereMarker,
  SpherePolyline,
} from "../types";

export interface RouteGuideStep {
  instruction: string;
  distance: number | string;
  duration: number | string;
  location: Location;
}

export interface UseRouteOptions {
  /** Called when route calculation completes. */
  onRouteComplete?: (routes: unknown[]) => void;
  /** Called when route calculation fails. */
  onRouteError?: (errorCode: number) => void;
}

export interface UseRouteReturn {
  isReady: boolean;
  addDestination: (
    destination: SphereMarker | Location,
    mode?: RouteMode
  ) => void;
  insertDestination: (
    index: number,
    destination: SphereMarker | Location,
    mode?: RouteMode
  ) => void;
  removeDestination: (destination: SphereMarker) => void;
  removeDestinationAt: (index: number) => void;
  clearDestinations: () => void;
  clearPath: () => void;
  clear: () => void;
  reverse: () => void;
  search: () => void;
  getDistance: (format?: boolean) => number | string;
  getInterval: (format?: boolean) => number | string;
  getGuide: (format?: boolean) => RouteGuideStep[] | HTMLElement;
  exportRouteLine: (options?: GeometryOptions) => SpherePolyline | null;
  listDestinations: () => SphereMarker[];
  size: () => number;
  setMode: (mode: RouteMode) => void;
  setModeAt: (index: number, mode: RouteMode) => void;
  enableRouteType: (routeType: RouteType, state: boolean) => void;
  setLabel: (label: RouteLabelType) => void;
  setAuto: (state: boolean) => void;
  setLanguage: (lang: Language) => void;
}

export function useRoute(options?: UseRouteOptions): UseRouteReturn {
  const { map, isReady } = useMap();

  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  useEffect(() => {
    if (!map) return;

    const handleComplete = (routes: unknown[]) => {
      callbacksRef.current?.onRouteComplete?.(routes);
    };
    const handleError = (errorCode: number) => {
      callbacksRef.current?.onRouteError?.(errorCode);
    };

    map.Event.bind("routeComplete", handleComplete);
    map.Event.bind("routeError", handleError);

    return () => {
      map.Event.unbind("routeComplete", handleComplete);
      map.Event.unbind("routeError", handleError);
    };
  }, [map]);

  const addDestination = useCallback(
    (destination: SphereMarker | Location, mode?: RouteMode) => {
      map?.Route?.add(destination, mode);
    },
    [map]
  );

  const insertDestination = useCallback(
    (index: number, destination: SphereMarker | Location, mode?: RouteMode) => {
      map?.Route?.insert(index, destination, mode);
    },
    [map]
  );

  const removeDestination = useCallback(
    (destination: SphereMarker) => {
      map?.Route?.remove(destination);
    },
    [map]
  );

  const removeDestinationAt = useCallback(
    (index: number) => {
      map?.Route?.removeAt(index);
    },
    [map]
  );

  const clearDestinations = useCallback(() => {
    map?.Route?.clearDestination();
  }, [map]);

  const clearPath = useCallback(() => {
    map?.Route?.clearPath();
  }, [map]);

  const clear = useCallback(() => {
    map?.Route?.clear();
  }, [map]);

  const reverse = useCallback(() => {
    map?.Route?.reverse();
  }, [map]);

  const search = useCallback(() => {
    map?.Route?.search();
  }, [map]);

  const getDistance = useCallback(
    (format = false): number | string => {
      return map?.Route?.distance(format) ?? 0;
    },
    [map]
  );

  const getInterval = useCallback(
    (format = false): number | string => {
      return map?.Route?.interval(format) ?? 0;
    },
    [map]
  );

  const getGuide = useCallback(
    (format = false): RouteGuideStep[] | HTMLElement => {
      const result = map?.Route?.guide(format);
      return (result as RouteGuideStep[] | HTMLElement) ?? [];
    },
    [map]
  );

  const exportRouteLine = useCallback(
    (options?: GeometryOptions): SpherePolyline | null => {
      return map?.Route?.exportRouteLine(options) ?? null;
    },
    [map]
  );

  const listDestinations = useCallback((): SphereMarker[] => {
    return map?.Route?.list() ?? [];
  }, [map]);

  const size = useCallback((): number => {
    return map?.Route?.size() ?? 0;
  }, [map]);

  const setMode = useCallback(
    (mode: RouteMode) => {
      map?.Route?.mode(mode);
    },
    [map]
  );

  const setModeAt = useCallback(
    (index: number, mode: RouteMode) => {
      map?.Route?.modeOf(index, mode);
    },
    [map]
  );

  const enableRouteType = useCallback(
    (routeType: RouteType, state: boolean) => {
      map?.Route?.enableRoute(routeType, state);
    },
    [map]
  );

  const setLabel = useCallback(
    (label: RouteLabelType) => {
      map?.Route?.label(label);
    },
    [map]
  );

  const setAuto = useCallback(
    (state: boolean) => {
      map?.Route?.auto(state);
    },
    [map]
  );

  const setLanguage = useCallback(
    (lang: Language) => {
      map?.Route?.language(lang);
    },
    [map]
  );

  return useMemo(
    () => ({
      isReady,
      addDestination,
      insertDestination,
      removeDestination,
      removeDestinationAt,
      clearDestinations,
      clearPath,
      clear,
      reverse,
      search,
      getDistance,
      getInterval,
      getGuide,
      exportRouteLine,
      listDestinations,
      size,
      setMode,
      setModeAt,
      enableRouteType,
      setLabel,
      setAuto,
      setLanguage,
    }),
    [
      isReady,
      addDestination,
      insertDestination,
      removeDestination,
      removeDestinationAt,
      clearDestinations,
      clearPath,
      clear,
      reverse,
      search,
      getDistance,
      getInterval,
      getGuide,
      exportRouteLine,
      listDestinations,
      size,
      setMode,
      setModeAt,
      enableRouteType,
      setLabel,
      setAuto,
      setLanguage,
    ]
  );
}
