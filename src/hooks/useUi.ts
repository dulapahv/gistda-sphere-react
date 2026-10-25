import { useMemo } from "react";
import { useActiveMap } from "@/internal/useActiveMap";
import type {
  Language,
  MapLibreControl,
  SphereCustomControl,
  SphereMap,
  UiControlName,
} from "@/types";

/** Labels and classes for the lock/unlock button of `lockMap`. */
export interface LockMapConfig {
  /** Class of the button while the map is unlocked. */
  lockClassName?: string;
  /** Button text while unlocked (clicking it locks the map). */
  lockLabel?: string;
  /** Class of the button while the map is locked. */
  unlockClassName?: string;
  /** Button text while locked (clicking it unlocks the map). */
  unlockLabel?: string;
}

/** Controls a lock created by `lockMap`. */
export interface MapLockController {
  isLocked: () => boolean;
  lock: () => void;
  /** Remove the lock overlay and button. */
  remove: () => void;
  unlock: () => void;
}

/** Mouse interaction switches. */
export interface MouseState {
  click: boolean;
  drag: boolean;
  wheel: boolean;
}

export interface UseUiReturn {
  /** Add a MapLibre control or `sphere.CustomControl`/`MenuBar`. */
  addControl: (control: MapLibreControl | SphereCustomControl | object) => void;
  /** Hide the current-location marker. */
  clearUserLocation: () => void;
  getContextMenuOptions: () => { address: boolean; nearPoi: boolean } | null;
  getMouseState: () => MouseState | null;
  isControlVisible: (name: UiControlName) => boolean | null;
  isKeyboardEnabled: () => boolean | null;
  isReady: boolean;
  /** Locate the user and show their position on the map. */
  locateUser: () => void;
  /**
   * Cover the map with a lock overlay and a toggle button, preventing
   * accidental panning while scrolling the page. Starts locked. Calling it
   * again returns the existing lock. `null` until the map is ready.
   */
  lockMap: (config?: LockMapConfig) => MapLockController | null;
  removeControl: (
    control: MapLibreControl | SphereCustomControl | object
  ) => void;
  /** Show the nearby-POI and/or address entries in the right-click menu. */
  setContextMenuOptions: (options: {
    address?: boolean;
    nearPoi?: boolean;
  }) => void;
  setControlVisible: (name: UiControlName, visible: boolean) => void;
  setKeyboardEnabled: (enabled: boolean) => void;
  /** Language of the built-in UI only (use `setLanguage` on the map for labels too). */
  setLanguage: (language: Language) => void;
  /** Enable/disable all mouse input, or click/drag/wheel individually. */
  setMouseEnabled: (enabled: boolean | Partial<MouseState>) => void;
}

const DEFAULT_LOCK_CLASS = "sphere-react-lock-button";
const STYLE_ID = "sphere-react-lock-style";
const LOCK_LABELS: Record<Language, { lock: string; unlock: string }> = {
  en: { lock: "Click to lock the map", unlock: "Click to unlock the map" },
  th: {
    lock: "คลิกเพื่อปิดการเลื่อนแผนที่",
    unlock: "คลิกเพื่อเปิดการเลื่อนแผนที่",
  },
};

/** Injects the default lock button style once per document. */
function ensureDefaultLockStyle(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `.${DEFAULT_LOCK_CLASS}{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);padding:8px 14px;border:0;border-radius:999px;background:rgba(0,0,0,.75);color:#fff;font:13px/1.2 sans-serif;cursor:pointer}`;
  document.head.appendChild(style);
}

/** Reads a boolean getter result, ignoring chained (`this`) returns. */
function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

/** One lock per map: Sphere stacks a new overlay on every `lockMap` call. */
const locks = new WeakMap<SphereMap, MapLockController>();

