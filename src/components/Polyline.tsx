import { type Ref, useEffect, useImperativeHandle, useRef } from "react";
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
  SpherePolyline,
} from "../types";

export interface PolylineRef {
  getPolyline(): SpherePolyline | null;
  togglePopup(show?: boolean, location?: Location): void;
  getPivot(): Location | null;
  getCentroid(): Location | null;
  getBound(): Bound | null;
  getLength(language?: string): number | string | null;
  rotate(angle: number): void;
  updateStyle(options: Partial<GeometryOptions>): void;
}

export interface PolylineProps {
  positions: Location[];
  ref?: Ref<PolylineRef>;
  title?: string;
  detail?: string;
  label?: string;
  labelOptions?: MarkerOptions;
  popup?: PopupOptions;
  visibleRange?: Range;
  lineWidth?: number;
  lineColor?: string;
  lineStyle?: LineStyleType;
  pivot?: Location;
  clickable?: boolean;
  draggable?: boolean;
  pointer?: boolean;
  zIndex?: number;
  onClick?: (polyline: SpherePolyline) => void;
  onDrag?: (polyline: SpherePolyline) => void;
  onDrop?: (polyline: SpherePolyline) => void;
}

export function Polyline({
  positions,
  ref,
  title,
  detail,
  label,
  labelOptions,
  popup,
  visibleRange,
  lineWidth,
  lineColor,
  lineStyle,
  pivot,
  clickable,
  draggable,
  pointer,
  zIndex,
  onClick,
  onDrag,
  onDrop,
}: PolylineProps) {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const polylineRef = useRef<SpherePolyline | null>(null);
  const callbacksRef = useRef({ onClick, onDrag, onDrop });

  useEffect(() => {
    callbacksRef.current = { onClick, onDrag, onDrop };
  }, [onClick, onDrag, onDrop]);

  useEffect(() => {
    if (!(isReady && map && sphere) || positions.length < 2) {
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

    const polyline = new sphere.Polyline(positions, options);
    polylineRef.current = polyline;

    map.Overlays.add(polyline);

    const handleOverlayClick = (data: { overlay: SpherePolyline }) => {
      if (data.overlay === polyline) {
        callbacksRef.current.onClick?.(polyline);
      }
    };

    const handleOverlayDrag = (overlay: SpherePolyline) => {
      if (overlay === polyline) {
        callbacksRef.current.onDrag?.(polyline);
      }
    };

    const handleOverlayDrop = (overlay: SpherePolyline) => {
      if (overlay === polyline) {
        callbacksRef.current.onDrop?.(polyline);
      }
    };

    map.Event.bind("overlayClick", handleOverlayClick);
    map.Event.bind("overlayDrag", handleOverlayDrag);
    map.Event.bind("overlayDrop", handleOverlayDrop);

    return () => {
      map.Event.unbind("overlayClick", handleOverlayClick);
      map.Event.unbind("overlayDrag", handleOverlayDrag);
      map.Event.unbind("overlayDrop", handleOverlayDrop);
      map.Overlays.remove(polyline);
      polylineRef.current = null;
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
    lineStyle,
    pivot,
    clickable,
    draggable,
    pointer,
    zIndex,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      getPolyline: () => polylineRef.current,
      togglePopup: (show?: boolean, location?: Location) => {
        polylineRef.current?.pop(show, location);
      },
      getPivot: () => polylineRef.current?.pivot() ?? null,
      getCentroid: () => polylineRef.current?.centroid() ?? null,
      getBound: () => polylineRef.current?.bound() ?? null,
      getLength: (language?: string) =>
        polylineRef.current?.size(language) ?? null,
      rotate: (angle: number) => {
        polylineRef.current?.rotate(angle);
      },
      updateStyle: (options: Partial<GeometryOptions>) => {
        polylineRef.current?.update(options);
      },
    }),
    []
  );

  return null;
}
