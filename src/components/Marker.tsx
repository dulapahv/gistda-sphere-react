import {
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useMapContext } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import {
  createSpatialMethods,
  isLocation,
  type OverlaySpatialMethods,
  withoutUndefined,
} from "@/internal/geometry";
import {
  useDeepMemo,
  useLatest,
  useOverlayEvents,
  usePortalTarget,
} from "@/internal/hooks";
import type {
  GeoJSONFeature,
  GeoJSONPoint,
  Icon,
  Location,
  MarkerOptions,
  PopupOptions,
  Range,
  SphereMarker,
} from "@/types";

/** Attribute marking the element that React icon content is rendered into. */
const ICON_HOST_ATTRIBUTE = "data-sphere-react-marker";

export interface MarkerRef extends OverlaySpatialMethods {
  /** The marker's DOM element (only for HTML/React icons). */
  getElement: () => HTMLElement | null;
  /** The underlying `sphere.Marker`. */
  getMarker: () => SphereMarker | null;
  /** Current position of the marker. */
  getPosition: () => Location | null;
  /** Move the marker. `animate` slides it (`true` = 150 ms, or a duration in ms). */
  setPosition: (location: Location, animate?: boolean | number) => void;
  /** Rotate the marker icon clockwise, in degrees. */
  setRotation: (angle: number) => void;
  /** Show (`true`), hide (`false`) or toggle the popup. */
  togglePopup: (show?: boolean) => void;
}

export interface MarkerProps {
  /**
   * Slide to new positions instead of jumping: `true` (150 ms) or a
   * duration in ms. HTML/React icons only.
   */
  animate?: boolean | number;
  /** React content rendered as the marker icon (replaces `icon.html`/`icon.url`). */
  children?: ReactNode;
  /** Show a pointer cursor on hover. */
  clickable?: boolean;
  /** Popup text shown when the marker is clicked. */
  detail?: string;
  draggable?: boolean;
  /** Image or HTML icon. With `children`, only `offset`/`size` are used. */
  icon?: Icon;
  onClick?: (marker: SphereMarker, location: Location) => void;
  onDrag?: (marker: SphereMarker) => void;
  onDrop?: (marker: SphereMarker, location: Location) => void;
  onHover?: (marker: SphereMarker) => void;
  onLeave?: (marker: SphereMarker) => void;
  /**
   * Extra raw options for `new sphere.Marker()`. HTML/React icons also accept
   * MapLibre marker options here (e.g. `anchor`, `pitchAlignment`).
   */
  options?: Record<string, unknown>;
  /** Popup configuration (overrides `detail`). */
  popup?: PopupOptions;
  /** React content rendered inside the popup shown on click. */
  popupContent?: ReactNode;
  /** Marker position, or a GeoJSON point/feature. */
  position: Location | GeoJSONPoint | GeoJSONFeature<GeoJSONPoint>;
  ref?: Ref<MarkerRef>;
  /** Clockwise rotation in degrees. Updates without re-creating the marker. */
  rotate?: number;
  /** Tooltip shown on hover. */
  title?: string;
  visibleRange?: Range;
  zIndex?: number;
}

/** Reads a marker's position as a plain location. */
function readLocation(marker: SphereMarker): Location | null {
  const value = marker.location();
  return isLocation(value) ? { lat: value.lat, lon: value.lon } : null;
}

/** Builds the popup options, wiring React popup content when present. */
function buildPopup(
  popup: PopupOptions | undefined,
  title: string | undefined,
  hasContent: boolean,
  capture: (element: HTMLElement) => void
): PopupOptions | undefined {
  if (!hasContent || popup?.html || popup?.loadHtml) {
    return popup;
  }
  return { title, ...popup, loadDetail: capture };
}