/** Creates the lock overlay (or returns the existing one) for a map. */
function createLock(map: SphereMap, config: LockMapConfig): MapLockController {
  const existing = locks.get(map);
  if (existing) {
    return existing;
  }
  const placeholder = map.placeholder();
  const language = map.language() === "en" ? "en" : "th";
  const usesDefaultClasses = !(config.lockClassName || config.unlockClassName);
  if (usesDefaultClasses) {
    ensureDefaultLockStyle();
  }
  const before = new Set(Array.from(placeholder.children));
  map.Ui.lockMap({
    lockButtonClassName: config.lockClassName ?? DEFAULT_LOCK_CLASS,
    onLockLabel: config.lockLabel ?? LOCK_LABELS[language].lock,
    onUnlockLabel: config.unlockLabel ?? LOCK_LABELS[language].unlock,
    unlockButtonClassName: config.unlockClassName ?? DEFAULT_LOCK_CLASS,
  });
  const added = Array.from(placeholder.children).filter(
    (child) => !before.has(child)
  );
  const overlay = added.find((element) =>
    element.classList.contains("sphere-lock")
  ) as HTMLElement | undefined;
  const button = added.find((element) => element.tagName === "BUTTON") as
    | HTMLButtonElement
    | undefined;
  const isLocked = () => overlay?.style.display !== "none";
  const controller: MapLockController = {
    isLocked,
    lock: () => {
      if (!isLocked()) {
        button?.click();
      }
    },
    remove: () => {
      overlay?.remove();
      button?.remove();
      locks.delete(map);
    },
    unlock: () => {
      if (isLocked()) {
        button?.click();
      }
    },
  };
  locks.set(map, controller);
  return controller;
}

/**
 * Built-in UI controls and input settings of the map. Works inside
 * `SphereMap` and anywhere else under `SphereProvider`.
 */
export function useUi(): UseUiReturn {
  const { map, isReady } = useActiveMap();

  return useMemo<UseUiReturn>(
    () => ({
      addControl: (control) => {
        map?.Ui.add(control);
      },
      clearUserLocation: () => {
        map?.Ui.Geolocation?.removeMarker();
      },
      getContextMenuOptions: () => {
        const menu = map?.Ui.ContextMenu;
        if (!menu) {
          return null;
        }
        return {
          address: asBoolean(menu.enableAddress()) ?? false,
          nearPoi: asBoolean(menu.enableNearPoi()) ?? false,
        };
      },
      getMouseState: () => {
        const mouse = map?.Ui.Mouse;
        if (!mouse) {
          return null;
        }
        return {
          click: asBoolean(mouse.enableClick()) ?? false,
          drag: asBoolean(mouse.enableDrag()) ?? false,
          wheel: asBoolean(mouse.enableWheel()) ?? false,
        };
      },
      isControlVisible: (name) => asBoolean(map?.Ui[name]?.visible()),
      isKeyboardEnabled: () => asBoolean(map?.Ui.Keyboard?.enable()),
      isReady,
      locateUser: () => {
        map?.Ui.Geolocation?.trigger();
      },
      lockMap: (config = {}) => (map ? createLock(map, config) : null),
      removeControl: (control) => {
        map?.Ui.remove(control);
      },
      setContextMenuOptions: ({ address, nearPoi }) => {
        const menu = map?.Ui.ContextMenu;
        if (typeof address === "boolean") {
          menu?.enableAddress(address);
        }
        if (typeof nearPoi === "boolean") {
          menu?.enableNearPoi(nearPoi);
        }
      },
      setControlVisible: (name, visible) => {
        map?.Ui[name]?.visible(visible);
      },
      setKeyboardEnabled: (enabled) => {
        map?.Ui.Keyboard?.enable(enabled);
      },
      setLanguage: (language) => {
        map?.Ui.language(language);
      },
      setMouseEnabled: (enabled) => {
        const mouse = map?.Ui.Mouse;
        if (!mouse) {
          return;
        }
        if (typeof enabled === "boolean") {
          mouse.enable(enabled);
          return;
        }
        if (typeof enabled.click === "boolean") {
          mouse.enableClick(enabled.click);
        }
        if (typeof enabled.drag === "boolean") {
          mouse.enableDrag(enabled.drag);
        }
        if (typeof enabled.wheel === "boolean") {
          mouse.enableWheel(enabled.wheel);
        }
      },
    }),
    [map, isReady]
  );
}
