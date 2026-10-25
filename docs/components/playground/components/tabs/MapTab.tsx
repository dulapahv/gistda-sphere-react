"use client";

import {
  ArrowCounterClockwiseIcon,
  GpsFixIcon,
  GpsSlashIcon,
  HandGrabbingIcon,
  KeyboardIcon,
  LockIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  MailboxIcon,
  MapPinIcon,
  MouseScrollIcon,
  PuzzlePieceIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";
import { useMapControls, useUi } from "gistda-sphere-react";
import {
  ADVANCED_LAYERS,
  type AdvancedLayer,
  BASE_LAYERS,
  DATA_LAYERS,
  FILTERS,
  LANGUAGES,
  LOCATIONS,
  type LocationName,
  PREDEFINED_OVERLAYS,
  UI_CONTROLS,
} from "../../constants";
import {
  DEFAULT_ZOOM_RANGE,
  type UseMapSettingsReturn,
  useCamera,
} from "../../hooks";
import type { PlaygroundTranslations } from "../../translations";
import { MODEL_POSITION } from "../AdvancedLayers";
import { Button, Row, Section, Slider, Toggle } from "../ui";

/** Where to look when an advanced layer is switched on. */
const ADVANCED_LAYER_VIEWS: Partial<
  Record<
    AdvancedLayer,
    { center: { lat: number; lon: number }; pitch: number; zoom: number }
  >
> = {
  clusters: { center: { lat: 10, lon: 125 }, pitch: 0, zoom: 2.5 },
  heatmap: { center: { lat: 10, lon: 125 }, pitch: 0, zoom: 2.5 },
  model3d: { center: MODEL_POSITION, pitch: 60, zoom: 16 },
  wms: { center: { lat: 13, lon: 101 }, pitch: 0, zoom: 4 },
};

/** Map tab: base map, labels, filters, camera, layers, controls and input. */
export function MapTab({
  settings,
  t,
}: {
  settings: UseMapSettingsReturn;
  t: PlaygroundTranslations;
}) {
  const { goTo, setPitch, setRotate, zoomIn, zoomOut } = useMapControls();
  const ui = useUi();
  const camera = useCamera();
  const { interaction, setInteraction, zoomRange } = settings;

  const toggleAdvancedLayer = (layer: AdvancedLayer) => {
    const turningOn = !settings.advancedLayers.includes(layer);
    settings.toggleAdvancedLayer(layer);
    const view = ADVANCED_LAYER_VIEWS[layer];
    if (turningOn && view) {
      goTo({ ...view, bearing: 0 });
    }
  };

  return (
    <>
      <Section title={t.map.baseMap}>
        <Row>
          {BASE_LAYERS.map(({ icon, id }) => (
            <Toggle
              active={settings.baseLayer === id}
              icon={icon}
              key={id}
              label={t.baseLayer[id]}
              onClick={() => settings.setBaseLayer(id)}
            />
          ))}
        </Row>
      </Section>

      <Section hint={t.map.labelsHint} title={t.map.labels}>
        <Row>
          {LANGUAGES.map(({ id, label }) => (
            <Toggle
              active={settings.language === id}
              key={id}
              label={label}
              onClick={() => settings.setLanguage(id)}
            />
          ))}
        </Row>
      </Section>

      <Section hint={t.map.filterHint} title={t.map.filter}>
        <Row>
          {FILTERS.map(({ icon, id }) => (
            <Toggle
              active={settings.filter === id}
              icon={icon}
              key={id}
              label={t.filter[id]}
              onClick={() => settings.setFilter(id)}
            />
          ))}
        </Row>
      </Section>

      <Section title={t.map.camera}>
        <Row>
          <Button
            icon={MagnifyingGlassPlusIcon}
            label={t.map.zoomIn}
            onClick={() => zoomIn()}
          />
          <Button
            icon={MagnifyingGlassMinusIcon}
            label={t.map.zoomOut}
            onClick={() => zoomOut()}
          />
          <Button
            icon={ArrowCounterClockwiseIcon}
            label={t.map.resetView}
            onClick={() => {
              setRotate(0);
              setPitch(0);
            }}
          />
        </Row>
        <div className="mt-3">
          <Slider
            disabled={!camera}
            label={t.map.rotation}
            max={359}
            min={0}
            onChange={(value) => setRotate(value, false)}
            unit="°"
            value={((camera?.rotation ?? 0) + 360) % 360}
          />
          <Slider
            disabled={!camera}
            label={t.map.pitch}
            max={60}
            min={0}
            onChange={(value) => setPitch(value)}
            unit="°"
            value={camera?.pitch ?? 0}
          />
        </div>
        <p className="mt-1 mb-1.5 text-fd-muted-foreground text-xs">
          {t.map.flyTo}
        </p>
        <Row>
          {(Object.keys(LOCATIONS) as LocationName[]).map((name) => (
            <Button
              icon={MapPinIcon}
              key={name}
              label={t.places.cities[name]}
              onClick={() => goTo({ center: LOCATIONS[name], zoom: 12 })}
            />
          ))}
        </Row>
      </Section>

      <Section hint={t.map.zoomLimitsHint} title={t.map.zoomLimits}>
        <Slider
          label={t.map.minZoom}
          max={zoomRange.max - 1}
          min={DEFAULT_ZOOM_RANGE.min}
          onChange={(min) => settings.setZoomRange({ ...zoomRange, min })}
          value={zoomRange.min}
        />
        <Slider
          label={t.map.maxZoom}
          max={DEFAULT_ZOOM_RANGE.max}
          min={zoomRange.min + 1}
          onChange={(max) => settings.setZoomRange({ ...zoomRange, max })}
          value={zoomRange.max}
        />
      </Section>

      <Section hint={t.map.dataLayersHint} title={t.map.dataLayers}>
        <Row>
          {DATA_LAYERS.map(({ icon, id }) => (
            <Toggle
              active={settings.dataLayers.includes(id)}
              icon={icon}
              key={id}
              label={t.dataLayer[id]}
              onClick={() => settings.toggleDataLayer(id)}
            />
          ))}
        </Row>
      </Section>

      <Section hint={t.map.liveOverlaysHint} title={t.map.liveOverlays}>
        <Row>
          {PREDEFINED_OVERLAYS.map(({ icon, id }) => (
            <Toggle
              active={settings.liveOverlays.includes(id)}
              icon={icon}
              key={id}
              label={t.liveOverlay[id]}
              onClick={() => settings.toggleLiveOverlay(id)}
            />
          ))}
        </Row>
      </Section>

      <Section hint={t.map.advancedLayersHint} title={t.map.advancedLayers}>
        <Row>
          {ADVANCED_LAYERS.map(({ icon, id }) => (
            <Toggle
              active={settings.advancedLayers.includes(id)}
              icon={icon}
              key={id}
              label={t.advancedLayer[id]}
              onClick={() => toggleAdvancedLayer(id)}
            />
          ))}
        </Row>
      </Section>

      <Section hint={t.map.controlsHint} title={t.map.controls}>
        <Row>
          {UI_CONTROLS.map(({ icon, id }) => (
            <Toggle
              active={settings.controls[id]}
              icon={icon}
              key={id}
              label={t.control[id]}
              onClick={() => settings.toggleControl(id)}
            />
          ))}
          <Toggle
            active={settings.showCustomControls}
            icon={PuzzlePieceIcon}
            label={t.map.customControls}
            onClick={() =>
              settings.setShowCustomControls(!settings.showCustomControls)
            }
          />
        </Row>
      </Section>

      <Section hint={t.map.interactionHint} title={t.map.interaction}>
        <Row>
          <Toggle
            active={interaction.mouseDrag}
            icon={HandGrabbingIcon}
            label={t.map.drag}
            onClick={() =>
              setInteraction({ mouseDrag: !interaction.mouseDrag })
            }
          />
          <Toggle
            active={interaction.mouseWheel}
            icon={MouseScrollIcon}
            label={t.map.wheel}
            onClick={() =>
              setInteraction({ mouseWheel: !interaction.mouseWheel })
            }
          />
          <Toggle
            active={interaction.keyboard}
            icon={KeyboardIcon}
            label={t.map.keyboard}
            onClick={() => setInteraction({ keyboard: !interaction.keyboard })}
          />
          <Toggle
            active={interaction.contextMenuAddress}
            icon={MailboxIcon}
            label={t.map.menuAddress}
            onClick={() =>
              setInteraction({
                contextMenuAddress: !interaction.contextMenuAddress,
              })
            }
          />
          <Toggle
            active={interaction.contextMenuNearPoi}
            icon={StorefrontIcon}
            label={t.map.menuNearby}
            onClick={() =>
              setInteraction({
                contextMenuNearPoi: !interaction.contextMenuNearPoi,
              })
            }
          />
          <Toggle
            active={interaction.locked}
            icon={LockIcon}
            label={t.map.lock}
            onClick={() => setInteraction({ locked: !interaction.locked })}
          />
        </Row>
        <div className="mt-2">
          <Row>
            <Button
              disabled={!ui.isReady}
              icon={GpsFixIcon}
              label={t.map.locate}
              onClick={ui.locateUser}
            />
            <Button
              disabled={!ui.isReady}
              icon={GpsSlashIcon}
              label={t.map.clearLocation}
              onClick={ui.clearUserLocation}
            />
          </Row>
        </div>
      </Section>
    </>
  );
}