/** A point marker on the map. */
export function Marker({
  position,
  ref,
  animate,
  children,
  icon,
  title,
  detail,
  popup,
  popupContent,
  visibleRange,
  clickable,
  draggable,
  zIndex,
  rotate,
  options: extraOptions,
  onClick,
  onDrag,
  onDrop,
  onHover,
  onLeave,
}: MarkerProps): ReactNode {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const markerRef = useRef<SphereMarker | null>(null);
  const [iconHost, setIconHost] = useState<HTMLElement | null>(null);
  const [popupHost, capturePopupHost] = usePortalTarget();

  const hasChildren = children !== undefined && children !== null;
  const hasPopupContent = popupContent !== undefined && popupContent !== null;

  const stableIcon = useDeepMemo(icon);
  const stablePopup = useDeepMemo(
    buildPopup(popup, title, hasPopupContent, capturePopupHost)
  );
  const stableVisibleRange = useDeepMemo(visibleRange);
  const stableExtra = useDeepMemo(extraOptions);
  const stablePosition = useDeepMemo(position);
  const positionRef = useLatest(stablePosition);
  const dynamicRef = useLatest({ draggable, rotate });

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }

    const markerIcon: Icon | undefined = hasChildren
      ? {
          html: `<div ${ICON_HOST_ATTRIBUTE}=""></div>`,
          offset: stableIcon?.offset,
          size: stableIcon?.size,
        }
      : stableIcon;

    const options = withoutUndefined<MarkerOptions & Record<string, unknown>>({
      ...stableExtra,
      clickable,
      detail,
      draggable: dynamicRef.current.draggable,
      icon: markerIcon && withoutUndefined(markerIcon),
      popup: stablePopup,
      rotate: dynamicRef.current.rotate,
      title,
      visibleRange: stableVisibleRange,
      zIndex,
    });

    const marker = new sphere.Marker(positionRef.current, options);
    markerRef.current = marker;
    map.Overlays.add(marker);

    if (hasChildren) {
      const element = marker.element();
      setIconHost(
        element?.querySelector<HTMLElement>(`[${ICON_HOST_ATTRIBUTE}]`) ??
          element ??
          null
      );
    }

    return () => {
      map.Overlays.remove(marker);
      if (markerRef.current === marker) {
        markerRef.current = null;
      }
      setIconHost(null);
    };
  }, [
    isReady,
    map,
    sphere,
    hasChildren,
    stableIcon,
    stablePopup,
    stableVisibleRange,
    stableExtra,
    clickable,
    detail,
    title,
    zIndex,
    positionRef,
    dynamicRef,
  ]);

  // Move instead of re-creating, so drags, popups and animations survive.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      return;
    }
    if (isLocation(stablePosition)) {
      const current = readLocation(marker);
      if (
        current?.lat === stablePosition.lat &&
        current?.lon === stablePosition.lon
      ) {
        return;
      }
    }
    marker.location(stablePosition, animate);
  }, [stablePosition, animate]);

  useEffect(() => {
    if (typeof rotate === "number") {
      markerRef.current?.update({ rotate });
    }
  }, [rotate]);

  useEffect(() => {
    if (typeof draggable === "boolean") {
      markerRef.current?.update({ draggable });
    }
  }, [draggable]);

  useOverlayEvents(map, isReady, markerRef, {
    onClick,
    onDrag,
    onDrop: onDrop
      ? (marker: SphereMarker) => {
          const location = readLocation(marker);
          if (location) {
            onDrop(marker, location);
          }
        }
      : undefined,
    onHover,
    onLeave,
  });

  useImperativeHandle(
    ref,
    () => ({
      ...createSpatialMethods(
        () => sphere,
        () => markerRef.current
      ),
      getElement: () => markerRef.current?.element() ?? null,
      getMarker: () => markerRef.current,
      getPosition: () =>
        markerRef.current ? readLocation(markerRef.current) : null,
      setPosition: (location, animateMove) => {
        markerRef.current?.location(location, animateMove);
      },
      setRotation: (angle) => {
        markerRef.current?.update({ rotate: angle });
      },
      togglePopup: (show) => {
        markerRef.current?.pop(show);
      },
    }),
    [sphere]
  );

  return (
    <>
      {hasChildren && iconHost ? createPortal(children, iconHost) : null}
      {hasPopupContent && popupHost
        ? createPortal(popupContent, popupHost)
        : null}
    </>
  );
}
