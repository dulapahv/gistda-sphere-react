"use client";

import { useMap, useUi } from "gistda-sphere-react";
import { useEffect } from "react";
import type { DrawingMode } from "../constants";
import type { InteractionSettings } from "../hooks";

interface DoubleClickZoomHandler {
  disable: () => void;
  enable: () => void;
}

/**
 * Applies the playground's interaction settings with `useUi`. Renders
 * nothing; place it inside `SphereMap`.
 */
export function InteractionSync({
  drawingMode,
  interaction,
}: {
  drawingMode: DrawingMode;
  interaction: InteractionSettings;
}) {
  const ui = useUi();
  const { map } = useMap();
  const {
    contextMenuAddress,
    contextMenuNearPoi,
    keyboard,
    locked,
    mouseDrag,
    mouseWheel,
  } = interaction;

  useEffect(() => {
    ui.setKeyboardEnabled(keyboard);
  }, [ui, keyboard]);

  useEffect(() => {
    ui.setMouseEnabled({ drag: mouseDrag, wheel: mouseWheel });
  }, [ui, mouseDrag, mouseWheel]);

  useEffect(() => {
    ui.setContextMenuOptions({
      address: contextMenuAddress,
      nearPoi: contextMenuNearPoi,
    });
  }, [ui, contextMenuAddress, contextMenuNearPoi]);

  useEffect(() => {
    if (!locked) {
      return;
    }
    const lock = ui.lockMap();
    return () => {
      lock?.remove();
    };
  }, [ui, locked]);

  // A double-click finishes polygons and lines, so it must not zoom too.
  useEffect(() => {
    const handler = map?.Renderer.doubleClickZoom as
      | DoubleClickZoomHandler
      | undefined;
    if (!handler || (drawingMode !== "polygon" && drawingMode !== "polyline")) {
      return;
    }
    handler.disable();
    return () => {
      handler.enable();
    };
  }, [map, drawingMode]);

  return null;
}
