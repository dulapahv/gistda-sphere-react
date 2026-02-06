import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useMapContext } from "../context/MapContext";
import { useSphereContext } from "../context/SphereContext";
import type {
  Bound,
  GeometryOptions,
  LineStyleType,
  Location,
  PopupOptions,
  Range,
  SphereCircle,
} from "../types";

export interface CircleProps {
  center: Location;
  radius: number;
  title?: string;
  detail?: string;
  popup?: PopupOptions;
  visibleRange?: Range;
  lineWidth?: number;
  lineColor?: string;
  fillColor?: string;
  lineStyle?: LineStyleType;
  clickable?: boolean;
  draggable?: boolean;
  zIndex?: number;
  onClick?: (circle: SphereCircle) => void;
  onDrag?: (circle: SphereCircle) => void;
  onDrop?: (circle: SphereCircle) => void;
}

export interface CircleRef {
  getCircle(): SphereCircle | null;
  togglePopup(show?: boolean, location?: Location): void;
  getCenter(): Location | null;
  getBound(): Bound | null;
  getArea(language?: string): number | string | null;
  getRadius(language?: string): number | string | null;
  updateStyle(options: Partial<GeometryOptions>): void;
}

export const Circle = forwardRef<CircleRef, CircleProps>(function Circle(
  {
    center,
    radius,
    title,
    detail,
    popup,
    visibleRange,
    lineWidth,
    lineColor,
    fillColor,
    lineStyle,
    clickable,
    draggable,
    zIndex,
    onClick,
    onDrag,
    onDrop,
  },
  ref
) {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const circleRef = useRef<SphereCircle | null>(null);
  const callbacksRef = useRef({ onClick, onDrag, onDrop });

  useEffect(() => {
    callbacksRef.current = { onClick, onDrag, onDrop };
  }, [onClick, onDrag, onDrop]);

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }

    const options: GeometryOptions = {};

    if (title) {
      options.title = title;
    }
    if (detail) {
      options.detail = detail;
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
    if (typeof clickable === "boolean") {
      options.clickable = clickable;
    }
    if (typeof draggable === "boolean") {
      options.draggable = draggable;
    }
    if (typeof zIndex === "number") {
      options.zIndex = zIndex;
    }

    const circle = new sphere.Circle(center, radius, options);
    circleRef.current = circle;

    map.Overlays.add(circle);

    const handleOverlayClick = (data: { overlay: SphereCircle }) => {
      if (data.overlay === circle) {
        callbacksRef.current.onClick?.(circle);
      }
    };

    const handleOverlayDrag = (overlay: SphereCircle) => {
      if (overlay === circle) {
        callbacksRef.current.onDrag?.(circle);
      }
    };

    const handleOverlayDrop = (overlay: SphereCircle) => {
      if (overlay === circle) {
        callbacksRef.current.onDrop?.(circle);
      }
    };

    map.Event.bind("overlayClick", handleOverlayClick);
    map.Event.bind("overlayDrag", handleOverlayDrag);
    map.Event.bind("overlayDrop", handleOverlayDrop);

    return () => {
      map.Event.unbind("overlayClick", handleOverlayClick);
      map.Event.unbind("overlayDrag", handleOverlayDrag);
      map.Event.unbind("overlayDrop", handleOverlayDrop);
      map.Overlays.remove(circle);
      circleRef.current = null;
    };
  }, [
    isReady,
    map,
    sphere,
    center,
    radius,
    title,
    detail,
    popup,
    visibleRange,
    lineWidth,
    lineColor,
    fillColor,
    lineStyle,
    clickable,
    draggable,
    zIndex,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      getCircle: () => circleRef.current,
      togglePopup: (show?: boolean, location?: Location) => {
        circleRef.current?.pop(show, location);
      },
      getCenter: () => (circleRef.current?.location() as Location) ?? null,
      getBound: () => circleRef.current?.bound() ?? null,
      getArea: (language?: string) => circleRef.current?.size(language) ?? null,
      getRadius: (language?: string) =>
        circleRef.current?.radius(language) ?? null,
      updateStyle: (options: Partial<GeometryOptions>) => {
        circleRef.current?.update(options);
      },
    }),
    []
  );

  return null;
});

export default Circle;
