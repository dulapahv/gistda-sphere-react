"use client";

import {
  ArrowUUpLeftIcon,
  CheckIcon,
  DownloadSimpleIcon,
  FrameCornersIcon,
  PencilSimpleLineIcon,
  TagIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  type GeoJSONFeature,
  type GeometryRefMethods,
  type Language,
  useMapControls,
  useSphereUtils,
} from "gistda-sphere-react";
import { useEffect, useState } from "react";
import { DRAWING_TOOLS, getOutlineColor, LINE_STYLES } from "../../constants";
import type { UseDrawingReturn } from "../../hooks";
import type { PlaygroundTranslations } from "../../translations";
import type { GeoJsonLayer, Shape } from "../../types";
import { shapeTitle } from "../DrawnShapes";
import {
  Button,
  CopyButton,
  downloadText,
  Hint,
  Row,
  Section,
  Slider,
  Toggle,
} from "../ui";
import { AnalysisSection } from "./AnalysisSection";
import { ImportSection } from "./ImportSection";
import { areaOf, measureOf } from "./shapeUtils";

/** Draw tab: drawing tools, style, shape list, analysis and data import. */
export function DrawTab({
  analysis,
  drawing,
  imported,
  language,
  measureVersion,
  onAnalysisChange,
  onImport,
  t,
}: {
  analysis: GeoJsonLayer | null;
  drawing: UseDrawingReturn;
  imported: GeoJsonLayer | null;
  language: Language;
  measureVersion: number;
  onAnalysisChange: (layer: GeoJsonLayer | null) => void;
  onImport: (layer: GeoJsonLayer | null) => void;
  t: PlaygroundTranslations;
}) {
  const { goTo, setBound } = useMapControls();
  const { formatThaiArea } = useSphereUtils();
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const { getHandle, mode, shapes, style } = drawing;

  // Shape components create their overlays in effects of the same commit,
  // so read measurements once those effects have run.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next: Record<string, string> = {};
      for (const shape of shapes) {
        const handle = getHandle(shape.id);
        if (!handle) {
          continue;
        }
        const area = areaOf(shape, handle);
        const text = measureOf(shape, handle, language);
        next[shape.id] =
          area === null ? text : `${text} · ${formatThaiArea(area, language)}`;
      }
      setMeasurements(next);
    }, 0);
    return () => clearTimeout(timer);
  }, [shapes, getHandle, language, formatThaiArea, measureVersion]);

  const zoomTo = (shape: Shape) => {
    if (shape.kind === "marker" || shape.kind === "dot") {
      goTo({ center: shape.position, zoom: 15 });
      return;
    }
    // Every shape other than markers and dots has geometry ref methods.
    const handle = getHandle(shape.id) as GeometryRefMethods | undefined;
    const bound = handle?.getBound();
    if (bound) {
      setBound(bound, { maxZoom: 17, padding: 80 });
    }
  };

  const exportGeoJson = () => {
    const features = shapes.flatMap((shape) => {
      const feature = getHandle(shape.id)?.toGeoJSON() as
        | GeoJSONFeature
        | null
        | undefined;
      if (!feature) {
        return [];
      }
      return [
        {
          ...feature,
          properties: {
            ...feature.properties,
            kind: shape.kind,
            name: shapeTitle(t, shape),
          },
        },
      ];
    });
    return JSON.stringify({ features, type: "FeatureCollection" }, null, 2);
  };

  const isLineMode = mode === "polygon" || mode === "polyline";
  const isTwoClickMode = mode === "circle" || mode === "rectangle";

  return (
    <>
      <Section title={t.draw.tools}>
        <Row>
          {DRAWING_TOOLS.map(({ icon, id }) => (
            <Toggle
              active={mode === id}
              icon={icon}
              key={id}
              label={t.draw.tool[id]}
              onClick={() => drawing.setMode(id)}
            />
          ))}
        </Row>
        <Hint>{t.draw.hint[mode]}</Hint>
        {isLineMode && drawing.draft.length > 0 ? (
          <div className="mt-2">
            <Row>
              <Button
                disabled={!drawing.canFinish}
                icon={CheckIcon}
                label={t.draw.finish}
                onClick={drawing.finish}
                primary
              />
              <Button
                icon={ArrowUUpLeftIcon}
                label={t.draw.undo}
                onClick={drawing.undo}
              />
              <Button
                icon={XIcon}
                label={t.common.cancel}
                onClick={drawing.cancel}
              />
            </Row>
          </div>
        ) : null}
        {isTwoClickMode && drawing.anchor ? (
          <div className="mt-2">
            <Button
              icon={XIcon}
              label={t.common.cancel}
              onClick={drawing.cancel}
            />
          </div>
        ) : null}
      </Section>

      <Section hint={t.draw.styleHint} title={t.draw.style}>
        <Row>
          {LINE_STYLES.map((lineStyle) => (
            <Toggle
              active={style.lineStyle === lineStyle}
              key={lineStyle}
              label={t.draw.lineStyle[lineStyle]}
              onClick={() => drawing.setStyle({ lineStyle })}
            />
          ))}
        </Row>
        <div className="mt-3">
          <Slider
            label={t.draw.lineWidth}
            max={10}
            min={1}
            onChange={(lineWidth) => drawing.setStyle({ lineWidth })}
            unit="px"
            value={style.lineWidth}
          />
        </div>
        <Row>
          <Toggle
            active={style.editable}
            icon={PencilSimpleLineIcon}
            label={t.draw.editable}
            onClick={() => drawing.setStyle({ editable: !style.editable })}
          />
          <Toggle
            active={style.labels}
            icon={TagIcon}
            label={t.draw.labels}
            onClick={() => drawing.setStyle({ labels: !style.labels })}
          />
        </Row>
      </Section>

      <Section title={t.draw.shapes(shapes.length)}>
        {shapes.length === 0 ? (
          <Hint>{t.draw.noShapes}</Hint>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {shapes.map((shape, index) => (
              <li
                className="flex items-center gap-2 rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5"
                key={shape.id}
              >
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-sm border border-fd-border"
                  style={{
                    background:
                      shape.kind === "marker"
                        ? "transparent"
                        : getOutlineColor(index),
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate font-medium text-xs">
                    {shapeTitle(t, shape)}
                  </p>
                  <p
                    className="m-0 truncate text-[11px] text-fd-muted-foreground tabular-nums"
                    title={measurements[shape.id]}
                  >
                    {measurements[shape.id] ?? "…"}
                  </p>
                </div>
                <Button
                  icon={FrameCornersIcon}
                  onClick={() => zoomTo(shape)}
                  title={t.draw.zoomTo}
                />
                <Button
                  icon={TrashIcon}
                  onClick={() => drawing.removeShape(shape.id)}
                  title={t.common.remove}
                />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2">
          <Row>
            <CopyButton
              copiedLabel={t.common.copied}
              disabled={shapes.length === 0}
              label={t.draw.copyGeoJson}
              text={exportGeoJson}
            />
            <Button
              disabled={shapes.length === 0}
              icon={DownloadSimpleIcon}
              label={t.draw.download}
              onClick={() =>
                downloadText(
                  "shapes.geojson",
                  exportGeoJson(),
                  "application/geo+json"
                )
              }
            />
            <Button
              disabled={shapes.length === 0}
              icon={TrashIcon}
              label={t.common.clearAll}
              onClick={() => {
                drawing.clearAll();
                onAnalysisChange(null);
              }}
            />
          </Row>
        </div>
      </Section>

      <AnalysisSection
        analysis={analysis}
        drawing={drawing}
        language={language}
        onAnalysisChange={onAnalysisChange}
        t={t}
      />

      <ImportSection imported={imported} onImport={onImport} t={t} />
    </>
  );
}
