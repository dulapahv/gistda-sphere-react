import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useMapContext } from "../context/MapContext";
import { useSphereContext } from "../context/SphereContext";
import type { Location, PopupOptions, Size, SpherePopup } from "../types";

export interface PopupProps {
  position: Location;
  title?: string;
  detail?: string;
  loadDetail?: (element: HTMLElement) => void;
  html?: string;
  loadHtml?: (element: HTMLElement) => void;
  size?: Size;
  closable?: boolean;
  onClose?: (popup: SpherePopup) => void;
}

export interface PopupRef {
  getPopup(): SpherePopup | null;
  setPosition(location: Location): void;
  setTitle(title: string): void;
  setDetail(detail: string): void;
  getElement(): HTMLElement | null;
}

export const Popup = forwardRef<PopupRef, PopupProps>(function Popup(
  {
    position,
    title,
    detail,
    loadDetail,
    html,
    loadHtml,
    size,
    closable = true,
    onClose,
  },
  ref
) {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const popupRef = useRef<SpherePopup | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }

    const options: PopupOptions = {
      closable,
    };

    if (title) {
      options.title = title;
    }
    if (detail) {
      options.detail = detail;
    }
    if (loadDetail) {
      options.loadDetail = loadDetail;
    }
    if (html) {
      options.html = html;
    }
    if (loadHtml) {
      options.loadHtml = loadHtml;
    }
    if (size) {
      options.size = size;
    }

    const popup = new sphere.Popup(position, options);
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
      popupRef.current = null;
    };
  }, [
    isReady,
    map,
    sphere,
    position,
    title,
    detail,
    loadDetail,
    html,
    loadHtml,
    size,
    closable,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      getPopup: () => popupRef.current,
      setPosition: (location: Location) => {
        popupRef.current?.location(location);
      },
      setTitle: (newTitle: string) => {
        popupRef.current?.title(newTitle);
      },
      setDetail: (newDetail: string) => {
        popupRef.current?.detail(newDetail);
      },
      getElement: () => popupRef.current?.element() ?? null,
    }),
    []
  );

  return null;
});

export default Popup;
