import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { MapProvider } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import { toFilterValue, toUiComponentValue } from "@/internal/enums";
import { isDeepEqual, useDeepMemo, useLatest } from "@/internal/hooks";
import {
  createMapControls,
  type LayerInput,
  type MapControls,
  resolveLayer,
} from "@/internal/mapControls";
import type {
  FilterType,
  GeoJSONFeature,
  Language,
  Location,
  MapOptions,
  MenuEvent,
  PointerLocation,
  Range,
  RouteResult,
  SphereLayer,
  SphereMap as SphereMapInstance,
  SphereNamespace,
  SphereOverlay,
  SpherePopup,
  UiComponentMode,
  UiControlName,
  WheelEventData,
} from "@/types";

/** Visibility of built-in UI controls, keyed by control name. */
export type UiControlsConfig = Partial<Record<UiControlName, boolean>>;

export interface SphereMapRef extends Omit<MapControls, "isReady"> {
  /** The underlying `sphere.Map` instance. */
  getMap: () => SphereMapInstance | null;
}

/** Event callback props, one per Sphere event. */
export interface SphereMapEventProps {
  /** Return `false` to cancel the context menu; use `menu.add()` to add items. */
  // biome-ignore lint/suspicious/noConfusingVoidType: returning false cancels the menu
  onBeforeContextMenu?: (menu: MenuEvent) => void | boolean;
  onClick?: (location: PointerLocation) => void;
  onContextMenu?: () => void;
  onDoubleClick?: (location: PointerLocation) => void;
  onDrag?: () => void;
  /** Features drawn with the built-in toolbar. */
  onDrawCreate?: (features: GeoJSONFeature[]) => void;
  /** Features deleted with the built-in toolbar. */
  onDrawDelete?: (features: GeoJSONFeature[]) => void;
  onDrop?: () => void;
  onError?: (error: Error) => void;
  onFullscreen?: (isFullscreen: boolean) => void;
  onIdle?: () => void;
  onLayerChange?: (
    added: SphereLayer | object | undefined,
    removed?: SphereLayer | object
  ) => void;
  /** Map center changed. */
  onLocation?: (location: Location) => void;
  onMouseMove?: (location: PointerLocation) => void;
  onOverlayChange?: (overlay?: SphereOverlay) => void;
  onOverlayClick?: (overlay: SphereOverlay, location: Location) => void;
  onOverlayDrag?: (overlay: SphereOverlay) => void;
  onOverlayDrop?: (overlay: SphereOverlay) => void;
  onOverlayHover?: (overlay: SphereOverlay) => void;
  onOverlayLeave?: (overlay: SphereOverlay) => void;
  /** Predefined overlay data loaded. */
  onOverlayLoad?: (data: unknown) => void;
  onOverlayUpdate?: (overlay: SphereOverlay) => void;
  onPitch?: (angle: number) => void;
  onPopupClose?: (popup: SpherePopup) => void;
  onReady?: (map: SphereMapInstance) => void;
  onRepaint?: () => void;
  onResize?: () => void;
  onRotate?: (angle: number) => void;
  onRouteComplete?: (routes: RouteResult[]) => void;
  onRouteError?: (status: number) => void;
  onTileLoaded?: (sourceId: string) => void;
  onTileLoading?: (sourceId: string) => void;
  /** Drawing toolbar mode changed. */
  onToolbarChange?: (mode: string) => void;
  onTooltipChange?: (message: unknown) => void;
  onWheel?: (data: WheelEventData) => void;
  onZoom?: (zoom: number) => void;
  onZoomRange?: (range: Range) => void;
}

export interface SphereMapProps extends SphereMapEventProps {
  /**
   * Base map: a built-in layer name, a `sphere.Layer`, a MapLibre style URL
   * or style object. Changing it swaps the base map.
   */
  baseLayer?: LayerInput;
  /** Initial center. Use `ref`/`useMapControls` to move the map afterwards. */
  center?: Location;
  children?: ReactNode;
  className?: string;
  /** Show or hide built-in UI controls, e.g. `{ DPad: false, Scale: true }`. */
  controls?: UiControlsConfig;
  /** Color filter. Changing it updates the map; removing it clears the filter. */
  filter?: FilterType;
  id?: string;
  /** Allow user input (initial value). */
  input?: boolean;
  /** Label and UI language. Changing it updates the map in place. */
  language?: Language;
  /** Restore the last viewed location/zoom from local storage. */
  lastView?: boolean;
  /**
   * Extra options for `new sphere.Map()`, including MapLibre map options
   * such as `maxPitch`, `minPitch`, `hash` or `bearing`.
   */
  options?: Record<string, unknown>;
  /** Initial pitch (tilt) in degrees. */
  pitch?: number;
  ref?: Ref<SphereMapRef>;
  /** Initial rotation in degrees clockwise from north. */
  rotate?: number;
  style?: CSSProperties;
  /** Built-in UI mode. Defaults to fitting the container size. */
  ui?: UiComponentMode;
  /** Initial zoom level. */
  zoom?: number;
  /** Allowed zoom range. Changing it updates the map. */
  zoomRange?: Range;
}

