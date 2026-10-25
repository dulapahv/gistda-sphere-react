import type {
  Bound,
  BuiltInLayer,
  FilterType,
  FitBoundsOptions,
  FlyToOptions,
  Language,
  Location,
  Point,
  PredefinedOverlay,
  PredefinedOverlayConfig,
  Range,
  SphereLayer,
  SphereMap,
  SphereNamespace,
} from "@/types";
import { fromFilterValue, toFilterValue } from "./enums";
import { isLocation } from "./geometry";

/** Built-in layer names, used to tell presets apart from style URLs. */
export const BUILT_IN_LAYERS: readonly BuiltInLayer[] = [
  "SIMPLE",
  "STREETS",
  "STREETS_NIGHT",
  "HYBRID",
  "TRAFFIC",
  "IMAGES",
  "PM25",
  "HOTSPOT",
  "FLOOD",
  "DROUGHT",
];

/**
 * A layer reference: a built-in layer name, a `sphere.Layer`, a style URL,
 * or a MapLibre style/layer object.
 */
export type LayerInput = BuiltInLayer | SphereLayer | string | object;

/** Options applied to a predefined overlay before it is loaded. */
export type PredefinedOverlayOptions = Pick<
  PredefinedOverlayConfig,
  "motion" | "popup" | "refresh"
>;

/** Where the map is looking. */
export interface MapView {
  /** The visible bounding box. */
  bound: Bound;
  center: Location;
  /** Tilt in degrees. */
  pitch: number;
  /** Rotation in degrees, clockwise from north. */
  rotate: number;
  zoom: number;
}

/** Reads a map's current view. */
export function readView(map: SphereMap): MapView {
  const { lat, lon } = map.location();
  return {
    bound: map.bound(),
    center: { lat, lon },
    pitch: map.pitch(),
    rotate: map.rotate(),
    zoom: map.zoom(),
  };
}

/** Imperative map controls shared by `useMapControls` and `SphereMapRef`. */
export interface MapControls {
  /** Add a non-base layer (built-in name, `sphere.Layer`, deck.gl or MapLibre layer). */
  addLayer: (layer: LayerInput, beforeId?: string) => void;
  /** Remove every non-base layer. */
  clearLayers: () => void;
  getBound: () => Bound | null;
  getCenter: () => Location | null;
  getFilter: () => FilterType | null;
  getLanguage: () => Language | null;
  /** Layers currently on the map. */
  getLayers: () => object[];
  getPitch: () => number | null;
  getRotate: () => number | null;
  /** Center, zoom, rotation, tilt and visible bounding box in one object. */
  getView: () => MapView | null;
  getZoom: () => number | null;
  getZoomRange: () => Range | null;
  /** Move/zoom/rotate/tilt in one call (`animate: false` jumps). */
  goTo: (options: FlyToOptions, animate?: boolean) => void;
  isReady: boolean;
  /** Load a live overlay (`cameras`, `events`, `aqi`), optionally configuring it first. */
  loadPredefinedOverlay: (
    overlay: PredefinedOverlay,
    options?: PredefinedOverlayOptions
  ) => void;
  /** Pan by a pixel offset. */
  panBy: (offset: Point, animate?: boolean) => void;
  removeLayer: (layer: LayerInput) => void;
  repaint: () => void;
  resize: () => void;
  /** Replace the base map (built-in name, `sphere.Layer`, style URL or style object). */
  setBaseLayer: (layer: LayerInput) => void;
  /** Fit the map to a bounding box. */
  setBound: (bound: Bound, options?: FitBoundsOptions) => void;
  setCenter: (location: Location, animate?: boolean) => void;
  /** Apply a color filter, or `false`/`"None"` to remove it. */
  setFilter: (filter: FilterType | false) => void;
  /** Language of map labels and all built-in UI. */
  setLanguage: (language: Language) => void;
  setPitch: (angle: number) => void;
  setRotate: (angle: number, animate?: boolean) => void;
  setZoom: (zoom: number, animate?: boolean) => void;
  setZoomRange: (range: Range) => void;
  unloadPredefinedOverlay: (overlay: PredefinedOverlay) => void;
  zoomIn: (animate?: boolean) => void;
  zoomOut: (animate?: boolean) => void;
}

/** A layer `addMapLayer` asked Sphere to add that it has not added yet. */
interface PendingLayer {
  layer: SphereLayer | object;
  /** Runs once this layer has been added and, if requested, removed. */
  onSettled?: () => void;
  /** Removal was requested while the layer was still loading. */
  removeWhenAdded: boolean;
}

/** Layers each map is still adding, oldest first. */
const pendingLayers = new WeakMap<SphereMap, PendingLayer[]>();

