import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMapContext } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import type {
  GeometryOptions,
  PopupOptions,
  SphereGeometryOptions,
  SphereNamespace,
  SpherePolyline,
} from "@/types";
import { type GeometryStyle, toSphereGeometryOptions } from "./geometry";
import {
  type OverlayEventCallbacks,
  useDeepMemo,
  useLatest,
  useOverlayEvents,
  usePortalTarget,
} from "./hooks";

/** Props shared by all geometry components. */
export interface GeometryComponentProps<T extends SpherePolyline>
  extends GeometryOptions,
    OverlayEventCallbacks<T> {
  /**
   * Extra raw options passed straight to the Sphere constructor. Use for
   * options this library does not model yet.
   */
  options?: Record<string, unknown>;
  /** React content rendered in the popup shown when the geometry is clicked. */
  popupContent?: ReactNode;
}

interface UseGeometryParams<T extends SpherePolyline> {
  /** Creates the overlay, or returns `null` when the shape is incomplete. */
  create: (sphere: SphereNamespace, options: SphereGeometryOptions) => T | null;
  props: GeometryComponentProps<T>;
  /** Shape data; the overlay is re-created when it changes (compared by value). */
  shape: unknown;
}

interface UseGeometryResult<T extends SpherePolyline> {
  overlayRef: RefObject<T | null>;
  /** Portal for `popupContent`; render it from the component. */
  portal: ReactNode;
}

/** Adds the portal-capturing `loadDetail` to popup options when React content is used. */
function withPopupContent(
  popup: PopupOptions | undefined,
  hasContent: boolean,
  capture: (element: HTMLElement) => void
): PopupOptions | undefined {
  if (!hasContent || popup?.html || popup?.loadHtml) {
    return popup;
  }
  return { ...popup, loadDetail: capture };
}

/**
 * Shared lifecycle for geometry overlays: creates the overlay when the map is
 * ready, re-creates it when its shape or behavior changes, updates styles
 * in place via `update()`, removes it on unmount, and wires overlay events.
 */
export function useGeometry<T extends SpherePolyline>({
  create,
  props,
  shape,
}: UseGeometryParams<T>): UseGeometryResult<T> {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const overlayRef = useRef<T | null>(null);
  const [portalTarget, capturePortal] = usePortalTarget();

  const {
    onClick,
    onDrag,
    onDrop,
    onHover,
    onLeave,
    options: extraOptions,
    popupContent,
    lineWidth,
    lineColor,
    fillColor,
    lineStyle,
    popup,
    ...behavior
  } = props;

  const hasPopupContent = popupContent !== undefined && popupContent !== null;
  const stableShape = useDeepMemo(shape);
  const stableBehaviour = useDeepMemo({
    ...behavior,
    popup: withPopupContent(popup, hasPopupContent, capturePortal),
  });
  const stableExtra = useDeepMemo(extraOptions);
  const stableLineStyle = useDeepMemo(lineStyle);
  const style: GeometryStyle = {
    fillColor,
    lineColor,
    lineStyle: stableLineStyle,
    lineWidth,
  };
  const styleRef = useLatest(style);
  const createRef = useLatest(create);
  const appliedStyleRef = useRef<GeometryStyle | null>(null);

  // Removing a style prop cannot be expressed through update(), so a change
  // in which style props are set triggers a re-create instead.
  const definedStyleKey = [fillColor, lineColor, lineStyle, lineWidth]
    .map((value) => (value === undefined ? "0" : "1"))
    .join("");

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }
    const currentStyle = styleRef.current;
    const options = toSphereGeometryOptions(sphere, {
      ...stableExtra,
      ...stableBehaviour,
      ...currentStyle,
    });
    const overlay = createRef.current(sphere, options);
    if (!overlay) {
      return;
    }
    overlayRef.current = overlay;
    appliedStyleRef.current = currentStyle;
    map.Overlays.add(overlay);

    return () => {
      map.Overlays.remove(overlay);
      if (overlayRef.current === overlay) {
        overlayRef.current = null;
      }
    };
  }, [
    isReady,
    map,
    sphere,
    stableShape,
    stableBehaviour,
    stableExtra,
    definedStyleKey,
    styleRef,
    createRef,
  ]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const applied = appliedStyleRef.current;
    if (!(overlay && sphere && applied)) {
      return;
    }
    const next = {
      fillColor,
      lineColor,
      lineStyle: stableLineStyle,
      lineWidth,
    };
    const changed =
      applied.fillColor !== next.fillColor ||
      applied.lineColor !== next.lineColor ||
      applied.lineStyle !== next.lineStyle ||
      applied.lineWidth !== next.lineWidth;
    if (!changed) {
      return;
    }
    overlay.update(toSphereGeometryOptions(sphere, next));
    appliedStyleRef.current = next;
  }, [sphere, fillColor, lineColor, stableLineStyle, lineWidth]);

  useOverlayEvents(map, isReady, overlayRef, {
    onClick,
    onDrag,
    onDrop,
    onHover,
    onLeave,
  });

  const portal =
    hasPopupContent && portalTarget
      ? createPortal(popupContent, portalTarget)
      : null;

  return { overlayRef, portal };
}
