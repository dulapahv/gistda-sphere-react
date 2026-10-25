import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Location, SphereMap, SphereOverlay } from "@/types";

/** True for object literals and arrays (not class instances, DOM nodes, etc.). */
function isPlainData(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Structural equality for plain data (objects, arrays, primitives).
 * Functions, class instances and DOM nodes are compared by reference.
 */
export function isDeepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (!(isPlainData(a) && isPlainData(b))) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every(
    (key) => Object.hasOwn(b, key) && isDeepEqual(a[key], b[key])
  );
}

/**
 * Returns a referentially stable version of `value` that only changes when
 * its content changes. Lets users pass inline objects/arrays (e.g.
 * `positions={[...]}`) without re-creating overlays on every render.
 */
export function useDeepMemo<T>(value: T): T {
  const ref = useRef(value);
  // Intentional render-time cache: the stored value is replaced only when
  // the new value differs structurally, so effects keyed on it stay stable.
  if (!isDeepEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
}

/** Keeps a ref pointing at the latest value without re-running effects. */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** Overlay interaction callbacks shared by all overlay components. */
export interface OverlayEventCallbacks<T extends SphereOverlay> {
  onClick?: (overlay: T, location: Location) => void;
  onDrag?: (overlay: T) => void;
  onDrop?: (overlay: T) => void;
  onHover?: (overlay: T) => void;
  onLeave?: (overlay: T) => void;
}

/**
 * Binds map-level overlay events once and forwards those that target the
 * overlay currently held in `overlayRef`. Sphere fires `overlayClick` with
 * `(overlay, location)` and the other overlay events with `(overlay)`.
 */
export function useOverlayEvents<T extends SphereOverlay>(
  map: SphereMap | null,
  isReady: boolean,
  overlayRef: RefObject<T | null>,
  callbacks: OverlayEventCallbacks<T>
): void {
  const callbacksRef = useLatest(callbacks);

  useEffect(() => {
    if (!(isReady && map)) {
      return;
    }

    const isOwn = (overlay: unknown): overlay is T =>
      overlay !== null && overlay === overlayRef.current;

    const handleClick = (overlay: SphereOverlay, location: Location) => {
      if (isOwn(overlay)) {
        callbacksRef.current.onClick?.(overlay, location);
      }
    };
    const handleDrag = (overlay: SphereOverlay) => {
      if (isOwn(overlay)) {
        callbacksRef.current.onDrag?.(overlay);
      }
    };
    const handleDrop = (overlay: SphereOverlay) => {
      if (isOwn(overlay)) {
        callbacksRef.current.onDrop?.(overlay);
      }
    };
    const handleHover = (overlay: SphereOverlay) => {
      if (isOwn(overlay)) {
        callbacksRef.current.onHover?.(overlay);
      }
    };
    const handleLeave = (overlay: SphereOverlay) => {
      if (isOwn(overlay)) {
        callbacksRef.current.onLeave?.(overlay);
      }
    };

    map.Event.bind("overlayClick", handleClick);
    map.Event.bind("overlayDrag", handleDrag);
    map.Event.bind("overlayDrop", handleDrop);
    map.Event.bind("overlayHover", handleHover);
    map.Event.bind("overlayLeave", handleLeave);

    return () => {
      map.Event.unbind("overlayClick", handleClick);
      map.Event.unbind("overlayDrag", handleDrag);
      map.Event.unbind("overlayDrop", handleDrop);
      map.Event.unbind("overlayHover", handleHover);
      map.Event.unbind("overlayLeave", handleLeave);
    };
  }, [map, isReady, overlayRef, callbacksRef]);
}

/**
 * State for a DOM node that React content is portalled into. `capture` is a
 * stable callback suitable for Sphere's `loadDetail`/`loadHtml` options.
 */
export function usePortalTarget(): [
  HTMLElement | null,
  (element: HTMLElement | null) => void,
] {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const capture = useCallback((element: HTMLElement | null) => {
    setTarget(element);
  }, []);
  return [target, capture];
}
