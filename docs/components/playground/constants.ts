import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Camera,
  Car,
  Circle as CircleIcon,
  CloudRain,
  CloudSun,
  DollarSign,
  Dot,
  Flame,
  Fullscreen,
  Gamepad2,
  Hand,
  Image,
  Languages,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Moon,
  Navigation,
  Pencil,
  Plus,
  Ruler,
  Satellite,
  Settings2,
  Sprout,
  Square,
  VectorSquare,
  Wind,
  Zap,
  ZoomIn,
} from "lucide-react";

export const LOCATIONS = {
  Bangkok: { lon: 100.5018, lat: 13.7563 },
  "Chiang Mai": { lon: 98.9853, lat: 18.7883 },
  Phuket: { lon: 98.3923, lat: 7.8804 },
  Pattaya: { lon: 100.8825, lat: 12.9236 },
  Ayutthaya: { lon: 100.5877, lat: 14.3692 },
  Sukhothai: { lon: 99.7963, lat: 17.0078 },
} as const;

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

export const DRAWING_TOOLS: Array<{
  id: DrawingMode;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "none", label: "Pan", icon: Hand },
  { id: "marker", label: "Marker", icon: MapPin },
  { id: "dot", label: "Dot", icon: Dot },
  { id: "polygon", label: "Polygon", icon: VectorSquare },
  { id: "polyline", label: "Line", icon: Pencil },
  { id: "circle", label: "Circle", icon: CircleIcon },
  { id: "rectangle", label: "Rect", icon: Square },
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

export type BaseLayer = "SIMPLE" | "STREETS" | "STREETS_NIGHT" | "HYBRID";

export const BASE_LAYERS: Array<{
  id: BaseLayer;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "SIMPLE", label: "Simple", icon: MapIcon },
  { id: "STREETS", label: "Streets", icon: Navigation },
  { id: "STREETS_NIGHT", label: "Night", icon: Moon },
  { id: "HYBRID", label: "Hybrid", icon: Satellite },
];

export type OverlayLayer =
  | "TRAFFIC"
  | "IMAGES"
  | "PM25"
  | "HOTSPOT"
  | "FLOOD"
  | "DROUGHT";

export const OVERLAY_LAYERS: Array<{
  id: OverlayLayer;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "TRAFFIC", label: "Traffic", icon: Car },
  { id: "IMAGES", label: "Images", icon: Image },
  { id: "PM25", label: "PM2.5", icon: Wind },
  { id: "HOTSPOT", label: "Hotspot", icon: Flame },
  { id: "FLOOD", label: "Flood", icon: CloudRain },
  { id: "DROUGHT", label: "Drought", icon: Sprout },
];

export type PredefinedOverlay = "cameras" | "events" | "aqi";

export const PREDEFINED_OVERLAYS: Array<{
  id: PredefinedOverlay;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "cameras", label: "CCTV", icon: Camera },
  { id: "events", label: "Events", icon: Calendar },
  { id: "aqi", label: "AQI", icon: CloudSun },
];

export const UI_CONTROLS = [
  { id: "DPad", label: "D-Pad", icon: Gamepad2 },
  { id: "Geolocation", label: "Geolocation", icon: LocateFixed },
  { id: "Zoombar", label: "Zoom Bar", icon: ZoomIn },
  { id: "Toolbar", label: "Toolbar", icon: Settings2 },
  { id: "Fullscreen", label: "Fullscreen", icon: Fullscreen },
  { id: "Crosshair", label: "Crosshair", icon: Plus },
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

export const ROUTE_MODES: Array<{
  id: "Traffic" | "Distance" | "Cost";
  label: string;
  icon: LucideIcon;
}> = [
  { id: "Traffic", label: "Traffic", icon: Car },
  { id: "Distance", label: "Shortest", icon: Zap },
  { id: "Cost", label: "Cheapest", icon: DollarSign },
];

export type RouteMode = (typeof ROUTE_MODES)[number]["id"];

export const LANGUAGES = [
  { id: "th", label: "ไทย", icon: Languages },
  { id: "en", label: "English", icon: Languages },
] as const;

export type MapLanguage = (typeof LANGUAGES)[number]["id"];
