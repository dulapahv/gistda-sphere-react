import type {
  CircleRef,
  DotRef,
  GeoJSON,
  Location,
  MarkerRef,
  PoiResult,
  PolygonRef,
  PolylineRef,
  RectangleRef,
  Size,
} from "gistda-sphere-react";

interface ShapeBase {
  id: string;
  /** 1-based number among shapes of the same kind, used in labels. */
  number: number;
}

/** A shape drawn in the playground. */
export type Shape =
  | (ShapeBase & { kind: "marker"; position: Location })
  | (ShapeBase & { kind: "dot"; position: Location })
  | (ShapeBase & { kind: "polygon"; positions: Location[] })
  | (ShapeBase & { kind: "polyline"; positions: Location[] })
  | (ShapeBase & { center: Location; kind: "circle"; radius: number })
  | (ShapeBase & { kind: "rectangle"; position: Location; size: Size });

export type ShapeKind = Shape["kind"];

/** Ref handle of a drawn shape's component. */
export type ShapeHandle =
  | CircleRef
  | DotRef
  | MarkerRef
  | PolygonRef
  | PolylineRef
  | RectangleRef;

/** What the next map click does, when it is not used for drawing. */
export type PickMode = "routeStop" | "dataPoint";

/** Current view of the map. */
export interface MapCamera {
  center: Location;
  pitch: number;
  rotation: number;
  zoom: number;
}

/** GeoJSON shown on the map, with a label for the sidebar. */
export interface GeoJsonLayer {
  data: GeoJSON;
  label: string;
}

/** A place picked from search results. */
export interface SelectedPlace {
  poi: PoiResult;
  /** Draw the place's outline (areas) with `<ObjectOverlay>`. */
  showOutline: boolean;
}
