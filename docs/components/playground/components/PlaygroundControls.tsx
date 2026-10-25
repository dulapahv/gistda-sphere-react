"use client";

import { CompassIcon, HouseIcon } from "@phosphor-icons/react";
import {
  MapControl,
  MenuBar,
  type MenuItem,
  useMapControls,
} from "gistda-sphere-react";
import { useMemo } from "react";
import { BASE_LAYERS, type BaseLayer, LOCATIONS } from "../constants";
import type { PlaygroundTranslations } from "../translations";

const CONTROL_BUTTON = "flex! items-center justify-center text-[#333]";

/**
 * Custom controls rendered with `<MapControl>` (React buttons styled like
 * the built-in ones) and `<MenuBar>` (Sphere's button group).
 */
export function PlaygroundControls({
  baseLayer,
  onBaseLayerChange,
  t,
}: {
  baseLayer: BaseLayer;
  onBaseLayerChange: (layer: BaseLayer) => void;
  t: PlaygroundTranslations;
}) {
  const { goTo, setPitch, setRotate } = useMapControls();

  const items = useMemo<MenuItem[]>(
    () =>
      BASE_LAYERS.map((layer) => ({
        label: t.baseLayerShort[layer.id],
        value: layer.id,
      })),
    [t]
  );
  const selectedIndex = BASE_LAYERS.findIndex(
    (layer) => layer.id === baseLayer
  );

  return (
    <>
      <MapControl group position="top-left">
        <button
          aria-label={t.flyHome}
          className={CONTROL_BUTTON}
          onClick={() =>
            goTo({ bearing: 0, center: LOCATIONS.Bangkok, pitch: 0, zoom: 10 })
          }
          title={t.flyHome}
          type="button"
        >
          <HouseIcon size={16} />
        </button>
        <button
          aria-label={t.resetNorth}
          className={CONTROL_BUTTON}
          onClick={() => {
            setRotate(0);
            setPitch(0);
          }}
          title={t.resetNorth}
          type="button"
        >
          <CompassIcon size={16} />
        </button>
      </MapControl>
      <MenuBar
        items={items}
        onChange={(item) => onBaseLayerChange(item.value as BaseLayer)}
        position="bottom-left"
        selectedIndex={selectedIndex}
      />
    </>
  );
}
