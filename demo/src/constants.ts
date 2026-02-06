import {
  Car,
  Circle as CircleIcon,
  Crosshair,
  DollarSign,
  Fullscreen,
  Gamepad2,
  Hand,
  Layers,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Moon,
  Navigation,
  Pencil,
  Ruler,
  Satellite,
  Settings2,
  Square,
  Zap,
  ZoomIn,
} from "lucide-react";

export type { BuiltInLayer } from "gistda-sphere-react";

export const LOCATIONS = {
  bangkok: { lon: 100.5018, lat: 13.7563, name: "Bangkok" },
  chiangMai: { lon: 98.9853, lat: 18.7883, name: "Chiang Mai" },
  phuket: { lon: 98.3923, lat: 7.8804, name: "Phuket" },
  pattaya: { lon: 100.8825, lat: 12.9236, name: "Pattaya" },
  ayutthaya: { lon: 100.5877, lat: 14.3692, name: "Ayutthaya" },
  sukhothai: { lon: 99.7963, lat: 17.0078, name: "Sukhothai" },
};

export type DrawingMode =
  | "none"
  | "marker"
  | "polygon"
  | "polyline"
  | "circle"
  | "dot"
  | "rectangle";

export const SHAPE_COLORS = [
  "rgba(255, 99, 132, 0.6)",
  "rgba(54, 162, 235, 0.6)",
  "rgba(255, 206, 86, 0.6)",
  "rgba(75, 192, 192, 0.6)",
  "rgba(153, 102, 255, 0.6)",
  "rgba(255, 159, 64, 0.6)",
];

export function getShapeColor(index: number): string {
  return SHAPE_COLORS[index % SHAPE_COLORS.length];
}

export const DRAWING_TOOLS = [
  { id: "none" as const, label: "Pan", icon: Hand },
  { id: "marker" as const, label: "Marker", icon: MapPin },
  { id: "dot" as const, label: "Dot", icon: CircleIcon },
  { id: "polygon" as const, label: "Polygon", icon: Layers },
  { id: "polyline" as const, label: "Line", icon: Pencil },
  { id: "circle" as const, label: "Circle", icon: CircleIcon },
  { id: "rectangle" as const, label: "Rectangle", icon: Square },
];

export const DRAWING_HINTS: Record<DrawingMode, string> = {
  none: "Click and drag to pan the map",
  marker: "Click on the map to place a marker",
  dot: "Click on the map to place a dot",
  polygon: "Click to add points, double-click to complete",
  polyline: "Click to add points, double-click to complete",
  circle: "Click center, then click to set radius",
  rectangle: "Click corner, then click opposite corner",
};

export type BaseLayer = "SIMPLE" | "STREETS" | "HYBRID" | "STREETS_NIGHT";

export const BASE_LAYERS = [
  { id: "SIMPLE" as const, label: "Simple", icon: MapIcon },
  { id: "STREETS" as const, label: "Streets", icon: Navigation },
  { id: "HYBRID" as const, label: "Satellite", icon: Satellite },
  { id: "STREETS_NIGHT" as const, label: "Night", icon: Moon },
];

export const UI_CONTROLS = [
  { id: "DPad", label: "D-Pad", icon: Gamepad2 },
  { id: "Geolocation", label: "Geolocation", icon: LocateFixed },
  { id: "Zoombar", label: "Zoom Bar", icon: ZoomIn },
  { id: "Toolbar", label: "Toolbar", icon: Settings2 },
  { id: "Fullscreen", label: "Fullscreen", icon: Fullscreen },
  { id: "Crosshair", label: "Crosshair", icon: Crosshair },
  { id: "Scale", label: "Scale", icon: Ruler },
] as const;

export type UiControlId = (typeof UI_CONTROLS)[number]["id"];

export const DEFAULT_UI_CONTROLS: Record<UiControlId, boolean> = {
  DPad: true,
  Geolocation: true,
  Zoombar: true,
  Toolbar: true,
  Fullscreen: true,
  Crosshair: false,
  Scale: true,
};

export const ROUTE_MODES = [
  { id: "Traffic" as const, label: "Traffic", icon: Car },
  { id: "Distance" as const, label: "Shortest", icon: Zap },
  { id: "Cost" as const, label: "Cheapest", icon: DollarSign },
];

export type RouteMode = (typeof ROUTE_MODES)[number]["id"];
