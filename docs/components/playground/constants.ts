import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  AirplaneIcon,
  ArrowsOutCardinalIcon,
  BuildingsIcon,
  CactusIcon,
  CarIcon,
  CircleHalfIcon,
  CircleIcon,
  CirclesThreeIcon,
  CornersOutIcon,
  CrosshairIcon,
  CubeIcon,
  DatabaseIcon,
  DotOutlineIcon,
  EyeIcon,
  EyeSlashIcon,
  FireIcon,
  GaugeIcon,
  GlobeHemisphereEastIcon,
  GlobeSimpleIcon,
  GpsFixIcon,
  HandIcon,
  ImageIcon,
  LightningIcon,
  LineSegmentsIcon,
  MapPinIcon,
  MapTrifoldIcon,
  MoonIcon,
  PathIcon,
  PencilSimpleIcon,
  PlusMinusIcon,
  PolygonIcon,
  PulseIcon,
  RoadHorizonIcon,
  RulerIcon,
  SecurityCameraIcon,
  SparkleIcon,
  SquareIcon,
  StackIcon,
  SunIcon,
  ThermometerIcon,
  ToolboxIcon,
  TrafficConeIcon,
  TrafficSignalIcon,
  WavesIcon,
  WindIcon,
} from "@phosphor-icons/react";
import type {
  BuiltInLayer,
  FilterType,
  LineStyleType,
  PredefinedOverlay,
  RouteMode,
  UiControlName,
} from "gistda-sphere-react";

export const LOCATIONS = {
  Ayutthaya: { lat: 14.3692, lon: 100.5877 },
  Bangkok: { lat: 13.7563, lon: 100.5018 },
  "Chiang Mai": { lat: 18.7883, lon: 98.9853 },
  Pattaya: { lat: 12.9236, lon: 100.8825 },
  Phuket: { lat: 7.8804, lon: 98.3923 },
  Sukhothai: { lat: 17.0078, lon: 99.7963 },
} as const;

export type LocationName = keyof typeof LOCATIONS;

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

/** Fill color for the n-th shape; the outline uses the opaque variant. */
export function getShapeColor(index: number): string {
  return SHAPE_COLORS[index % SHAPE_COLORS.length] ?? "rgba(0, 0, 0, 0.6)";
}

/** Opaque version of a shape color, for outlines. */
export function getOutlineColor(index: number): string {
  return getShapeColor(index).replace("0.6", "1");
}

export const DRAWING_TOOLS: ReadonlyArray<{
  id: DrawingMode;
  icon: PhosphorIcon;
}> = [
  { icon: HandIcon, id: "none" },
  { icon: MapPinIcon, id: "marker" },
  { icon: DotOutlineIcon, id: "dot" },
  { icon: PolygonIcon, id: "polygon" },
  { icon: LineSegmentsIcon, id: "polyline" },
  { icon: CircleIcon, id: "circle" },
  { icon: SquareIcon, id: "rectangle" },
];

export const LINE_STYLES: readonly LineStyleType[] = ["Solid", "Dashed", "Dot"];

export type BaseLayer = Extract<
  BuiltInLayer,
  "SIMPLE" | "STREETS" | "STREETS_NIGHT" | "HYBRID" | "IMAGES"
>;

export const BASE_LAYERS: ReadonlyArray<{ id: BaseLayer; icon: PhosphorIcon }> =
  [
    { icon: MapTrifoldIcon, id: "SIMPLE" },
    { icon: RoadHorizonIcon, id: "STREETS" },
    { icon: MoonIcon, id: "STREETS_NIGHT" },
    { icon: GlobeHemisphereEastIcon, id: "HYBRID" },
    { icon: ImageIcon, id: "IMAGES" },
  ];

export type DataLayer = Extract<
  BuiltInLayer,
  "TRAFFIC" | "PM25" | "HOTSPOT" | "FLOOD" | "DROUGHT"
>;

export const DATA_LAYERS: ReadonlyArray<{ id: DataLayer; icon: PhosphorIcon }> =
  [
    { icon: CarIcon, id: "TRAFFIC" },
    { icon: WindIcon, id: "PM25" },
    { icon: FireIcon, id: "HOTSPOT" },
    { icon: WavesIcon, id: "FLOOD" },
    { icon: CactusIcon, id: "DROUGHT" },
  ];

export const PREDEFINED_OVERLAYS: ReadonlyArray<{
  id: PredefinedOverlay;
  icon: PhosphorIcon;
}> = [
  { icon: SecurityCameraIcon, id: "cameras" },
  { icon: TrafficConeIcon, id: "events" },
  { icon: GaugeIcon, id: "aqi" },
];

export const FILTERS: ReadonlyArray<{ id: FilterType; icon: PhosphorIcon }> = [
  { icon: SunIcon, id: "None" },
  { icon: MoonIcon, id: "Dark" },
  { icon: CircleHalfIcon, id: "Light" },
  { icon: EyeIcon, id: "Protanopia" },
  { icon: EyeSlashIcon, id: "Deuteranopia" },
];

