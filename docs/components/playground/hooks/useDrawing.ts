import type { LineStyleType, Location } from "gistda-sphere-react";
import { useCallback, useRef, useState } from "react";
import type { DrawingMode } from "../constants";
import type { Shape, ShapeHandle, ShapeKind } from "../types";

/** Style applied to every drawn shape; changes update shapes in place. */
export interface DrawingStyle {
  /** Let users drag the vertices of polygons and rectangles. */
  editable: boolean;
  /** Show each shape's name on the map. */
  labels: boolean;
  lineStyle: LineStyleType;
  lineWidth: number;
}

const DEFAULT_STYLE: DrawingStyle = {
  editable: false,
  labels: false,
  lineStyle: "Solid",
  lineWidth: 3,
};

const EMPTY_COUNTERS: Record<ShapeKind, number> = {
  circle: 0,
  dot: 0,
  marker: 0,
  polygon: 0,
  polyline: 0,
  rectangle: 0,
};

/** Points closer than this (in degrees) are the two clicks of a double-click. */
const SAME_POINT_EPSILON = 1e-9;

/** Whether two locations are the same point. */
function isSamePoint(a: Location, b: Location): boolean {
  return (
    Math.abs(a.lat - b.lat) < SAME_POINT_EPSILON &&
    Math.abs(a.lon - b.lon) < SAME_POINT_EPSILON
  );
}

/** Drops consecutive duplicate points (left behind by double-clicks). */
function withoutRepeats(points: Location[]): Location[] {
  return points.filter(
    (point, index) => index === 0 || !isSamePoint(point, points[index - 1])
  );
}

/** Minimum vertices needed to finish a shape in the given mode. */
function minimumPoints(mode: DrawingMode): number {
  return mode === "polygon" ? 3 : 2;
}

type NewShape = Shape extends infer S
  ? S extends Shape
    ? Omit<S, "id" | "number">
    : never
  : never;

export interface UseDrawingReturn {
  /** First click of a circle (center) or rectangle (corner). */
  anchor: Location | null;
  /** Ref callback that registers a shape component's handle. */
  bindRef: (id: string) => (handle: ShapeHandle | null) => void;
  /** Discard the shape in progress. */
  cancel: () => void;
  /** Whether the in-progress polygon/polyline has enough points. */
  canFinish: boolean;
  clearAll: () => void;
  /** Points of the polygon/polyline in progress. */
  draft: Location[];
  /** Complete the polygon/polyline in progress. */
  finish: () => void;
  getHandle: (id: string) => ShapeHandle | undefined;
  /** Handle a map click in the current mode. Returns whether it was used. */
  handleClick: (location: Location) => boolean;
  mode: DrawingMode;
  /** Update a marker or dot after the user dragged it. */
  moveShape: (id: string, position: Location) => void;
  removeShape: (id: string) => void;
  setMode: (mode: DrawingMode) => void;
  setStyle: (changes: Partial<DrawingStyle>) => void;
  shapes: Shape[];
  style: DrawingStyle;
  /** Remove the last point of the shape in progress. */
  undo: () => void;
}

/** State and actions of the playground's drawing tools. */
export function useDrawing(): UseDrawingReturn {
  const [mode, setModeState] = useState<DrawingMode>("none");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [draft, setDraft] = useState<Location[]>([]);
  const [anchor, setAnchor] = useState<Location | null>(null);
  const [style, setStyleState] = useState<DrawingStyle>(DEFAULT_STYLE);

  const nextIdRef = useRef(1);
  const countersRef = useRef<Record<ShapeKind, number>>({ ...EMPTY_COUNTERS });
  const handlesRef = useRef(new Map<string, ShapeHandle>());
  const refCallbacksRef = useRef(
    new Map<string, (handle: ShapeHandle | null) => void>()
  );

  const addShape = useCallback((shape: NewShape) => {
    countersRef.current[shape.kind] += 1;
    const created = {
      ...shape,
      id: `${shape.kind}-${nextIdRef.current}`,
      number: countersRef.current[shape.kind],
    } as Shape;
    nextIdRef.current += 1;
    setShapes((previous) => [...previous, created]);
  }, []);

  const cancel = useCallback(() => {
    setDraft([]);
    setAnchor(null);
  }, []);

  const setMode = useCallback(
    (next: DrawingMode) => {
      setModeState(next);
      cancel();
    },
    [cancel]
  );

  const finish = useCallback(() => {
    const points = withoutRepeats(draft);
    if (mode !== "polygon" && mode !== "polyline") {
      return;
    }
    if (points.length < minimumPoints(mode)) {
      return;
    }
    addShape({ kind: mode, positions: points });
    setDraft([]);
  }, [addShape, draft, mode]);

  const handleClick = useCallback(
    (location: Location): boolean => {
      switch (mode) {
        case "marker":
        case "dot":
          addShape({ kind: mode, position: location });
          return true;
        case "polygon":
        case "polyline":
          setDraft((previous) => [...previous, location]);
          return true;
        case "circle":
          if (!anchor) {
            setAnchor(location);
            return true;
          }
          addShape({
            center: anchor,
            kind: "circle",
            radius: Math.hypot(
              location.lon - anchor.lon,
              location.lat - anchor.lat
            ),
          });
          setAnchor(null);
          return true;
        case "rectangle":
          if (!anchor) {
            setAnchor(location);
            return true;
          }
          addShape({
            kind: "rectangle",
            position: {
              lat: Math.max(location.lat, anchor.lat),
              lon: Math.min(location.lon, anchor.lon),
            },
            size: {
              height: Math.abs(location.lat - anchor.lat),
              width: Math.abs(location.lon - anchor.lon),
            },
          });
          setAnchor(null);
          return true;
        default:
          return false;
      }
    },
    [addShape, anchor, mode]
  );

  const undo = useCallback(() => {
    if (anchor) {
      setAnchor(null);
      return;
    }
    setDraft((previous) => previous.slice(0, -1));
  }, [anchor]);

  const moveShape = useCallback((id: string, position: Location) => {
    setShapes((previous) =>
      previous.map((shape) =>
        shape.id === id && (shape.kind === "marker" || shape.kind === "dot")
          ? { ...shape, position }
          : shape
      )
    );
  }, []);

  const removeShape = useCallback((id: string) => {
    setShapes((previous) => previous.filter((shape) => shape.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setShapes([]);
    cancel();
    countersRef.current = { ...EMPTY_COUNTERS };
  }, [cancel]);

  const bindRef = useCallback((id: string) => {
    const existing = refCallbacksRef.current.get(id);
    if (existing) {
      return existing;
    }
    const callback = (handle: ShapeHandle | null) => {
      if (handle) {
        handlesRef.current.set(id, handle);
      } else {
        handlesRef.current.delete(id);
        refCallbacksRef.current.delete(id);
      }
    };
    refCallbacksRef.current.set(id, callback);
    return callback;
  }, []);

  const getHandle = useCallback((id: string) => handlesRef.current.get(id), []);

  const setStyle = useCallback((changes: Partial<DrawingStyle>) => {
    setStyleState((previous) => ({ ...previous, ...changes }));
  }, []);

  const isLineMode = mode === "polygon" || mode === "polyline";

  return {
    anchor,
    bindRef,
    cancel,
    canFinish:
      isLineMode && withoutRepeats(draft).length >= minimumPoints(mode),
    clearAll,
    draft,
    finish,
    getHandle,
    handleClick,
    mode,
    moveShape,
    removeShape,
    setMode,
    setStyle,
    shapes,
    style,
    undo,
  };
}
