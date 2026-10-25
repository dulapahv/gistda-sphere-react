import {
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { useMapContext } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import { isLocation, withoutUndefined } from "@/internal/geometry";
import { useDeepMemo, useLatest, usePortalTarget } from "@/internal/hooks";
import type { Location, PopupOptions, Size, SpherePopup } from "@/types";

export interface PopupRef {
  /** The popup's DOM element. */
  getElement: () => HTMLElement | null;
  /** The underlying `sphere.Popup`. */
  getPopup: () => SpherePopup | null;
  /** Current position of the popup. */
  getPosition: () => Location | null;
  setDetail: (detail: string) => void;
  setPosition: (location: Location) => void;
  setTitle: (title: string) => void;
}

export interface PopupProps {
  /** React content rendered in the popup body (below the title). */
  children?: ReactNode;
  /** Show the close button. */
  closable?: boolean;
  /** Body text or HTML. */
  detail?: string;
  /** Fully custom HTML content (replaces the title/detail layout). */
  html?: string;
  /** Fill the body element yourself when the popup opens. */
  loadDetail?: (element: HTMLElement) => void;
  /** Fill the whole popup element yourself each time it opens. */
  loadHtml?: (element: HTMLElement) => void;
  /** Called when the user closes the popup. */
  onClose?: (popup: SpherePopup) => void;
  /**
   * Extra raw options for `new sphere.Popup()`, including MapLibre popup
   * options such as `anchor`, `offset`, `className` or `closeOnClick`.
   */
  options?: Record<string, unknown>;
  /** Popup position. Changing it moves the popup without re-creating it. */
  position: Location;
  ref?: Ref<PopupRef>;
  size?: Size;
  title?: string;
}

/** An information popup anchored to a location. */
export function Popup({
  position,
  ref,
  children,
  title,
  detail,
  loadDetail,
  html,
  loadHtml,
  size,
  closable = true,
  options: extraOptions,
  onClose,
}: PopupProps): ReactNode {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const popupRef = useRef<SpherePopup | null>(null);
  const onCloseRef = useLatest(onClose);
  const [contentHost, captureContentHost] = usePortalTarget();

  const hasChildren = children !== undefined && children !== null;
  const usesChildren = hasChildren && !(html || loadHtml);
  const stableSize = useDeepMemo(size);
  const stableExtra = useDeepMemo(extraOptions);
  const stablePosition = useDeepMemo(position);
  const positionRef = useLatest(stablePosition);

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }

    const popupOptions = withoutUndefined<
      PopupOptions & Record<string, unknown>
    >({
      ...stableExtra,
      closable,
      detail,
      html,
      loadDetail: usesChildren ? captureContentHost : loadDetail,
      loadHtml,
      size: stableSize,
      title,
    });

    const popup = new sphere.Popup(positionRef.current, popupOptions);
    popupRef.current = popup;
    map.Overlays.add(popup);

    const handlePopupClose = (closedPopup: SpherePopup) => {
      if (closedPopup === popup) {
        onCloseRef.current?.(popup);
      }
    };
    map.Event.bind("popupClose", handlePopupClose);

    return () => {
      map.Event.unbind("popupClose", handlePopupClose);
      map.Overlays.remove(popup);
      if (popupRef.current === popup) {
        popupRef.current = null;
      }
    };
  }, [
    isReady,
    map,
    sphere,
    title,
    detail,
    loadDetail,
    html,
    loadHtml,
    stableSize,
    closable,
    stableExtra,
    usesChildren,
    captureContentHost,
    positionRef,
    onCloseRef,
  ]);

  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) {
      return;
    }
    const current = popup.location();
    if (
      isLocation(current) &&
      current.lat === stablePosition.lat &&
      current.lon === stablePosition.lon
    ) {
      return;
    }
    popup.location(stablePosition);
  }, [stablePosition]);

  useImperativeHandle(
    ref,
    () => ({
      getElement: () => popupRef.current?.element() ?? null,
      getPopup: () => popupRef.current,
      getPosition: () => {
        const value = popupRef.current?.location();
        return isLocation(value) ? { lat: value.lat, lon: value.lon } : null;
      },
      setDetail: (newDetail) => {
        popupRef.current?.detail(newDetail);
      },
      setPosition: (location) => {
        popupRef.current?.location(location);
      },
      setTitle: (newTitle) => {
        popupRef.current?.title(newTitle);
      },
    }),
    []
  );

  return usesChildren && contentHost
    ? createPortal(children, contentHost)
    : null;
}
