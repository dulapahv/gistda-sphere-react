import { useEffect } from "react";
import { useLatest } from "@/internal/hooks";
import { useActiveMap } from "@/internal/useActiveMap";
import type {
  EventHandler,
  EventName,
  Location,
  OverlayClickEventData,
  PointerLocation,
  SphereEventHandler,
  SphereMap,
  SphereOverlay,
} from "@/types";

/**
 * Listens to a Sphere map event. Handler arguments are typed per event
 * (see `SphereEventMap`), e.g. `overlayClick` receives `(overlay, location)`.
 * Return `false` from a `beforeContextmenu` handler to cancel the menu.
 *
 * Works inside `SphereMap` and anywhere else under `SphereProvider`.
 */
export function useMapEvent<K extends EventName>(
  eventName: K,
  handler: SphereEventHandler<K>
): void;
/** @deprecated Use the event-typed form without an explicit type argument. */
export function useMapEvent<T>(
  eventName: EventName,
  handler: EventHandler<T>
): void;
export function useMapEvent(
  eventName: EventName,
  handler: (...args: never[]) => unknown
): void {
  const { map, isReady } = useActiveMap();
  const handlerRef = useLatest(handler as (...args: unknown[]) => unknown);

  useEffect(() => {
    if (!(isReady && map)) {
      return;
    }
    // Stable wrapper: forwards every argument and the return value, without
    // re-binding when the handler identity changes.
    const stableHandler = (...args: unknown[]) => handlerRef.current(...args);
    map.Event.bind(eventName, stableHandler as never);
    return () => {
      map.Event.unbind(eventName, stableHandler as never);
    };
  }, [map, isReady, eventName, handlerRef]);
}

/**
 * Runs once when the map is ready, or right away if it already is. Runs
 * again only if a new map instance takes its place.
 */
export function useMapReady(handler: (map: SphereMap) => void): void {
  const { map, isReady } = useActiveMap();
  const handlerRef = useLatest(handler);

  useEffect(() => {
    // The "ready" event has already fired by the time `isReady` is true, so
    // binding to it here would never run the handler.
    if (isReady && map) {
      handlerRef.current(map);
    }
  }, [map, isReady, handlerRef]);
}

/** Map clicks (not fired when an overlay was clicked). */
export function useMapClick(
  handler: (location: PointerLocation) => void
): void {
  useMapEvent("click", handler);
}

/** Zoom level changes, with the new zoom (many times per second while zooming). */
export function useMapZoom(handler: (zoom: number) => void): void {
  const { map } = useActiveMap();
  useMapEvent("zoom", () => {
    if (map) {
      handler(map.zoom());
    }
  });
}

/** Map center changes, with the new center (many times per second while panning). */
export function useMapLocation(handler: (center: Location) => void): void {
  const { map } = useActiveMap();
  useMapEvent("location", () => {
    if (map) {
      handler(map.location());
    }
  });
}

/** Overlay clicks, delivered as `{ overlay, location }`. */
export function useOverlayClick(
  handler: (data: OverlayClickEventData) => void
): void {
  useMapEvent("overlayClick", (overlay: SphereOverlay, location) => {
    handler({ location, overlay });
  });
}
