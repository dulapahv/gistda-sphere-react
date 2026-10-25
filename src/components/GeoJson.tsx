import { type Ref, useEffect, useImperativeHandle, useRef } from "react";
import { useMapContext } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import {
  computeBound,
  toFeatures,
  toRenderableGeometries,
} from "@/internal/geojson";
import { toSphereGeometryOptions, withoutUndefined } from "@/internal/geometry";
import { useDeepMemo, useLatest } from "@/internal/hooks";
import type {
  Bound,
  FitBoundsOptions,
  GeoJSON,
  GeoJSONFeature,
  GeoJSONGeometry,
  GeometryOptions,
  Location,
  MarkerOptions,
  SphereNamespace,
  SphereOverlay,
} from "@/types";

export interface GeoJsonRef {
  /** Bounding box of the data. */
  getBound: () => Bound | null;
  /** Overlays created for the data. */
  getOverlays: () => SphereOverlay[];
}

export interface GeoJsonProps {
  /** A GeoJSON geometry, feature or feature collection. Memoize large data. */
  data: GeoJSON;
  /** Fit the map to the data after rendering (`true` or fit options). */
  fitBounds?: boolean | FitBoundsOptions;
  /** Options for point features rendered as markers, or a function per feature. */
  markerOptions?:
    | MarkerOptions
    | ((feature: GeoJSONFeature) => MarkerOptions | undefined);
  onClick?: (
    feature: GeoJSONFeature,
    overlay: SphereOverlay,
    location: Location
  ) => void;
  onHover?: (feature: GeoJSONFeature, overlay: SphereOverlay) => void;
  onLeave?: (feature: GeoJSONFeature, overlay: SphereOverlay) => void;
  /** Render points as markers (default) or as dots styled with `style`. */
  pointType?: "marker" | "dot";
  ref?: Ref<GeoJsonRef>;
  /** Style for lines, polygons and dots, or a function per feature. */
  style?:
    | GeometryOptions
    | ((feature: GeoJSONFeature) => GeometryOptions | undefined);
}

/** Resolves a static-or-per-feature option. */
function resolveOption<T>(
  option: T | ((feature: GeoJSONFeature) => T | undefined) | undefined,
  feature: GeoJSONFeature
): T | undefined {
  return typeof option === "function"
    ? (option as (feature: GeoJSONFeature) => T | undefined)(feature)
    : option;
}

/** Creates the Sphere overlay for one simple geometry. */
function createOverlay(
  sphere: SphereNamespace,
  geometry: GeoJSONGeometry,
  feature: GeoJSONFeature,
  props: Pick<GeoJsonProps, "markerOptions" | "pointType" | "style">
): SphereOverlay | null {
  // Sphere adopts (and overwrites the properties of) feature objects passed
  // in, so always hand it a fresh feature wrapping the geometry.
  const input: GeoJSONFeature = { geometry, properties: {}, type: "Feature" };
  const style = toSphereGeometryOptions(
    sphere,
    resolveOption(props.style, feature) ?? {}
  );
  switch (geometry.type) {
    case "Point":
      if (props.pointType === "dot") {
        return new sphere.Dot(input, style);
      }
      return new sphere.Marker(
        input,
        withoutUndefined(resolveOption(props.markerOptions, feature) ?? {})
      );
    case "LineString":
    case "MultiLineString":
      return new sphere.Polyline(input, style);
    case "Polygon":
    case "MultiPolygon":
      return new sphere.Polygon(input, style);
    default:
      return null;
  }
}

/**
 * Renders GeoJSON data as Sphere overlays: points as markers (or dots),
 * lines as polylines and polygons as polygons. Pair with the converters in
 * `useSphereUtils` to show KML, GPX, WKT and other formats.
 */
export function GeoJson({
  data,
  style,
  markerOptions,
  pointType = "marker",
  fitBounds,
  onClick,
  onHover,
  onLeave,
  ref,
}: GeoJsonProps): null {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const overlaysRef = useRef<Map<SphereOverlay, GeoJSONFeature>>(new Map());
  const callbacksRef = useLatest({ onClick, onHover, onLeave });
  const stableStyle = useDeepMemo(style);
  const stableMarkerOptions = useDeepMemo(markerOptions);
  const stableFitBounds = useDeepMemo(fitBounds);

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }
    const created = new Map<SphereOverlay, GeoJSONFeature>();
    for (const feature of toFeatures(data)) {
      for (const geometry of toRenderableGeometries(feature.geometry)) {
        const overlay = createOverlay(sphere, geometry, feature, {
          markerOptions: stableMarkerOptions,
          pointType,
          style: stableStyle,
        });
        if (overlay) {
          map.Overlays.add(overlay);
          created.set(overlay, feature);
        }
      }
    }
    overlaysRef.current = created;

    if (stableFitBounds) {
      const bound = computeBound(data);
      if (bound) {
        map.bound(
          bound,
          typeof stableFitBounds === "object"
            ? stableFitBounds
            : { padding: 40 }
        );
      }
    }

    return () => {
      for (const overlay of created.keys()) {
        map.Overlays.remove(overlay);
      }
      if (overlaysRef.current === created) {
        overlaysRef.current = new Map();
      }
    };
  }, [
    isReady,
    map,
    sphere,
    data,
    stableStyle,
    stableMarkerOptions,
    pointType,
    stableFitBounds,
  ]);

  useEffect(() => {
    if (!(isReady && map)) {
      return;
    }
    const featureOf = (overlay: SphereOverlay) =>
      overlaysRef.current.get(overlay);
    const handleClick = (overlay: SphereOverlay, location: Location) => {
      const feature = featureOf(overlay);
      if (feature) {
        callbacksRef.current.onClick?.(feature, overlay, location);
      }
    };
    const handleHover = (overlay: SphereOverlay) => {
      const feature = featureOf(overlay);
      if (feature) {
        callbacksRef.current.onHover?.(feature, overlay);
      }
    };
    const handleLeave = (overlay: SphereOverlay) => {
      const feature = featureOf(overlay);
      if (feature) {
        callbacksRef.current.onLeave?.(feature, overlay);
      }
    };
    map.Event.bind("overlayClick", handleClick);
    map.Event.bind("overlayHover", handleHover);
    map.Event.bind("overlayLeave", handleLeave);
    return () => {
      map.Event.unbind("overlayClick", handleClick);
      map.Event.unbind("overlayHover", handleHover);
      map.Event.unbind("overlayLeave", handleLeave);
    };
  }, [isReady, map, callbacksRef]);

  useImperativeHandle(
    ref,
    () => ({
      getBound: () => computeBound(data),
      getOverlays: () => [...overlaysRef.current.keys()],
    }),
    [data]
  );

  return null;
}