type MapCallbacks = SphereMapEventProps;

/**
 * Sphere event name -> callback prop. Events whose handlers receive no
 * useful data (zoom, location, rotate, pitch) are given the current value.
 */
const EVENT_BINDINGS: readonly [
  eventName: Parameters<SphereMapInstance["Event"]["bind"]>[0],
  prop: keyof MapCallbacks,
  transform?: (map: SphereMapInstance, args: unknown[]) => unknown[],
][] = [
  ["beforeContextmenu", "onBeforeContextMenu"],
  ["click", "onClick"],
  ["contextmenu", "onContextMenu"],
  ["doubleClick", "onDoubleClick"],
  ["drag", "onDrag"],
  ["drawCreate", "onDrawCreate"],
  ["drawDelete", "onDrawDelete"],
  ["drop", "onDrop"],
  ["fullscreen", "onFullscreen"],
  ["idle", "onIdle"],
  ["layerChange", "onLayerChange"],
  ["location", "onLocation", (map) => [map.location()]],
  ["mousemove", "onMouseMove"],
  ["overlayChange", "onOverlayChange"],
  ["overlayClick", "onOverlayClick"],
  ["overlayDrag", "onOverlayDrag"],
  ["overlayDrop", "onOverlayDrop"],
  ["overlayHover", "onOverlayHover"],
  ["overlayLeave", "onOverlayLeave"],
  ["overlayLoad", "onOverlayLoad"],
  ["overlayUpdate", "onOverlayUpdate"],
  ["pitch", "onPitch", (map) => [map.pitch()]],
  ["popupClose", "onPopupClose"],
  ["repaint", "onRepaint"],
  ["resize", "onResize"],
  ["rotate", "onRotate", (map) => [map.rotate()]],
  ["routeComplete", "onRouteComplete"],
  ["routeError", "onRouteError"],
  ["tileLoaded", "onTileLoaded"],
  ["tileLoading", "onTileLoading"],
  ["toolbarChange", "onToolbarChange"],
  ["tooltipChange", "onTooltipChange"],
  ["wheel", "onWheel"],
  ["zoom", "onZoom", (map) => [map.zoom()]],
  ["zoomRange", "onZoomRange"],
];

/** Normalizes whatever the runtime reports as an error into an `Error`. */
function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === "object" && value !== null && "message" in value) {
    return new Error(String((value as { message: unknown }).message));
  }
  return new Error(String(value));
}

/** Resolves a base layer input into a layer usable as the `layer` map option. */
function toInitialBaseLayer(
  sphere: SphereNamespace,
  baseLayer: LayerInput
): SphereLayer | undefined {
  const resolved = resolveLayer(sphere, baseLayer);
  if (!resolved) {
    return undefined;
  }
  if (typeof resolved === "string") {
    return new sphere.Layer(resolved);
  }
  return "style" in resolved
    ? (resolved as SphereLayer)
    : new sphere.Layer(resolved);
}

/** Applies `controls` visibility to the built-in UI controls. */
function applyControls(map: SphereMapInstance, controls: UiControlsConfig) {
  for (const [name, visible] of Object.entries(controls)) {
    if (typeof visible === "boolean") {
      map.Ui[name as UiControlName]?.visible(visible);
    }
  }
}

