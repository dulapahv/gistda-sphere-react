import { useCallback, useMemo, useState } from "react";
import type { Icon, Location, PopupOptions, Range } from "../types";

interface BaseOverlay {
  id: string;
}

export interface MarkerData extends BaseOverlay {
  clickable?: boolean;
  detail?: string;
  draggable?: boolean;
  icon?: Icon;
  popup?: PopupOptions;
  position: Location;
  rotate?: number;
  title?: string;
  visibleRange?: Range;
  zIndex?: number;
}

export interface PolygonData extends BaseOverlay {
  clickable?: boolean;
  detail?: string;
  draggable?: boolean;
  editable?: boolean;
  fillColor?: string;
  lineColor?: string;
  lineStyle?: "Solid" | "Dashed" | "Dot";
  lineWidth?: number;
  popup?: PopupOptions;
  positions: Location[];
  title?: string;
  visibleRange?: Range;
  zIndex?: number;
}

export interface PolylineData extends BaseOverlay {
  clickable?: boolean;
  detail?: string;
  draggable?: boolean;
  editable?: boolean;
  lineColor?: string;
  lineStyle?: "Solid" | "Dashed" | "Dot";
  lineWidth?: number;
  popup?: PopupOptions;
  positions: Location[];
  title?: string;
  visibleRange?: Range;
  zIndex?: number;
}

export interface CircleData extends BaseOverlay {
  center: Location;
  clickable?: boolean;
  detail?: string;
  draggable?: boolean;
  fillColor?: string;
  lineColor?: string;
  lineStyle?: "Solid" | "Dashed" | "Dot";
  lineWidth?: number;
  popup?: PopupOptions;
  radius: number;
  title?: string;
  visibleRange?: Range;
  zIndex?: number;
}

type OverlayInput<T extends BaseOverlay> = Omit<T, "id"> & { id?: string };

interface UseOverlaysResult<T extends BaseOverlay> {
  add: (data: OverlayInput<T>) => string;
  clear: () => void;
  get: (id: string) => T | undefined;
  items: T[];
  remove: (id: string) => void;
  update: (id: string, data: Partial<Omit<T, "id">>) => void;
}

function generateId(): string {
  return `overlay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function useOverlayState<T extends BaseOverlay>(): UseOverlaysResult<T> {
  const [items, setItems] = useState<T[]>([]);

  const add = useCallback((data: OverlayInput<T>): string => {
    const id = data.id ?? generateId();
    const newItem = { ...data, id } as T;
    setItems((prev) => [...prev, newItem]);
    return id;
  }, []);

  const update = useCallback(
    (id: string, data: Partial<Omit<T, "id">>): void => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
    },
    []
  );

  const remove = useCallback((id: string): void => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback((): void => {
    setItems([]);
  }, []);

  const get = useCallback(
    (id: string): T | undefined => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  return useMemo(
    () => ({ items, add, update, remove, clear, get }),
    [items, add, update, remove, clear, get]
  );
}

/**
 * Hook to manage markers with add/update/remove functionality.
 *
 * @example
 * ```tsx
 * function DrawingPanel() {
 *   const { items: markers, add, remove, clear } = useMarkers();
 *
 *   const handleMapClick = (location: Location) => {
 *     add({ position: location, title: `Marker ${markers.length + 1}` });
 *   };
 *
 *   return (
 *     <>
 *       {markers.map((m) => (
 *         <Marker
 *           key={m.id}
 *           position={m.position}
 *           title={m.title}
 *           onClick={() => remove(m.id)}
 *         />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function useMarkers(): UseOverlaysResult<MarkerData> {
  return useOverlayState<MarkerData>();
}

/**
 * Hook to manage polygons with add/update/remove functionality.
 *
 * @example
 * ```tsx
 * function DrawingPanel() {
 *   const { items: polygons, add, clear } = usePolygons();
 *
 *   const handleFinishDrawing = (positions: Location[]) => {
 *     add({ positions, fillColor: 'rgba(255, 0, 0, 0.3)' });
 *   };
 *
 *   return (
 *     <>
 *       {polygons.map((p) => (
 *         <Polygon key={p.id} positions={p.positions} fillColor={p.fillColor} />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function usePolygons(): UseOverlaysResult<PolygonData> {
  return useOverlayState<PolygonData>();
}

/**
 * Hook to manage polylines with add/update/remove functionality.
 *
 * @example
 * ```tsx
 * function DrawingPanel() {
 *   const { items: polylines, add } = usePolylines();
 *
 *   return (
 *     <>
 *       {polylines.map((p) => (
 *         <Polyline key={p.id} positions={p.positions} lineColor={p.lineColor} />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function usePolylines(): UseOverlaysResult<PolylineData> {
  return useOverlayState<PolylineData>();
}

/**
 * Hook to manage circles with add/update/remove functionality.
 *
 * @example
 * ```tsx
 * function DrawingPanel() {
 *   const { items: circles, add } = useCircles();
 *
 *   const handleAddCircle = (center: Location, radius: number) => {
 *     add({ center, radius, fillColor: 'rgba(0, 0, 255, 0.3)' });
 *   };
 *
 *   return (
 *     <>
 *       {circles.map((c) => (
 *         <Circle key={c.id} center={c.center} radius={c.radius} fillColor={c.fillColor} />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function useCircles(): UseOverlaysResult<CircleData> {
  return useOverlayState<CircleData>();
}

/**
 * Hook that combines all overlay types into a single manager.
 *
 * @example
 * ```tsx
 * function DrawingPanel() {
 *   const overlays = useOverlays();
 *
 *   const handleClearAll = () => {
 *     overlays.markers.clear();
 *     overlays.polygons.clear();
 *     overlays.polylines.clear();
 *     overlays.circles.clear();
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleClearAll}>Clear All</button>
 *       {overlays.markers.items.map((m) => <Marker key={m.id} {...m} />)}
 *       {overlays.polygons.items.map((p) => <Polygon key={p.id} {...p} />)}
 *     </>
 *   );
 * }
 * ```
 */
export function useOverlays(): {
  markers: UseOverlaysResult<MarkerData>;
  polygons: UseOverlaysResult<PolygonData>;
  polylines: UseOverlaysResult<PolylineData>;
  circles: UseOverlaysResult<CircleData>;
  clearAll: () => void;
} {
  const markers = useMarkers();
  const polygons = usePolygons();
  const polylines = usePolylines();
  const circles = useCircles();

  const clearAll = useCallback(() => {
    markers.clear();
    polygons.clear();
    polylines.clear();
    circles.clear();
  }, [markers, polygons, polylines, circles]);

  return useMemo(
    () => ({ markers, polygons, polylines, circles, clearAll }),
    [markers, polygons, polylines, circles, clearAll]
  );
}

export type { BaseOverlay, OverlayInput, UseOverlaysResult };
