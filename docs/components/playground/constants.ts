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
  Ayutthaya: { lat: 14.3692, lon: 100.5877 },
  Bangkok: { lat: 13.7563, lon: 100.5018 },
  "Chiang Mai": { lat: 18.7883, lon: 98.9853 },
  Pattaya: { lat: 12.9236, lon: 100.8825 },
  Phuket: { lat: 7.8804, lon: 98.3923 },
  Sukhothai: { lat: 17.0078, lon: 99.7963 },
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
  { icon: Hand, id: "none", label: "Pan" },
  { icon: MapPin, id: "marker", label: "Marker" },
  { icon: Dot, id: "dot", label: "Dot" },
  { icon: VectorSquare, id: "polygon", label: "Polygon" },
  { icon: Pencil, id: "polyline", label: "Line" },
  { icon: CircleIcon, id: "circle", label: "Circle" },
  { icon: Square, id: "rectangle", label: "Rect" },
];

export const DRAWING_HINTS: Record<DrawingMode, string> = {
  circle: "Click center, then click to set radius",
  dot: "Click on the map to place a dot",
  marker: "Click on the map to place a marker",
  none: "Click and drag to pan the map",
  polygon: "Click to add points, double-click to complete",
  polyline: "Click to add points, double-click to complete",
  rectangle: "Click corner, then click opposite corner",
};

export type BaseLayer = "SIMPLE" | "STREETS" | "STREETS_NIGHT" | "HYBRID";

export const BASE_LAYERS: Array<{
  id: BaseLayer;
  label: string;
  icon: LucideIcon;
}> = [
  { icon: MapIcon, id: "SIMPLE", label: "Simple" },
  { icon: Navigation, id: "STREETS", label: "Streets" },
  { icon: Moon, id: "STREETS_NIGHT", label: "Night" },
  { icon: Satellite, id: "HYBRID", label: "Hybrid" },
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
  { icon: Car, id: "TRAFFIC", label: "Traffic" },
  { icon: Image, id: "IMAGES", label: "Images" },
  { icon: Wind, id: "PM25", label: "PM2.5" },
  { icon: Flame, id: "HOTSPOT", label: "Hotspot" },
  { icon: CloudRain, id: "FLOOD", label: "Flood" },
  { icon: Sprout, id: "DROUGHT", label: "Drought" },
];

export type PredefinedOverlay = "cameras" | "events" | "aqi";

export const PREDEFINED_OVERLAYS: Array<{
  id: PredefinedOverlay;
  label: string;
  icon: LucideIcon;
}> = [
  { icon: Camera, id: "cameras", label: "CCTV" },
  { icon: Calendar, id: "events", label: "Events" },
  { icon: CloudSun, id: "aqi", label: "AQI" },
];

export const UI_CONTROLS = [
  { icon: Gamepad2, id: "DPad", label: "D-Pad" },
  { icon: LocateFixed, id: "Geolocation", label: "Geolocation" },
  { icon: ZoomIn, id: "Zoombar", label: "Zoom Bar" },
  { icon: Settings2, id: "Toolbar", label: "Toolbar" },
  { icon: Fullscreen, id: "Fullscreen", label: "Fullscreen" },
  { icon: Plus, id: "Crosshair", label: "Crosshair" },
  { icon: Ruler, id: "Scale", label: "Scale" },
] as const;

export type UiControlId = (typeof UI_CONTROLS)[number]["id"];

export const DEFAULT_UI_CONTROLS: Record<UiControlId, boolean> = {
  Crosshair: false,
  DPad: true,
  Fullscreen: true,
  Geolocation: true,
  Scale: true,
  Toolbar: true,
  Zoombar: true,
};

export const ROUTE_MODES: Array<{
  id: "Traffic" | "Distance" | "Cost";
  label: string;
  icon: LucideIcon;
}> = [
  { icon: Car, id: "Traffic", label: "Traffic" },
  { icon: Zap, id: "Distance", label: "Shortest" },
  { icon: DollarSign, id: "Cost", label: "Cheapest" },
];

export type RouteMode = (typeof ROUTE_MODES)[number]["id"];

export const LANGUAGES = [
  { icon: Languages, id: "th", label: "ไทย" },
  { icon: Languages, id: "en", label: "English" },
] as const;

export type MapLanguage = (typeof LANGUAGES)[number]["id"];
