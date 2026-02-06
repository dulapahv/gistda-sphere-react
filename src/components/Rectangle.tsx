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
  Size,
  SphereRectangle,
} from "../types";

export interface RectangleProps {
  position: Location;
  size: Size | Location;
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
  editable?: boolean;
  zIndex?: number;
  onClick?: (rectangle: SphereRectangle) => void;
  onDrag?: (rectangle: SphereRectangle) => void;
  onDrop?: (rectangle: SphereRectangle) => void;
}

export interface RectangleRef {
  getRectangle(): SphereRectangle | null;
  togglePopup(show?: boolean, location?: Location): void;
  getBound(): Bound | null;
  getArea(language?: string): number | string | null;
  updateStyle(options: Partial<GeometryOptions>): void;
}

export const Rectangle = forwardRef<RectangleRef, RectangleProps>(
  function Rectangle(
    {
      position,
      size,
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
      editable,
      zIndex,
      onClick,
      onDrag,
      onDrop,
    },
    ref
  ) {
    const { map, isReady } = useMapContext();
    const { sphere } = useSphereContext();
    const rectangleRef = useRef<SphereRectangle | null>(null);
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
      if (typeof editable === "boolean") {
        options.editable = editable;
      }
      if (typeof zIndex === "number") {
        options.zIndex = zIndex;
      }

      const rectangle = new sphere.Rectangle(position, size, options);
      rectangleRef.current = rectangle;

      map.Overlays.add(rectangle);

      const handleOverlayClick = (data: { overlay: SphereRectangle }) => {
        if (data.overlay === rectangle) {
          callbacksRef.current.onClick?.(rectangle);
        }
      };

      const handleOverlayDrag = (overlay: SphereRectangle) => {
        if (overlay === rectangle) {
          callbacksRef.current.onDrag?.(rectangle);
        }
      };

      const handleOverlayDrop = (overlay: SphereRectangle) => {
        if (overlay === rectangle) {
          callbacksRef.current.onDrop?.(rectangle);
        }
      };

      map.Event.bind("overlayClick", handleOverlayClick);
      map.Event.bind("overlayDrag", handleOverlayDrag);
      map.Event.bind("overlayDrop", handleOverlayDrop);

      return () => {
        map.Event.unbind("overlayClick", handleOverlayClick);
        map.Event.unbind("overlayDrag", handleOverlayDrag);
        map.Event.unbind("overlayDrop", handleOverlayDrop);
        map.Overlays.remove(rectangle);
        rectangleRef.current = null;
      };
    }, [
      isReady,
      map,
      sphere,
      position,
      size,
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
      editable,
      zIndex,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        getRectangle: () => rectangleRef.current,
        togglePopup: (show?: boolean, location?: Location) => {
          rectangleRef.current?.pop(show, location);
        },
        getBound: () => rectangleRef.current?.bound() ?? null,
        getArea: (language?: string) =>
          rectangleRef.current?.size(language) ?? null,
        updateStyle: (options: Partial<GeometryOptions>) => {
          rectangleRef.current?.update(options);
        },
      }),
      []
    );

    return null;
  }
);

export default Rectangle;
