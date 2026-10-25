"use client";

import { EraserIcon } from "@phosphor-icons/react";
import type {
  GeoJSONFeature,
  Language,
  PolygonRef,
  PolylineRef,
  RectangleRef,
  SphereOverlay,
  SpherePolygon,
  SpherePolyline,
} from "gistda-sphere-react";
import { useState } from "react";
import type { UseDrawingReturn } from "../../hooks";
import type { PlaygroundTranslations } from "../../translations";
import type { GeoJsonLayer, Shape } from "../../types";
import { shapeTitle } from "../DrawnShapes";
import { Button, ErrorNote, Hint, Panel, Row, Section, Select } from "../ui";
import { isPolygonal, overlayOf } from "./shapeUtils";

type Predicate = "intersects" | "contains" | "within" | "distance";
type Operation = "union" | "intersection" | "difference" | "split";

const PREDICATES: readonly Predicate[] = [
  "intersects",
  "contains",
  "within",
  "distance",
];
const OPERATIONS: readonly Operation[] = [
  "union",
  "intersection",
  "difference",
  "split",
];

/** Runs a polygon or line operation, returning the resulting overlays. */
function runOperation(
  operation: Operation,
  shapeA: Shape,
  handleA: PolygonRef | RectangleRef | PolylineRef,
  overlayB: SphereOverlay
): SphereOverlay[] {
  if (shapeA.kind === "polyline") {
    const union = (handleA as PolylineRef).union(overlayB as SpherePolyline);
    return union ? [union] : [];
  }
  const polygon = handleA as PolygonRef | RectangleRef;
  const other = overlayB as SpherePolygon;
  switch (operation) {
    case "union":
      return [polygon.union(other)].filter(Boolean) as SphereOverlay[];
    case "intersection":
      return [polygon.intersection(other)].filter(Boolean) as SphereOverlay[];
    case "difference":
      return [polygon.difference(other)].filter(Boolean) as SphereOverlay[];
    case "split":
      return polygon.split(other).filter(Boolean);
    default:
      return [];
  }
}

/** Spatial predicates and polygon operations between two drawn shapes. */
export function AnalysisSection({
  analysis,
  drawing,
  language,
  onAnalysisChange,
  t,
}: {
  analysis: GeoJsonLayer | null;
  drawing: UseDrawingReturn;
  language: Language;
  onAnalysisChange: (layer: GeoJsonLayer | null) => void;
  t: PlaygroundTranslations;
}) {
  const { getHandle, shapes } = drawing;
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shapeA = shapes.find((shape) => shape.id === idA) ?? shapes.at(-2);
  const shapeB = shapes.find((shape) => shape.id === idB) ?? shapes.at(-1);
  const ready = Boolean(shapeA && shapeB && shapeA.id !== shapeB.id);
  const bothPolygonal = Boolean(
    shapeA && shapeB && isPolygonal(shapeA) && isPolygonal(shapeB)
  );
  const bothLines = shapeA?.kind === "polyline" && shapeB?.kind === "polyline";

  const options = shapes.map((shape) => ({
    label: shapeTitle(t, shape),
    value: shape.id,
  }));

  /** Resolves both shapes' handles and overlays, or reports why not. */
  const resolve = () => {
    if (!(shapeA && shapeB)) {
      return null;
    }
    const handleA = getHandle(shapeA.id);
    const handleB = getHandle(shapeB.id);
    const overlayB = handleB ? overlayOf(shapeB, handleB) : null;
    if (!(handleA && overlayB)) {
      setError(t.draw.analysis.notReady);
      return null;
    }
    return { handleA, overlayB, shapeA, shapeB };
  };

  const test = (predicate: Predicate) => {
    setError(null);
    const resolved = resolve();
    if (!resolved) {
      return;
    }
    const { handleA, overlayB } = resolved;
    try {
      const value =
        predicate === "distance"
          ? handleA.distanceTo(overlayB, language)
          : handleA[predicate](overlayB);
      setResult(
        typeof value === "boolean"
          ? t.draw.analysis.predicateResult(predicate, value)
          : t.draw.analysis.distanceResult(String(value))
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const run = (operation: Operation) => {
    setError(null);
    const resolved = resolve();
    if (!resolved) {
      return;
    }
    try {
      const overlays = runOperation(
        operation,
        resolved.shapeA,
        resolved.handleA as PolygonRef,
        resolved.overlayB
      );
      const features = overlays.map((overlay) => overlay.toJSON());
      if (features.length === 0) {
        setResult(t.draw.analysis.empty);
        onAnalysisChange(null);
        return;
      }
      onAnalysisChange({
        data: {
          features: features as GeoJSONFeature[],
          type: "FeatureCollection",
        },
        label: t.draw.analysis.operation[operation],
      });
      setResult(t.draw.analysis.operationResult(operation, features.length));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  return (
    <Section hint={t.draw.analysis.hint} title={t.draw.analysis.title}>
      {shapes.length < 2 ? (
        <Hint>{t.draw.analysis.needTwo}</Hint>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <Select
              label="A"
              onChange={setIdA}
              options={options}
              value={shapeA?.id ?? ""}
            />
            <Select
              label="B"
              onChange={setIdB}
              options={options}
              value={shapeB?.id ?? ""}
            />
          </div>
          <p className="mt-3 mb-1.5 text-fd-muted-foreground text-xs">
            {t.draw.analysis.test}
          </p>
          <Row>
            {PREDICATES.map((predicate) => (
              <Button
                disabled={!ready}
                key={predicate}
                label={t.draw.analysis.predicate[predicate]}
                onClick={() => test(predicate)}
              />
            ))}
          </Row>
          <p className="mt-3 mb-1.5 text-fd-muted-foreground text-xs">
            {t.draw.analysis.combine}
          </p>
          <Row>
            {OPERATIONS.map((operation) => (
              <Button
                disabled={
                  !(
                    ready &&
                    (bothPolygonal || (bothLines && operation === "union"))
                  )
                }
                key={operation}
                label={t.draw.analysis.operation[operation]}
                onClick={() => run(operation)}
              />
            ))}
            <Button
              disabled={!analysis}
              icon={EraserIcon}
              label={t.draw.analysis.clearResult}
              onClick={() => {
                onAnalysisChange(null);
                setResult(null);
              }}
            />
          </Row>
        </>
      )}
      {result ? (
        <Panel>
          <p className="m-0 text-xs">{result}</p>
        </Panel>
      ) : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}
    </Section>
  );
}