/** The map container. Children (overlays, layers…) render once the map is ready. */
export function SphereMap({
  children,
  ref,
  zoom = 7,
  zoomRange,
  center,
  language = "th",
  input = true,
  lastView = false,
  ui,
  filter,
  rotate,
  pitch,
  baseLayer,
  controls,
  options: extraOptions,
  className,
  style,
  id,
  ...callbacks
}: SphereMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SphereMapInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { sphere, isLoaded, registerMap, unregisterMap } = useSphereContext();
  const callbacksRef = useLatest<MapCallbacks>(callbacks);

  const stableZoomRange = useDeepMemo(zoomRange);
  const stableControls = useDeepMemo(controls);
  const stableBaseLayer = useDeepMemo(baseLayer);
  const appliedBaseLayerRef = useRef<LayerInput | undefined>(undefined);
  const appliedZoomRangeRef = useRef<Range | undefined>(zoomRange);
  const previousFilterRef = useRef<FilterType | undefined>(filter);

  const initialPropsRef = useRef({
    baseLayer,
    center,
    controls,
    extraOptions,
    filter,
    input,
    language,
    lastView,
    pitch,
    rotate,
    ui,
    zoom,
    zoomRange,
  });

  useEffect(() => {
    if (!(isLoaded && sphere && containerRef.current)) {
      return;
    }

    const initial = initialPropsRef.current;
    let map: SphereMapInstance;

    try {
      const options: MapOptions = {
        ...initial.extraOptions,
        input: initial.input,
        language: initial.language,
        lastView: initial.lastView,
        placeholder: containerRef.current,
        zoom: initial.zoom,
      };
      if (initial.zoomRange) {
        options.zoomRange = initial.zoomRange;
      }
      if (!initial.input && options.interactive === undefined) {
        // Sphere passes `input || true` to MapLibre, so `input: false`
        // alone never disables interaction.
        options.interactive = false;
      }
      if (initial.center) {
        options.location = initial.center;
      }
      if (initial.ui) {
        options.ui = toUiComponentValue(sphere, initial.ui);
      }
      if (initial.baseLayer !== undefined) {
        options.layer = toInitialBaseLayer(sphere, initial.baseLayer);
        appliedBaseLayerRef.current = initial.baseLayer;
      }

      map = new sphere.Map(options);
    } catch (error) {
      callbacksRef.current.onError?.(toError(error));
      return;
    }

    mapRef.current = map;

    const handlers: [string, (...args: unknown[]) => unknown][] = [];
    for (const [eventName, prop, transform] of EVENT_BINDINGS) {
      const handler = (...args: unknown[]) => {
        const callback = callbacksRef.current[prop] as
          | ((...callbackArgs: unknown[]) => unknown)
          | undefined;
        if (!callback) {
          return;
        }
        return callback(...(transform ? transform(map, args) : args));
      };
      map.Event.bind(eventName, handler as never);
      handlers.push([eventName, handler]);
    }

    const handleError = (error: unknown) => {
      callbacksRef.current.onError?.(toError(error));
    };
    map.Event.bind("error", handleError);

    const handleReady = () => {
      if (initial.filter) {
        map.enableFilter(toFilterValue(sphere, initial.filter));
      }
      if (typeof initial.rotate === "number") {
        map.rotate(initial.rotate, false);
      }
      if (typeof initial.pitch === "number") {
        map.pitch(initial.pitch);
      }
      if (initial.controls) {
        applyControls(map, initial.controls);
      }
      setIsReady(true);
      registerMap(map);
      callbacksRef.current.onReady?.(map);
    };
    map.Event.bind("ready", handleReady);

    return () => {
      for (const [eventName, handler] of handlers) {
        map.Event.unbind(eventName as never, handler as never);
      }
      map.Event.unbind("error", handleError);
      map.Event.unbind("ready", handleReady);
      unregisterMap(map);
      mapRef.current = null;
      setIsReady(false);
      // Free the WebGL context; Sphere has no destroy API of its own.
      try {
        map.Renderer?.remove();
      } catch {
        // The renderer may not have finished initializing; nothing to free.
      }
    };
  }, [isLoaded, sphere, registerMap, unregisterMap, callbacksRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (isReady && map && language && map.language() !== language) {
      map.language(language);
    }
  }, [isReady, language]);

  useEffect(() => {
    const map = mapRef.current;
    const previousFilter = previousFilterRef.current;
    previousFilterRef.current = filter;
    if (!(isReady && map && sphere)) {
      return;
    }
    if (filter) {
      map.enableFilter(toFilterValue(sphere, filter));
    } else if (previousFilter) {
      // The prop was removed: clear the filter it applied.
      map.enableFilter(false);
    }
  }, [isReady, sphere, filter]);

  useEffect(() => {
    const map = mapRef.current;
    if (
      isReady &&
      map &&
      stableZoomRange &&
      !isDeepEqual(stableZoomRange, appliedZoomRangeRef.current)
    ) {
      map.zoomRange(stableZoomRange);
      appliedZoomRangeRef.current = stableZoomRange;
    }
  }, [isReady, stableZoomRange]);

  useEffect(() => {
    const map = mapRef.current;
    if (isReady && map && stableControls) {
      applyControls(map, stableControls);
    }
  }, [isReady, stableControls]);

  useEffect(() => {
    const map = mapRef.current;
    if (
      !(isReady && map && sphere) ||
      stableBaseLayer === undefined ||
      stableBaseLayer === appliedBaseLayerRef.current
    ) {
      return;
    }
    const resolved = resolveLayer(sphere, stableBaseLayer);
    if (resolved) {
      map.Layers.setBase(resolved);
      appliedBaseLayerRef.current = stableBaseLayer;
    }
  }, [isReady, sphere, stableBaseLayer]);

  useImperativeHandle(ref, () => {
    const { isReady: _ignored, ...methods } = createMapControls(
      () => mapRef.current,
      () => window.sphere,
      true
    );
    return { ...methods, getMap: () => mapRef.current };
  }, []);

  const containerStyle: CSSProperties = {
    height: "100%",
    width: "100%",
    ...style,
  };

  return (
    <div
      className={className}
      id={id}
      ref={containerRef}
      style={containerStyle}
    >
      <MapProvider isReady={isReady} map={mapRef.current}>
        {isReady && children}
      </MapProvider>
    </div>
  );
}
