import { useEffect, useRef } from "react";
import { useMapContext } from "../context/MapContext";
import { useSphereContext } from "../context/SphereContext";
import type {
  EventHandler,
  EventName,
  Location,
  SphereOverlay,
} from "../types";

export function useMapEvent<T = unknown>(
  eventName: EventName,
  handler: EventHandler<T>
): void {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }

    // Stable reference avoids re-binding on every handler change
    const stableHandler: EventHandler<T> = (data) => {
      return handlerRef.current(data);
    };

    map.Event.bind(eventName, stableHandler);

    return () => {
      map.Event.unbind(eventName, stableHandler);
    };
  }, [map, isReady, sphere, eventName]);
}

export function useMapReady(handler: () => void): void {
  useMapEvent("ready", handler);
}

export function useMapClick(
  handler: EventHandler<{ lon: number; lat: number }>
): void {
  useMapEvent("click", handler);
}

export function useMapZoom(handler: EventHandler<void>): void {
  useMapEvent("zoom", handler);
}

export function useMapLocation(handler: EventHandler<void>): void {
  useMapEvent("location", handler);
}

export function useOverlayClick(
  handler: EventHandler<{
    overlay: SphereOverlay;
    location: Location;
  }>
): void {
  useMapEvent("overlayClick", handler);
}
