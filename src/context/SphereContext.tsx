import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Bound,
  FilterType,
  FlyToOptions,
  Location,
  SphereMap,
  SphereNamespace,
} from "../types";

type PredefinedOverlay = "cameras" | "events" | "aqi";

type BuiltInLayer =
  | "SIMPLE"
  | "STREETS"
  | "STREETS_NIGHT"
  | "HYBRID"
  | "TRAFFIC"
  | "IMAGES"
  | "PM25"
  | "HOTSPOT"
  | "FLOOD"
  | "DROUGHT";

interface MapControls {
  isReady: boolean;
  goTo: (options: FlyToOptions, animate?: boolean) => void;
  setCenter: (location: Location, animate?: boolean) => void;
  setZoom: (zoom: number, animate?: boolean) => void;
  setBound: (bound: Bound, options?: object) => void;
  setRotate: (angle: number, animate?: boolean) => void;
  setPitch: (angle: number) => void;
  setFilter: (filter: FilterType | false) => void;
  setLanguage: (language: "th" | "en") => void;
  setBaseLayer: (layer: BuiltInLayer) => void;
  addLayer: (layer: BuiltInLayer) => void;
  removeLayer: (layer: BuiltInLayer) => void;
  loadPredefinedOverlay: (overlay: PredefinedOverlay) => void;
  unloadPredefinedOverlay: (overlay: PredefinedOverlay) => void;
  resize: () => void;
  repaint: () => void;
}

interface SphereContextValue {
  isLoaded: boolean;
  error: Error | null;
  sphere: SphereNamespace | null;
  apiKey: string;
  map: SphereMap | null;
  isMapReady: boolean;
  controls: MapControls;
  registerMap: (map: SphereMap) => void;
  unregisterMap: () => void;
}

