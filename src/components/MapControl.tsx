import { type ReactNode, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useMapContext } from "@/context/MapContext";
import type { MapLibreControl } from "@/types";

/** Corners a map control can be placed in. */
export type ControlPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface MapControlProps {
  children?: ReactNode;
  /** Extra CSS class for the control container. */
  className?: string;
  /** Use the boxed button-group look of the built-in controls. Default `false`. */
  group?: boolean;
  /** Corner to place the control in. Default `"top-right"`. */
  position?: ControlPosition;
  /** Show or hide the control. Default `true`. */
  visible?: boolean;
}

/** A MapLibre control whose container React renders into. */
class ReactMapControl implements MapLibreControl {
  readonly container: HTMLDivElement;
  private readonly position: ControlPosition;

  /** Creates the container element for the given corner. */
  constructor(position: ControlPosition) {
    this.position = position;
    this.container = document.createElement("div");
  }

  /** Corner MapLibre places the control in. */
  getDefaultPosition(): string {
    return this.position;
  }

  /** Returns the container for MapLibre to mount. */
  onAdd(): HTMLElement {
    return this.container;
  }

  /** Detaches the container. */
  onRemove(): void {
    this.container.remove();
  }
}

/**
 * Renders React content as a native map control (like the zoom bar), so it
 * is positioned with and styled like the built-in controls.
 */
export function MapControl({
  children,
  className,
  group = false,
  position = "top-right",
  visible = true,
}: MapControlProps): ReactNode {
  const { map, isReady } = useMapContext();
  const control = useMemo(() => new ReactMapControl(position), [position]);

  useEffect(() => {
    if (!(isReady && map)) {
      return;
    }
    map.Ui.add(control);
    return () => {
      map.Ui.remove(control);
    };
  }, [isReady, map, control]);

  useEffect(() => {
    control.container.className = [
      "maplibregl-ctrl",
      group ? "maplibregl-ctrl-group" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");
    control.container.style.display = visible ? "" : "none";
  }, [control, className, group, visible]);

  return createPortal(children, control.container);
}
