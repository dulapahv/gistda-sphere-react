import { useEffect, useRef } from "react";
import { useMapContext } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import { withoutUndefined } from "@/internal/geometry";
import { useDeepMemo, useLatest } from "@/internal/hooks";
import { addMapLayer } from "@/internal/mapControls";
import type {
  Bound,
  BuiltInLayer,
  LayerOptions,
  LayerType,
  Range,
  SphereLayer,
  TilesetInfo,
} from "@/types";

export interface LayerProps {
  attribution?: string;
  /** Add the layer below this MapLibre layer ID (default: below map labels). */
  beforeId?: string;
  bound?: Bound;
  extraQuery?: string;
  /** Image MIME type (WMS/WMTS) or file extension (XYZ/TMS/WMTS_REST); `false` omits it. */
  format?: string | false;
  id?: string;
  /** Use this layer as the base map instead of adding it on top. */
  isBase?: boolean;
  /**
   * A ready-made layer to add as-is: a `sphere.Layer`, a deck.gl
   * `MapboxLayer`, or a MapLibre layer specification object.
   */
  layer?: SphereLayer | object;
  /** Tiles3D/I3S: loaders.gl options under `3d-tiles`, `i3s` or `tileset` keys. */
  loadOptions?: Record<string, unknown>;
  /** Raster layer name, or the name of a 3D layer. */
  name?: string;
  /** Tiles3D/I3S: called once the tileset has loaded (e.g. to fly to it). */
  onTilesetLoad?: (tileset: TilesetInfo) => void;
  opacity?: number;
  /** Extra raw options for `new sphere.Layer()`. */
  options?: Record<string, unknown>;
  /** Tiles3D: point cloud point radius in pixels. */
  pointSize?: number;
  /** Use a built-in Sphere layer. */
  preset?: BuiltInLayer;
  /** Auto-refresh interval in seconds. */
  refresh?: number;
  source?: Range;
  srs?: string;
  /**
   * A MapLibre style specification object or style JSON URL. Use for vector
   * styles, heatmaps, clustering and other custom MapLibre layers.
   */
  style?: string | object;
  styles?: string;
  tileMatrixPrefix?: string;
  type?: LayerType;
  url?: string;
  version?: string;
  zIndex?: number;
  zoomOffset?: number;
  zoomRange?: Range;
}

/**
 * Adds a layer to the map (or sets the base map with `isBase`). Supports
 * built-in layers, raster tile services (WMS, WMTS, TMS, XYZ), vector
 * styles, 3D tiles (Tiles3D, I3S) and raw deck.gl/MapLibre layers.
 */
export function Layer({
  name,
  preset,
  style,
  layer: rawLayer,
  isBase = false,
  type,
  url,
  zoomRange,
  source,
  opacity,
  zIndex,
  bound,
  attribution,
  extraQuery,
  id,
  format,
  srs,
  tileMatrixPrefix,
  styles,
  version,
  refresh,
  zoomOffset,
  beforeId,
  loadOptions,
  pointSize,
  onTilesetLoad,
  options: extraOptions,
}: LayerProps): null {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const layerRef = useRef<SphereLayer | object | null>(null);
  const onTilesetLoadRef = useLatest(onTilesetLoad);
  const hasTilesetHandler = onTilesetLoad !== undefined;

  const stableStyle = useDeepMemo(style);
  const stableOptions = useDeepMemo(
    withoutUndefined<LayerOptions & Record<string, unknown>>({
      ...extraOptions,
      attribution,
      bound,
      extraQuery,
      format,
      id,
      loadOptions,
      opacity,
      pointSize,
      refresh,
      source,
      srs,
      styles,
      tileMatrixPrefix,
      type,
      url,
      version,
      zIndex,
      zoomOffset,
      zoomRange,
    })
  );

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }

    let layer: SphereLayer | object | null = null;
    if (rawLayer) {
      layer = rawLayer;
    } else if (preset) {
      layer = sphere.Layers[preset] ?? null;
    } else if (stableStyle) {
      layer = new sphere.Layer(stableStyle);
    } else if (name !== undefined) {
      const layerOptions: LayerOptions & Record<string, unknown> = {
        ...stableOptions,
      };
      if (hasTilesetHandler) {
        layerOptions.onTilesetLoad = (tileset) =>
          onTilesetLoadRef.current?.(tileset);
      }
      layer = new sphere.Layer(name, layerOptions);
    }

    if (!layer) {
      return;
    }

    layerRef.current = layer;
    let removeLayer: (() => void) | undefined;
    if (isBase) {
      map.Layers.setBase(layer);
    } else {
      removeLayer = addMapLayer(map, layer, beforeId);
    }

    return () => {
      removeLayer?.();
      if (layerRef.current === layer) {
        layerRef.current = null;
      }
    };
  }, [
    isReady,
    map,
    sphere,
    rawLayer,
    preset,
    stableStyle,
    name,
    stableOptions,
    hasTilesetHandler,
    onTilesetLoadRef,
    isBase,
    beforeId,
  ]);

  return null;
}