/** A layer's id, which Sphere also gives the deck.gl layer of 3D tiles. */
function layerId(layer: unknown): string | undefined {
  const id = (layer as { id?: unknown } | undefined)?.id;
  return typeof id === "string" ? id : undefined;
}

/** Whether a `layerChange` event announces `layer`. */
function isSameLayer(layer: object, added: unknown): boolean {
  if (added === layer) {
    return true;
  }
  // 3D tiles are added as a separate deck.gl layer with the same id.
  const id = layerId(layer);
  return id !== undefined && layerId(added) === id;
}

/** Drops a pending entry that will never be added. */
function dropPending(pending: PendingLayer[], entry: PendingLayer): void {
  const index = pending.indexOf(entry);
  if (index >= 0) {
    pending.splice(index, 1);
  }
}

/** The map's pending layers, listening for their `layerChange` once per map. */
function pendingLayersOf(map: SphereMap): PendingLayer[] {
  const existing = pendingLayers.get(map);
  if (existing) {
    return existing;
  }
  const pending: PendingLayer[] = [];
  pendingLayers.set(map, pending);
  map.Event.bind("layerChange", (added?: unknown) => {
    // Every add is announced once, so each announcement settles one add.
    const index = pending.findIndex((candidate) =>
      isSameLayer(candidate.layer, added)
    );
    if (index < 0) {
      return;
    }
    const [entry] = pending.splice(index, 1);
    if (!entry) {
      return;
    }
    if (entry.removeWhenAdded) {
      // After the current announcement, so other listeners see it in order.
      queueMicrotask(() => {
        map.Layers.remove(entry.layer);
        entry.onSettled?.();
      });
    } else {
      entry.onSettled?.();
    }
  });
  return pending;
}

/** The newest pending entry for a layer with this id, if any. */
function lastPendingWithId(
  pending: PendingLayer[],
  id: string | undefined
): PendingLayer | undefined {
  if (id === undefined) {
    return;
  }
  for (let index = pending.length - 1; index >= 0; index -= 1) {
    const candidate = pending[index];
    if (candidate && layerId(candidate.layer) === id) {
      return candidate;
    }
  }
}

/**
 * Adds a layer and returns a function that removes it. Sphere adds a layer
 * only once its style (a style URL or 3D tileset) has loaded and the map
 * style is ready, and each add of a loading layer adds it again when its
 * style arrives. Removing before then has no effect, so such a layer is
 * removed as soon as Sphere adds it.
 *
 * Sphere removes 3D tile layers by id. A layer whose id matches one that is
 * still loading but already removed waits until that one is gone.
 * Otherwise, removing the old layer would remove the new one too. React StrictMode hits
 * this on every mount: it adds a layer, removes it and adds it again.
 */
export function addMapLayer(
  map: SphereMap,
  layer: SphereLayer | object,
  beforeId?: string
): () => void {
  const pending = pendingLayersOf(map);
  const predecessor = lastPendingWithId(pending, layerId(layer));
  const entry: PendingLayer = { layer, removeWhenAdded: false };
  pending.push(entry);
  if (predecessor?.removeWhenAdded) {
    predecessor.onSettled = () => {
      if (entry.removeWhenAdded) {
        // Removed before its turn: skip it and let the next one go.
        dropPending(pending, entry);
        entry.onSettled?.();
      } else {
        map.Layers.add(layer, beforeId);
      }
    };
  } else {
    map.Layers.add(layer, beforeId);
  }

  let isRemoved = false;
  return () => {
    if (isRemoved) {
      return;
    }
    isRemoved = true;
    if (pending.includes(entry)) {
      entry.removeWhenAdded = true;
    } else {
      map.Layers.remove(layer);
    }
  };
}

/**
 * Removal functions for layers added with `addLayer`, per map and keyed by
 * the resolved input, so `removeLayer` also finds layers added by style URL.
 */
const addedLayers = new WeakMap<SphereMap, Map<unknown, () => void>>();

/** Resolves a layer input to something `map.Layers` accepts. */
export function resolveLayer(
  sphere: SphereNamespace,
  layer: LayerInput
): SphereLayer | object | string | null {
  if (typeof layer === "string") {
    return (BUILT_IN_LAYERS as readonly string[]).includes(layer)
      ? (sphere.Layers[layer as BuiltInLayer] ?? null)
      : layer;
  }
  return layer;
}

/** Reads a numeric getter result, ignoring chained (`this`) returns. */
function asNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

/**
 * Creates the imperative map controls. All methods are no-ops (or return
 * `null`) while the map or the API is unavailable.
 */
