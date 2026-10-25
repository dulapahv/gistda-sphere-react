import type {
  CircleRef,
  DotRef,
  MarkerRef,
  PolygonRef,
  PolylineRef,
  RectangleRef,
  SphereOverlay,
} from "gistda-sphere-react";
import type { Shape, ShapeHandle } from "../../types";

/** Shapes that support polygon set operations. */
export function isPolygonal(shape: Shape): boolean {
  return shape.kind === "polygon" || shape.kind === "rectangle";
}

/** The Sphere overlay behind a shape's component. */
export function overlayOf(
  shape: Shape,
  handle: ShapeHandle
): SphereOverlay | null {
  switch (shape.kind) {
    case "marker":
      return (handle as MarkerRef).getMarker();
    case "dot":
      return (handle as DotRef).getDot();
    case "polygon":
      return (handle as PolygonRef).getPolygon();
    case "polyline":
      return (handle as PolylineRef).getPolyline();
    case "circle":
      return (handle as CircleRef).getCircle();
    case "rectangle":
      return (handle as RectangleRef).getRectangle();
    default:
      return null;
  }
}

/** Area in square meters of an area shape, or `null`. */
export function areaOf(shape: Shape, handle: ShapeHandle): number | null {
  if (shape.kind === "polygon" || shape.kind === "rectangle") {
    const area = (handle as PolygonRef | RectangleRef).getArea();
    return typeof area === "number" ? area : null;
  }
  if (shape.kind === "circle") {
    const area = (handle as CircleRef).getArea();
    return typeof area === "number" ? area : null;
  }
  return null;
}

/** Measurement text from Sphere's own formatters, e.g. "1.2 km". */
export function measureOf(
  shape: Shape,
  handle: ShapeHandle,
  language: string
): string {
  switch (shape.kind) {
    case "polygon":
    case "rectangle":
      return String((handle as PolygonRef).getArea(language) ?? "");
    case "circle": {
      const circle = handle as CircleRef;
      return `${String(circle.getArea(language) ?? "")} · r ${String(circle.getRadius(language) ?? "")}`;
    }
    case "polyline":
      return String((handle as PolylineRef).getLength(language) ?? "");
    case "marker":
    case "dot": {
      const position = (handle as MarkerRef | DotRef).getPosition();
      return position
        ? `${position.lat.toFixed(5)}, ${position.lon.toFixed(5)}`
        : "";
    }
    default:
      return "";
  }
}
