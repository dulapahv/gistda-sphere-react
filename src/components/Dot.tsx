import { type Ref, useEffect, useImperativeHandle, useRef } from "react";
import { useMapContext } from "../context/MapContext";
import { useSphereContext } from "../context/SphereContext";
import type { GeometryOptions, Location, Range, SphereDot } from "../types";

export interface DotRef {
  getDot(): SphereDot | null;
  setPosition(location: Location): void;
  getPosition(): Location | null;
}

export interface DotProps {
  position: Location;
  ref?: Ref<DotRef>;
  title?: string;
  detail?: string;
  visibleRange?: Range;
  lineWidth?: number;
  lineColor?: string;
  clickable?: boolean;
  draggable?: boolean;
  zIndex?: number;
  onClick?: (dot: SphereDot) => void;
  onDrag?: (dot: SphereDot) => void;
  onDrop?: (dot: SphereDot, location: Location) => void;
}

export function Dot({
  position,
  ref,
  title,
  detail,
  visibleRange,
  lineWidth,
  lineColor,
  clickable,
  draggable,
  zIndex,
  onClick,
  onDrag,
  onDrop,
}: DotProps) {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const dotRef = useRef<SphereDot | null>(null);
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
    if (visibleRange) {
      options.visibleRange = visibleRange;
    }
    if (typeof lineWidth === "number") {
      options.lineWidth = lineWidth;
    }
    if (lineColor) {
      options.lineColor = lineColor;
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

    const dot = new sphere.Dot(position, options);
    dotRef.current = dot;

    map.Overlays.add(dot);

    const handleOverlayClick = (data: { overlay: SphereDot }) => {
      if (data.overlay === dot) {
        callbacksRef.current.onClick?.(dot);
      }
    };

    const handleOverlayDrag = (overlay: SphereDot) => {
      if (overlay === dot) {
        callbacksRef.current.onDrag?.(dot);
      }
    };

    const handleOverlayDrop = (overlay: SphereDot) => {
      if (overlay === dot) {
        const newLocation = dot.location() as Location;
        callbacksRef.current.onDrop?.(dot, newLocation);
      }
    };

    map.Event.bind("overlayClick", handleOverlayClick);
    map.Event.bind("overlayDrag", handleOverlayDrag);
    map.Event.bind("overlayDrop", handleOverlayDrop);

    return () => {
      map.Event.unbind("overlayClick", handleOverlayClick);
      map.Event.unbind("overlayDrag", handleOverlayDrag);
      map.Event.unbind("overlayDrop", handleOverlayDrop);
      map.Overlays.remove(dot);
      dotRef.current = null;
    };
  }, [
    isReady,
    map,
    sphere,
    position,
    title,
    detail,
    visibleRange,
    lineWidth,
    lineColor,
    clickable,
    draggable,
    zIndex,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      getDot: () => dotRef.current,
      setPosition: (location: Location) => {
        dotRef.current?.location(location);
      },
      getPosition: () => (dotRef.current?.location() as Location) ?? null,
    }),
    []
  );

  return null;
}