interface SphereProviderProps {
  apiKey: string;
  children: ReactNode;
  scriptUrl?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const SphereContext = createContext<SphereContextValue | null>(null);

const SCRIPT_ID = "gistda-sphere-api-script";
let scriptLoadingPromise: Promise<void> | null = null;

function loadSphereScript(apiKey: string, customUrl?: string): Promise<void> {
  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  const existingScript = document.getElementById(SCRIPT_ID);
  if (existingScript) {
    if (window.sphere) {
      return Promise.resolve();
    }
    // Stale script element without a pending promise — remove and retry fresh
    existingScript.remove();
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "text/javascript";
    script.src =
      customUrl || `https://api.sphere.gistda.or.th/map/?key=${apiKey}`;
    script.async = true;

    // setTimeout(0) defers the check so the browser has time to execute the loaded script
    script.onload = () => {
      setTimeout(() => {
        if (window.sphere) {
          resolve();
        } else {
          reject(
            new Error("Sphere API loaded but window.sphere is not available")
          );
        }
      }, 0);
    };

    script.onerror = () => {
      script.remove();
      scriptLoadingPromise = null;
      reject(
        new Error(
          "Failed to load Sphere API script. This may be due to domain restrictions. " +
            "Ensure your API key is registered for your domain at https://sphere.gistda.or.th/"
        )
      );
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export function SphereProvider({
  apiKey,
  children,
  scriptUrl,
  onLoad,
  onError,
}: SphereProviderProps): ReactNode {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sphere, setSphere] = useState<SphereNamespace | null>(null);
  const [map, setMap] = useState<SphereMap | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<SphereMap | null>(null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setSphere(window.sphere ?? null);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(
    (err: Error) => {
      setError(err);
      onError?.(err);
    },
    [onError]
  );

  useEffect(() => {
    if (window.sphere) {
      handleLoad();
      return;
    }

    loadSphereScript(apiKey, scriptUrl).then(handleLoad).catch(handleError);
  }, [apiKey, scriptUrl, handleLoad, handleError]);

  const registerMap = useCallback((newMap: SphereMap) => {
    mapRef.current = newMap;
    setMap(newMap);
    setIsMapReady(true);
  }, []);

  const unregisterMap = useCallback(() => {
    mapRef.current = null;
    setMap(null);
    setIsMapReady(false);
  }, []);

  const goTo = useCallback((options: FlyToOptions, animate = true) => {
    mapRef.current?.goTo(options, animate);
  }, []);

  const setCenter = useCallback((location: Location, animate = true) => {
    mapRef.current?.location(location, animate);
  }, []);

  const setZoom = useCallback((zoom: number, animate = true) => {
    mapRef.current?.zoom(zoom, animate);
  }, []);

  const setBound = useCallback((bound: Bound, options?: object) => {
    mapRef.current?.bound(bound, options);
  }, []);

  const setRotate = useCallback((angle: number, animate = true) => {
    mapRef.current?.rotate(angle, animate);
  }, []);

  const setPitch = useCallback((angle: number) => {
    mapRef.current?.pitch(angle);
  }, []);

  const setFilter = useCallback((filter: FilterType | false) => {
    if (mapRef.current && window.sphere) {
      const filterValue =
        filter === false ? false : window.sphere.Filter[filter];
      mapRef.current.enableFilter(filterValue);
    }
  }, []);

  const setLanguage = useCallback((language: "th" | "en") => {
    mapRef.current?.language(language);
  }, []);

  const resize = useCallback(() => {
    mapRef.current?.resize();
  }, []);

  const repaint = useCallback(() => {
    mapRef.current?.repaint();
  }, []);

  const setBaseLayer = useCallback((layer: BuiltInLayer) => {
    const layerValue = window.sphere?.Layers?.[layer];
    if (mapRef.current && layerValue) {
      mapRef.current.Layers.setBase(layerValue);
    }
  }, []);

  const addLayer = useCallback((layer: BuiltInLayer) => {
    const layerValue = window.sphere?.Layers?.[layer];
    if (mapRef.current && layerValue) {
      mapRef.current.Layers.add(layerValue);
    }
  }, []);

  const removeLayer = useCallback((layer: BuiltInLayer) => {
    const layerValue = window.sphere?.Layers?.[layer];
    if (mapRef.current && layerValue) {
      mapRef.current.Layers.remove(layerValue);
    }
  }, []);

  const loadPredefinedOverlay = useCallback((overlay: PredefinedOverlay) => {
    const predefined = window.sphere?.Overlays?.[overlay];
    if (mapRef.current && predefined) {
      mapRef.current.Overlays.load(predefined);
    }
  }, []);

  const unloadPredefinedOverlay = useCallback((overlay: PredefinedOverlay) => {
    const predefined = window.sphere?.Overlays?.[overlay];
    if (mapRef.current && predefined) {
      mapRef.current.Overlays.unload(predefined);
    }
  }, []);

  const controls = useMemo<MapControls>(
    () => ({
      isReady: isMapReady && sphere !== null,
      goTo,
      setCenter,
      setZoom,
      setBound,
      setRotate,
      setPitch,
      setFilter,
      setLanguage,
      setBaseLayer,
      addLayer,
      removeLayer,
      loadPredefinedOverlay,
      unloadPredefinedOverlay,
      resize,
      repaint,
    }),
    [
      isMapReady,
      sphere,
      goTo,
      setCenter,
      setZoom,
      setBound,
      setRotate,
      setPitch,
      setFilter,
      setLanguage,
      setBaseLayer,
      addLayer,
      removeLayer,
      loadPredefinedOverlay,
      unloadPredefinedOverlay,
      resize,
      repaint,
    ]
  );

  const contextValue = useMemo<SphereContextValue>(
    () => ({
      isLoaded,
      error,
      sphere,
      apiKey,
      map,
      isMapReady,
      controls,
      registerMap,
      unregisterMap,
    }),
    [
      isLoaded,
      error,
      sphere,
      apiKey,
      map,
      isMapReady,
      controls,
      registerMap,
      unregisterMap,
    ]
  );

  return (
    <SphereContext.Provider value={contextValue}>
      {children}
    </SphereContext.Provider>
  );
}

export function useSphereContext(): SphereContextValue {
  const context = useContext(SphereContext);

  if (!context) {
    throw new Error("useSphereContext must be used within a SphereProvider");
  }

  return context;
}

export function useSphere(): {
  sphere: SphereNamespace | null;
  isLoaded: boolean;
  error: Error | null;
} {
  const { sphere, isLoaded, error } = useSphereContext();
  return { sphere, isLoaded, error };
}

export function useMap(): {
  map: SphereMap | null;
  sphere: SphereNamespace | null;
  isReady: boolean;
} {
  const { map, isMapReady, sphere } = useSphereContext();
  return { map, sphere, isReady: isMapReady && sphere !== null };
}

export function useMapControls(): MapControls {
  const { controls } = useSphereContext();
  return controls;
}

export { SphereContext };
export type {
  BuiltInLayer,
  MapControls,
  PredefinedOverlay,
  SphereContextValue,
  SphereProviderProps,
};