export type ControlId = Exclude<UiControlName, "ContextMenu">;

export const UI_CONTROLS: ReadonlyArray<{ id: ControlId; icon: PhosphorIcon }> =
  [
    { icon: ArrowsOutCardinalIcon, id: "DPad" },
    { icon: PlusMinusIcon, id: "Zoombar" },
    { icon: GpsFixIcon, id: "Geolocation" },
    { icon: ToolboxIcon, id: "Toolbar" },
    { icon: StackIcon, id: "LayerSelector" },
    { icon: CornersOutIcon, id: "Fullscreen" },
    { icon: CrosshairIcon, id: "Crosshair" },
    { icon: RulerIcon, id: "Scale" },
  ];

export const DEFAULT_UI_CONTROLS: Record<ControlId, boolean> = {
  Crosshair: false,
  DPad: true,
  Fullscreen: true,
  Geolocation: true,
  LayerSelector: true,
  Scale: true,
  Toolbar: false,
  Zoombar: true,
};

export const ROUTE_MODES: ReadonlyArray<{ id: RouteMode; icon: PhosphorIcon }> =
  [
    { icon: TrafficSignalIcon, id: "Traffic" },
    { icon: LightningIcon, id: "Cost" },
    { icon: RulerIcon, id: "Distance" },
    { icon: AirplaneIcon, id: "Fly" },
  ];

export type AdvancedLayer =
  | "heatmap"
  | "clusters"
  | "wms"
  | "buildings3d"
  | "pointcloud"
  | "model3d";

export const ADVANCED_LAYERS: ReadonlyArray<{
  id: AdvancedLayer;
  icon: PhosphorIcon;
}> = [
  { icon: ThermometerIcon, id: "heatmap" },
  { icon: CirclesThreeIcon, id: "clusters" },
  { icon: GlobeSimpleIcon, id: "wms" },
  { icon: BuildingsIcon, id: "buildings3d" },
  { icon: SparkleIcon, id: "pointcloud" },
  { icon: CubeIcon, id: "model3d" },
];

export const LANGUAGES = [
  { id: "th", label: "ไทย" },
  { id: "en", label: "English" },
] as const;

export type MapLanguage = (typeof LANGUAGES)[number]["id"];

export type TabId = "map" | "draw" | "places" | "route" | "data" | "events";

export const TABS: ReadonlyArray<{ id: TabId; icon: PhosphorIcon }> = [
  { icon: MapTrifoldIcon, id: "map" },
  { icon: PencilSimpleIcon, id: "draw" },
  { icon: MapPinIcon, id: "places" },
  { icon: PathIcon, id: "route" },
  { icon: DatabaseIcon, id: "data" },
  { icon: PulseIcon, id: "events" },
];

export type ImportFormat = "geojson" | "wkt" | "kml" | "gpx";

export const IMPORT_FORMATS: readonly ImportFormat[] = [
  "geojson",
  "wkt",
  "kml",
  "gpx",
];

/** Small samples around Bangkok for the data import panel. */
export const IMPORT_SAMPLES: Record<ImportFormat, string> = {
  geojson: JSON.stringify(
    {
      features: [
        {
          geometry: {
            coordinates: [
              [
                [100.4887, 13.7539],
                [100.4945, 13.7539],
                [100.4945, 13.7488],
                [100.4887, 13.7488],
                [100.4887, 13.7539],
              ],
            ],
            type: "Polygon",
          },
          properties: { name: "Grand Palace" },
          type: "Feature",
        },
        {
          geometry: { coordinates: [100.4942, 13.7465], type: "Point" },
          properties: { name: "Wat Pho" },
          type: "Feature",
        },
      ],
      type: "FeatureCollection",
    },
    null,
    2
  ),
  gpx: `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1">
  <wpt lat="13.7465" lon="100.4927"><name>Wat Pho</name></wpt>
  <trk><name>Riverside walk</name><trkseg>
    <trkpt lat="13.7516" lon="100.4887"/>
    <trkpt lat="13.7465" lon="100.4904"/>
    <trkpt lat="13.7410" lon="100.4920"/>
  </trkseg></trk>
</gpx>`,
  kml: `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Placemark>
    <name>Democracy Monument</name>
    <Point><coordinates>100.5018,13.7567,0</coordinates></Point>
  </Placemark>
  <Placemark>
    <name>Ratchadamnoen Avenue</name>
    <LineString><coordinates>100.4930,13.7560,0 100.5018,13.7567,0 100.5100,13.7570,0</coordinates></LineString>
  </Placemark>
</kml>`,
  wkt: "POLYGON((100.50 13.76, 100.54 13.76, 100.54 13.73, 100.50 13.73, 100.50 13.76))",
};
