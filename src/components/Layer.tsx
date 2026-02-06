import { useEffect, useRef } from "react";
import { useMapContext } from "../context/MapContext";
import { useSphereContext } from "../context/SphereContext";
import type {
  Bound,
  BuiltInLayer,
  LayerOptions,
  LayerType,
  Range,
  SphereLayer,
} from "../types";

export interface LayerProps {
  name?: string;
  preset?: BuiltInLayer;
  isBase?: boolean;
  type?: LayerType;
  url?: string;
  zoomRange?: Range;
  source?: Range;
  opacity?: number;
  zIndex?: number;
  bound?: Bound;
  attribution?: string;
  extraQuery?: string;
  id?: string;
  format?: string;
  srs?: string;
  tileMatrixPrefix?: string;
  styles?: string;
  version?: string;
  refresh?: number;
  zoomOffset?: number;
  beforeId?: string;
}

export function Layer({
  name,
  preset,
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
}: LayerProps): null {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const layerRef = useRef<SphereLayer | null>(null);

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }

    let layer: SphereLayer | null = null;

    if (preset && sphere.Layers[preset]) {
      layer = sphere.Layers[preset];
    } else if (name) {
      const options: LayerOptions = {};

      if (type) {
        options.type = type;
      }
      if (url) {
        options.url = url;
      }
      if (zoomRange) {
        options.zoomRange = zoomRange;
      }
      if (source) {
        options.source = source;
      }
      if (typeof opacity === "number") {
        options.opacity = opacity;
      }
      if (typeof zIndex === "number") {
        options.zIndex = zIndex;
      }
      if (bound) {
        options.bound = bound;
      }
      if (attribution) {
        options.attribution = attribution;
      }
      if (extraQuery) {
        options.extraQuery = extraQuery;
      }
      if (id) {
        options.id = id;
      }
      if (format) {
        options.format = format;
      }
      if (srs) {
        options.srs = srs;
      }
      if (tileMatrixPrefix) {
        options.tileMatrixPrefix = tileMatrixPrefix;
      }
      if (styles) {
        options.styles = styles;
      }
      if (version) {
        options.version = version;
      }
      if (typeof refresh === "number") {
        options.refresh = refresh;
      }
      if (typeof zoomOffset === "number") {
        options.zoomOffset = zoomOffset;
      }

      layer = new sphere.Layer(name, options);
    } else {
      return;
    }

    layerRef.current = layer;

    if (isBase) {
      map.Layers.setBase(layer as SphereLayer);
    } else {
      map.Layers.add(layer as SphereLayer, beforeId);
    }

    return () => {
      if (!isBase && layerRef.current) {
        map.Layers.remove(layerRef.current as SphereLayer);
      }
      layerRef.current = null;
    };
  }, [
    isReady,
    map,
    sphere,
    name,
    preset,
    isBase,
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
  ]);

  return null;
}

export default Layer;