export function createMapControls(
  getMap: () => SphereMap | null,
  getSphere: () => SphereNamespace | null | undefined,
  isReady: boolean
): MapControls {
  const withMap = (action: (map: SphereMap) => void) => () => {
    const map = getMap();
    if (map) {
      action(map);
    }
  };

  return {
    addLayer: (layer, beforeId) => {
      const map = getMap();
      const sphere = getSphere();
      const resolved = sphere ? resolveLayer(sphere, layer) : null;
      if (!(map && sphere && resolved)) {
        return;
      }
      const target =
        typeof resolved === "string" ? new sphere.Layer(resolved) : resolved;
      const removers = addedLayers.get(map) ?? new Map<unknown, () => void>();
      addedLayers.set(map, removers);
      removers.set(resolved, addMapLayer(map, target, beforeId));
    },
    clearLayers: () =>
      withMap((map) => {
        // Layers still loading would otherwise appear after the clear.
        for (const remove of addedLayers.get(map)?.values() ?? []) {
          remove();
        }
        addedLayers.delete(map);
        map.Layers.clear();
      })(),
    getBound: () => {
      const value = getMap()?.bound();
      return value && "minLon" in value ? (value as Bound) : null;
    },
    getCenter: () => {
      const value = getMap()?.location();
      return isLocation(value) ? { lat: value.lat, lon: value.lon } : null;
    },
    getFilter: () => {
      const map = getMap();
      const sphere = getSphere();
      return map && sphere
        ? (fromFilterValue(sphere, map.enableFilter()) ?? null)
        : null;
    },
    getLanguage: () => {
      const value = getMap()?.language();
      return value === "th" || value === "en" ? value : null;
    },
    getLayers: () => getMap()?.Layers.list() ?? [],
    getPitch: () => asNumber(getMap()?.pitch()),
    getRotate: () => asNumber(getMap()?.rotate()),
    getView: () => {
      const map = getMap();
      return map ? readView(map) : null;
    },
    getZoom: () => asNumber(getMap()?.zoom()),
    getZoomRange: () => {
      const value = getMap()?.zoomRange();
      return value && "min" in value ? (value as Range) : null;
    },
    goTo: (options, animate = true) => {
      // `rotate` matches the SphereMap prop, and MapLibre calls it `bearing`.
      const { rotate, ...rest } = options;
      getMap()?.goTo(
        rotate === undefined ? rest : { bearing: rotate, ...rest },
        animate
      );
    },
    isReady,
    loadPredefinedOverlay: (overlay, options) => {
      const map = getMap();
      const config = getSphere()?.Overlays?.[overlay];
      if (map && config) {
        if (options) {
          Object.assign(config, options);
        }
        map.Overlays.load(config);
      }
    },
    panBy: (offset, animate = true) => {
      getMap()?.move(offset, animate);
    },
    removeLayer: (layer) => {
      const map = getMap();
      const sphere = getSphere();
      const resolved = sphere ? resolveLayer(sphere, layer) : null;
      if (!(map && resolved)) {
        return;
      }
      const removers = addedLayers.get(map);
      const remove = removers?.get(resolved);
      if (remove) {
        removers?.delete(resolved);
        remove();
      } else if (typeof resolved !== "string") {
        map.Layers.remove(resolved);
      }
    },
    repaint: () => withMap((map) => map.repaint())(),
    resize: () => withMap((map) => map.resize())(),
    setBaseLayer: (layer) => {
      const map = getMap();
      const sphere = getSphere();
      const resolved = sphere ? resolveLayer(sphere, layer) : null;
      if (map && resolved) {
        map.Layers.setBase(resolved);
      }
    },
    setBound: (bound, options) => {
      getMap()?.bound(bound, options);
    },
    setCenter: (location, animate = true) => {
      getMap()?.location(location, animate);
    },
    setFilter: (filter) => {
      const map = getMap();
      const sphere = getSphere();
      if (map && sphere) {
        map.enableFilter(toFilterValue(sphere, filter));
      }
    },
    setLanguage: (language) => {
      getMap()?.language(language);
    },
    setPitch: (angle) => {
      getMap()?.pitch(angle);
    },
    setRotate: (angle, animate = true) => {
      getMap()?.rotate(angle, animate);
    },
    setZoom: (zoom, animate = true) => {
      getMap()?.zoom(zoom, animate);
    },
    setZoomRange: (range) => {
      getMap()?.zoomRange(range);
    },
    unloadPredefinedOverlay: (overlay) => {
      const map = getMap();
      const config = getSphere()?.Overlays?.[overlay];
      if (map && config) {
        map.Overlays.unload(config);
      }
    },
    zoomIn: (animate = true) => {
      getMap()?.zoom(true, animate);
    },
    zoomOut: (animate = true) => {
      getMap()?.zoom(false, animate);
    },
  };
}
