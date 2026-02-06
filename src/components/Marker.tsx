import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useMapContext } from "../context/MapContext";
import { useSphereContext } from "../context/SphereContext";
import type {
  Icon,
  Location,
  MarkerOptions,
  PopupOptions,
  Range,
  SphereMarker,
} from "../types";

export interface MarkerProps {
  position: Location;
  icon?: Icon;
  title?: string;
  detail?: string;
  popup?: PopupOptions;
  visibleRange?: Range;
  clickable?: boolean;
  draggable?: boolean;
  zIndex?: number;
  rotate?: number;
  onClick?: (marker: SphereMarker) => void;
  onDrag?: (marker: SphereMarker) => void;
  onDrop?: (marker: SphereMarker, location: Location) => void;
  onHover?: (marker: SphereMarker) => void;
  onLeave?: (marker: SphereMarker) => void;
}

export interface MarkerRef {
  getMarker(): SphereMarker | null;
  togglePopup(show?: boolean): void;
  setPosition(location: Location, animate?: boolean): void;
  setRotation(angle: number): void;
}

export const Marker = forwardRef<MarkerRef, MarkerProps>(function Marker(
  {
    position,
    icon,
    title,
    detail,
    popup,
    visibleRange,
    clickable,
    draggable,
    zIndex,
    rotate,
    onClick,
    onDrag,
    onDrop,
    onHover,
    onLeave,
  },
  ref
) {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const markerRef = useRef<SphereMarker | null>(null);
  const callbacksRef = useRef({ onClick, onDrag, onDrop, onHover, onLeave });

  useEffect(() => {
    callbacksRef.current = { onClick, onDrag, onDrop, onHover, onLeave };
  }, [onClick, onDrag, onDrop, onHover, onLeave]);

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }

    const options: MarkerOptions = {};

    if (icon) {
      options.icon = icon;
    }
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
    if (typeof clickable === "boolean") {
      options.clickable = clickable;
    }
    if (typeof draggable === "boolean") {
      options.draggable = draggable;
    }
    if (typeof zIndex === "number") {
      options.zIndex = zIndex;
    }
    if (typeof rotate === "number") {
      options.rotate = rotate;
    }

    const marker = new sphere.Marker(position, options);
    markerRef.current = marker;

    map.Overlays.add(marker);

    const handleOverlayClick = (data: {
      overlay: SphereMarker;
      location: Location;
    }) => {
      if (data.overlay === marker) {
        callbacksRef.current.onClick?.(marker);
      }
    };

    const handleOverlayDrag = (overlay: SphereMarker) => {
      if (overlay === marker) {
        callbacksRef.current.onDrag?.(marker);
      }
    };

    const handleOverlayDrop = (overlay: SphereMarker) => {
      if (overlay === marker) {
        const newLocation = marker.location() as Location;
        callbacksRef.current.onDrop?.(marker, newLocation);
      }
    };

    const handleOverlayHover = (overlay: SphereMarker) => {
      if (overlay === marker) {
        callbacksRef.current.onHover?.(marker);
      }
    };

    const handleOverlayLeave = (overlay: SphereMarker) => {
      if (overlay === marker) {
        callbacksRef.current.onLeave?.(marker);
      }
    };

    map.Event.bind("overlayClick", handleOverlayClick);
    map.Event.bind("overlayDrag", handleOverlayDrag);
    map.Event.bind("overlayDrop", handleOverlayDrop);
    map.Event.bind("overlayHover", handleOverlayHover);
    map.Event.bind("overlayLeave", handleOverlayLeave);

    return () => {
      map.Event.unbind("overlayClick", handleOverlayClick);
      map.Event.unbind("overlayDrag", handleOverlayDrag);
      map.Event.unbind("overlayDrop", handleOverlayDrop);
      map.Event.unbind("overlayHover", handleOverlayHover);
      map.Event.unbind("overlayLeave", handleOverlayLeave);
      map.Overlays.remove(marker);
      markerRef.current = null;
    };
  }, [
    isReady,
    map,
    sphere,
    position,
    icon,
    title,
    detail,
    popup,
    visibleRange,
    clickable,
    draggable,
    zIndex,
    rotate,
  ]);

  useEffect(() => {
    if (markerRef.current && position) {
      markerRef.current.location(position, false);
    }
  }, [position]);

  useEffect(() => {
    if (markerRef.current && typeof rotate === "number") {
      markerRef.current.update({ rotate });
    }
  }, [rotate]);

  useImperativeHandle(
    ref,
    () => ({
      getMarker: () => markerRef.current,
      togglePopup: (show?: boolean) => {
        markerRef.current?.pop(show);
      },
      setPosition: (location: Location, animate = false) => {
        markerRef.current?.location(location, animate);
      },
      setRotation: (angle: number) => {
        markerRef.current?.update({ rotate: angle });
      },
    }),
    []
  );

  return null;
});

export default Marker;
