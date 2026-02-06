import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useMapContext } from "../context/MapContext";
import { useSphereContext } from "../context/SphereContext";
import type {
  Bound,
  GeometryOptions,
  LineStyleType,
  Location,
  MarkerOptions,
  PopupOptions,
  Range,
  SpherePolygon,
} from "../types";

export interface PolygonProps {
  positions: Location[];
  title?: string;
  detail?: string;
  label?: string;
  labelOptions?: MarkerOptions;
  popup?: PopupOptions;
  visibleRange?: Range;
  lineWidth?: number;
  lineColor?: string;
  fillColor?: string;
  lineStyle?: LineStyleType;
  pivot?: Location;
  clickable?: boolean;
  draggable?: boolean;
  pointer?: boolean;
  zIndex?: number;
  editable?: boolean;
  onClick?: (polygon: SpherePolygon) => void;
  onDrag?: (polygon: SpherePolygon) => void;
  onDrop?: (polygon: SpherePolygon) => void;
}

export interface PolygonRef {
  getPolygon(): SpherePolygon | null;
  togglePopup(show?: boolean, location?: Location): void;
  getPivot(): Location | null;
  getCentroid(): Location | null;
  getBound(): Bound | null;
  getArea(language?: string): number | string | null;
  rotate(angle: number): void;
  updateStyle(options: Partial<GeometryOptions>): void;
  toGeoJSON(): object | null;
}

export const Polygon = forwardRef<PolygonRef, PolygonProps>(function Polygon(
  {
    positions,
    title,
    detail,
    label,
    labelOptions,
    popup,
    visibleRange,
    lineWidth,
    lineColor,
    fillColor,
    lineStyle,
    pivot,
    clickable,
    draggable,
    pointer,
    zIndex,
    editable,
    onClick,
    onDrag,
    onDrop,
  },
  ref,
) {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const polygonRef = useRef<SpherePolygon | null>(null);
  const callbacksRef = useRef({ onClick, onDrag, onDrop });

  useEffect(() => {
    callbacksRef.current = { onClick, onDrag, onDrop };
  }, [onClick, onDrag, onDrop]);

  useEffect(() => {
    if (!(isReady && map && sphere) || positions.length < 3) {
      return;
    }

    const options: GeometryOptions = {};

    if (title) {
      options.title = title;
    }
    if (detail) {
      options.detail = detail;
    }
    if (label) {
      options.label = label;
    }
    if (labelOptions) {
      options.labelOptions = labelOptions;
    }
    if (popup) {
      options.popup = popup;
    }
    if (visibleRange) {
      options.visibleRange = visibleRange;
    }
    if (typeof lineWidth === "number") {
      options.lineWidth = lineWidth;
    }
    if (lineColor) {
      options.lineColor = lineColor;
    }
    if (fillColor) {
      options.fillColor = fillColor;
    }
    if (lineStyle) {
      options.lineStyle = lineStyle;
    }
    if (pivot) {
      options.pivot = pivot;
    }
    if (typeof clickable === "boolean") {
      options.clickable = clickable;
    }
    if (typeof draggable === "boolean") {
      options.draggable = draggable;
    }
    if (typeof pointer === "boolean") {
      options.pointer = pointer;
    }
    if (typeof zIndex === "number") {
      options.zIndex = zIndex;
    }
    if (typeof editable === "boolean") {
      options.editable = editable;
    }

    const polygon = new sphere.Polygon(positions, options);
    polygonRef.current = polygon;

    map.Overlays.add(polygon);

    const handleOverlayClick = (data: { overlay: SpherePolygon }) => {
      if (data.overlay === polygon) {
        callbacksRef.current.onClick?.(polygon);
      }
    };

    const handleOverlayDrag = (overlay: SpherePolygon) => {
      if (overlay === polygon) {
        callbacksRef.current.onDrag?.(polygon);
      }
    };

    const handleOverlayDrop = (overlay: SpherePolygon) => {
      if (overlay === polygon) {
        callbacksRef.current.onDrop?.(polygon);
      }
    };

    map.Event.bind("overlayClick", handleOverlayClick);
    map.Event.bind("overlayDrag", handleOverlayDrag);
    map.Event.bind("overlayDrop", handleOverlayDrop);

    return () => {
      map.Event.unbind("overlayClick", handleOverlayClick);
      map.Event.unbind("overlayDrag", handleOverlayDrag);
      map.Event.unbind("overlayDrop", handleOverlayDrop);
      map.Overlays.remove(polygon);
      polygonRef.current = null;
    };
  }, [
    isReady,
    map,
    sphere,
    positions,
    title,
    detail,
    label,
    labelOptions,
    popup,
    visibleRange,
    lineWidth,
    lineColor,
    fillColor,
    lineStyle,
    pivot,
    clickable,
    draggable,
    pointer,
    zIndex,
    editable,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      getPolygon: () => polygonRef.current,
      togglePopup: (show?: boolean, location?: Location) => {
        polygonRef.current?.pop(show, location);
      },
      getPivot: () => polygonRef.current?.pivot() ?? null,
      getCentroid: () => polygonRef.current?.centroid() ?? null,
      getBound: () => polygonRef.current?.bound() ?? null,
      getArea: (language?: string) =>
        polygonRef.current?.size(language) ?? null,
      rotate: (angle: number) => {
        polygonRef.current?.rotate(angle);
      },
      updateStyle: (options: Partial<GeometryOptions>) => {
        polygonRef.current?.update(options);
      },
      toGeoJSON: () => polygonRef.current?.toJSON() ?? null,
    }),
    [],
  );

  return null;
});

export default Polygon;
