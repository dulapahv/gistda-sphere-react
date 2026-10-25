"use client";

import {
  Circle,
  Dot,
  Marker,
  Polygon,
  Polyline,
  Rectangle,
} from "gistda-sphere-react";
import { getOutlineColor, getShapeColor } from "../constants";
import type { UseDrawingReturn } from "../hooks";
import type { PlaygroundTranslations } from "../translations";
import type { Shape } from "../types";

const DRAFT_COLOR = "rgba(239, 68, 68, 0.9)";

/** Display name of a drawn shape, e.g. "Polygon 2". */
export function shapeTitle(t: PlaygroundTranslations, shape: Shape): string {
  return t.shapeName[shape.kind](shape.number);
}

/** Renders the drawn shapes and the shape in progress. */
export function DrawnShapes({
  drawing,
  t,
}: {
  drawing: UseDrawingReturn;
  t: PlaygroundTranslations;
}) {
  const { anchor, bindRef, draft, mode, moveShape, shapes, style } = drawing;
  const label = style.labels ? true : undefined;

  return (
    <>
      {shapes.map((shape, index) => {
        const title = shapeTitle(t, shape);
        const ref = bindRef(shape.id);
        const colors = {
          fillColor: getShapeColor(index),
          lineColor: getOutlineColor(index),
        };
        switch (shape.kind) {
          case "marker":
            return (
              <Marker
                draggable
                key={shape.id}
                onDrop={(_, location) => moveShape(shape.id, location)}
                position={shape.position}
                ref={ref}
                title={title}
              />
            );
          case "dot":
            return (
              <Dot
                draggable
                key={shape.id}
                lineColor={colors.lineColor}
                lineWidth={style.lineWidth * 4}
                onDrop={(_, location) => moveShape(shape.id, location)}
                position={shape.position}
                ref={ref}
                title={title}
              />
            );
          case "polygon":
            return (
              <Polygon
                {...colors}
                editable={style.editable}
                key={shape.id}
                label={label}
                lineStyle={style.lineStyle}
                lineWidth={style.lineWidth}
                positions={shape.positions}
                ref={ref}
                title={title}
              />
            );
          case "polyline":
            return (
              <Polyline
                key={shape.id}
                label={label}
                lineColor={colors.lineColor}
                lineStyle={style.lineStyle}
                lineWidth={style.lineWidth}
                positions={shape.positions}
                ref={ref}
                title={title}
              />
            );
          case "circle":
            return (
              <Circle
                {...colors}
                center={shape.center}
                key={shape.id}
                label={label}
                lineStyle={style.lineStyle}
                lineWidth={style.lineWidth}
                radius={shape.radius}
                ref={ref}
                title={title}
              />
            );
          case "rectangle":
            return (
              <Rectangle
                {...colors}
                editable={style.editable}
                key={shape.id}
                label={label}
                lineStyle={style.lineStyle}
                lineWidth={style.lineWidth}
                position={shape.position}
                ref={ref}
                size={shape.size}
                title={title}
              />
            );
          default:
            return null;
        }
      })}

      {draft.length >= 2 ? (
        <Polyline
          lineColor={DRAFT_COLOR}
          lineStyle="Dashed"
          lineWidth={2}
          positions={mode === "polygon" ? [...draft, draft[0]] : draft}
        />
      ) : null}
      {draft.map((point, index) => (
        <Dot
          clickable={false}
          // Points never move, so the index identifies them.
          // biome-ignore lint/suspicious/noArrayIndexKey: points are append-only
          key={index}
          lineColor={DRAFT_COLOR}
          lineWidth={8}
          position={point}
        />
      ))}
      {anchor ? (
        <Dot
          clickable={false}
          lineColor={DRAFT_COLOR}
          lineWidth={12}
          position={anchor}
        />
      ) : null}
    </>
  );
}
