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
import { useLatest } from "@/internal/hooks";
import { createMapControls, type MapControls } from "@/internal/mapControls";
import type {
  PoiResult,
  PopupOptions,
  SphereMap,
  SphereNamespace,
} from "@/types";

interface SphereContextValue {
  apiKey: string;
  controls: MapControls;
  error: Error | null;
  isLoaded: boolean;
  isMapReady: boolean;
  map: SphereMap | null;
  registerMap: (map: SphereMap) => void;
  sphere: SphereNamespace | null;
  /**
   * Unregisters a map (the active one when omitted). When it was the active
   * map, the most recently registered remaining map becomes active.
   */
  unregisterMap: (map?: SphereMap) => void;
}

interface SphereProviderProps {
  apiKey: string;
  children: ReactNode;
  /**
   * Customize the content of the POI popups Sphere shows for tags and
   * search results. Return the element to display.
   */
  formatPoi?: (poi: PoiResult, language: string) => HTMLElement;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  /**
   * Replace the popup options Sphere uses for POIs entirely (e.g. to load
   * details from your own service). Takes priority over `formatPoi`.
   */
  poiPopupOptions?: (
    source: string,
    id: string,
    name: string,
    language: string
  ) => PopupOptions;
  scriptUrl?: string;
}

const SphereContext = createContext<SphereContextValue | null>(null);

const SCRIPT_ID = "gistda-sphere-api-script";
let scriptLoadingPromise: Promise<void> | null = null;

/** Loads the Sphere script once per page and resolves when `window.sphere` exists. */
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

/**
 * Installs the POI popup customization hooks on `sphere.Util` and returns
 * a function that restores the previous implementations.
 */
function installPoiHooks(
  sphere: SphereNamespace,
  formatPoi: SphereProviderProps["formatPoi"] | undefined,
  poiPopupOptions: SphereProviderProps["poiPopupOptions"] | undefined
): () => void {
  const util = sphere.Util;
  const previousFormat = util.formatPoi;
  const previousOptions = util.poiPopupOptions;
  if (formatPoi) {
    util.formatPoi = formatPoi;
  }
  if (poiPopupOptions) {
    util.poiPopupOptions = poiPopupOptions;
  }
  return () => {
    util.formatPoi = previousFormat;
    util.poiPopupOptions = previousOptions;
  };
}

/** Loads the Sphere API and provides it (and the active map) to descendants. */
export function SphereProvider({
  apiKey,
  children,
  scriptUrl,
  onLoad,
  onError,
  formatPoi,
  poiPopupOptions,
}: SphereProviderProps): ReactNode {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sphere, setSphere] = useState<SphereNamespace | null>(null);
  const [map, setMap] = useState<SphereMap | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<SphereMap | null>(null);
  /** Maps that are ready, in the order they became ready. */
  const mapsRef = useRef<SphereMap[]>([]);
  const onLoadRef = useLatest(onLoad);
  const onErrorRef = useLatest(onError);
  const formatPoiRef = useLatest(formatPoi);
  const poiPopupOptionsRef = useLatest(poiPopupOptions);
  const hasFormatPoi = formatPoi !== undefined;
  const hasPoiPopupOptions = poiPopupOptions !== undefined;

  // Callbacks are read through refs so that inline `onLoad`/`onError`
  // functions don't reload the script or fire again on every render.
  useEffect(() => {
    let isActive = true;
    const handleLoad = () => {
      if (!isActive) {
        return;
      }
      setIsLoaded(true);
      setSphere(window.sphere ?? null);
      onLoadRef.current?.();
    };

    if (window.sphere) {
      handleLoad();
    } else {
      loadSphereScript(apiKey, scriptUrl)
        .then(handleLoad)
        .catch((err: Error) => {
          if (isActive) {
            setError(err);
            onErrorRef.current?.(err);
          }
        });
    }

    return () => {
      isActive = false;
    };
  }, [apiKey, scriptUrl, onLoadRef, onErrorRef]);

  useEffect(() => {
    if (!(sphere && (hasFormatPoi || hasPoiPopupOptions))) {
      return;
    }
    return installPoiHooks(
      sphere,
      hasFormatPoi
        ? (poi, language) =>
            formatPoiRef.current?.(poi, language) ??
            document.createElement("div")
        : undefined,
      hasPoiPopupOptions
        ? (source, id, name, language) =>
            poiPopupOptionsRef.current?.(source, id, name, language) ?? {}
        : undefined
    );
  }, [
    sphere,
    hasFormatPoi,
    hasPoiPopupOptions,
    formatPoiRef,
    poiPopupOptionsRef,
  ]);

  const activateMap = useCallback((nextMap: SphereMap | null) => {
    mapRef.current = nextMap;
    setMap(nextMap);
    setIsMapReady(nextMap !== null);
  }, []);

  const registerMap = useCallback(
    (newMap: SphereMap) => {
      mapsRef.current = [
        ...mapsRef.current.filter((existing) => existing !== newMap),
        newMap,
      ];
      activateMap(newMap);
    },
    [activateMap]
  );

  const unregisterMap = useCallback(
    (oldMap?: SphereMap) => {
      const target = oldMap ?? mapRef.current;
      mapsRef.current = mapsRef.current.filter(
        (existing) => existing !== target
      );
      if (mapRef.current === target) {
        activateMap(mapsRef.current.at(-1) ?? null);
      }
    },
    [activateMap]
  );

  const controlsReady = isMapReady && sphere !== null;
  const controls = useMemo<MapControls>(
    () =>
      createMapControls(
        () => mapRef.current,
        () => window.sphere,
        controlsReady
      ),
    [controlsReady]
  );

  const contextValue = useMemo<SphereContextValue>(
    () => ({
      apiKey,
      controls,
      error,
      isLoaded,
      isMapReady,
      map,
      registerMap,
      sphere,
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

/** Raw context access. Throws outside a `SphereProvider`. */
export function useSphereContext(): SphereContextValue {
  const context = useContext(SphereContext);

  if (!context) {
    throw new Error("useSphereContext must be used within a SphereProvider");
  }

  return context;
}

/** The loaded `window.sphere` namespace and its loading state. */
export function useSphere(): {
  sphere: SphereNamespace | null;
  isLoaded: boolean;
  error: Error | null;
} {
  const { sphere, isLoaded, error } = useSphereContext();
  return { error, isLoaded, sphere };
}

/** The active map instance and whether it is ready. */
export function useMap(): {
  map: SphereMap | null;
  sphere: SphereNamespace | null;
  isReady: boolean;
} {
  const { map, isMapReady, sphere } = useSphereContext();
  return { isReady: isMapReady && sphere !== null, map, sphere };
}

/** Imperative controls for the active map. */
export function useMapControls(): MapControls {
  const { controls } = useSphereContext();
  return controls;
}

export type { MapControls } from "@/internal/mapControls";
export type { SphereContextValue, SphereProviderProps };
export { SphereContext };
