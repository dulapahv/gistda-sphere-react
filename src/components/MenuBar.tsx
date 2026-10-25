import { type Ref, useEffect, useImperativeHandle, useRef } from "react";
import { useMapContext } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import { useDeepMemo, useLatest } from "@/internal/hooks";
import type { MenuItem, SphereMenuBar } from "@/types";
import type { ControlPosition } from "./MapControl";

export interface MenuBarRef {
  /** The underlying `sphere.MenuBar`. */
  getMenuBar: () => SphereMenuBar | null;
  /** Select a button by index. A negative index clears the selection. */
  select: (index: number) => void;
}

export interface MenuBarProps {
  /** Buttons to show. `value` defaults to the label. */
  items: MenuItem[];
  /** Called when the selected button changes. */
  onChange?: (current: MenuItem, previous: MenuItem | null) => void;
  /** Corner to place the menu bar in. Default `"bottom-right"`. */
  position?: ControlPosition;
  ref?: Ref<MenuBarRef>;
  /** Index of the button to select. Changing it selects that button. */
  selectedIndex?: number;
}

/** Strips runtime-only fields Sphere adds to menu items. */
function toPublicItem(item: MenuItem): MenuItem {
  return { label: item.label, value: item.value };
}

/** Sphere's built-in button-group control (`sphere.MenuBar`). */
export function MenuBar({
  items,
  onChange,
  position = "bottom-right",
  selectedIndex,
  ref,
}: MenuBarProps): null {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const menuRef = useRef<SphereMenuBar | null>(null);
  const currentIndexRef = useRef(-1);
  const onChangeRef = useLatest(onChange);
  const stableItems = useDeepMemo(items);
  const selectedRef = useLatest(selectedIndex);

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }
    // Sphere mutates button objects, so give it copies.
    const buttons = stableItems.map((item) => ({ ...item }));
    const menu = new sphere.MenuBar({
      button: buttons,
      change: (current, previous) => {
        currentIndexRef.current = buttons.indexOf(current);
        onChangeRef.current?.(
          toPublicItem(current),
          previous ? toPublicItem(previous) : null
        );
      },
    });
    menuRef.current = menu;
    currentIndexRef.current = -1;
    map.Renderer.addControl(menu, position);
    if (typeof selectedRef.current === "number") {
      menu.selectIndex(selectedRef.current);
    }
    return () => {
      map.Ui.remove(menu);
      if (menuRef.current === menu) {
        menuRef.current = null;
      }
    };
  }, [isReady, map, sphere, stableItems, position, onChangeRef, selectedRef]);

  useEffect(() => {
    if (
      typeof selectedIndex === "number" &&
      selectedIndex !== currentIndexRef.current
    ) {
      menuRef.current?.selectIndex(selectedIndex);
      if (selectedIndex < 0) {
        // Clearing the selection does not fire `change`.
        currentIndexRef.current = -1;
      }
    }
  }, [selectedIndex]);

  useImperativeHandle(
    ref,
    () => ({
      getMenuBar: () => menuRef.current,
      select: (index) => {
        menuRef.current?.selectIndex(index);
      },
    }),
    []
  );

  return null;
}
