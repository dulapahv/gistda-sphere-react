import type { DrawingMode } from "./constants";

interface PlaygroundTranslations {
  active: (count: number) => string;

  /** Error */
  apiKeyError: string;
  backToDocs: string;

  /** LayerSelector */
  baseLayer: string;
  calculate: string;
  calculating: string;
  center: string;
  circleCenter: string;
  circleN: (n: number) => string;
  clearAll: string;
  clearResults: string;
  clearRoute: string;
  clickMapToSet: (point: string) => string;
  clickOppositeCorner: string;
  clickToSetRadius: string;
  controlCrosshair: string;

  /** UI control labels */
  controlDPad: string;
  controlFullscreen: string;
  controlGeolocation: string;
  controlScale: string;
  controlToolbar: string;
  controlZoomBar: string;
  dataLayers: string;
  destination: string;
  distance: string;
  docs: string;
  dotN: (n: number) => string;

  /** DrawingPanel */
  drawingTools: string;
  duration: string;
  hideDirections: string;
  hintCircle: string;
  hintDot: string;
  hintMarker: string;

  /** Drawing hints */
  hintNone: string;
  hintPolygon: string;
  hintPolyline: string;
  hintRectangle: string;
  /** Sidebar */
  interactivePlayground: string;

  /** Language section */
  language: string;
  layerHybrid: string;
  layerNight: string;

  /** Base layer labels */
  layerSimple: string;
  layerStreets: string;
  lineN: (n: number) => string;
  liveOverlays: string;
  locAyutthaya: string;
  location: string;

  /** Location labels */
  locBangkok: string;
  locChiangMai: string;
  locPattaya: string;
  locPhuket: string;
  locSukhothai: string;

  /** MapControlsPanel */
  mapControls: string;

  /** MapView shape labels */
  markerN: (n: number) => string;
  modeCheapest: string;
  modeShortest: string;

  /** Route mode labels */
  modeTraffic: string;
  notSet: string;
  origin: string;
  overlayDrought: string;
  overlayFlood: string;
  overlayHotspot: string;
  overlayImages: string;
  overlayPM25: string;

  /** Overlay layer labels */
  overlayTraffic: string;

  /** TagsPanel */
  poiTags: string;
  polygonN: (n: number) => string;
  predefinedAQI: string;

  /** Predefined overlay labels */
  predefinedCCTV: string;
  predefinedEvents: string;

  /** QuickNav */
  quickNavigation: string;
  rectangleCorner: string;
  rectangleN: (n: number) => string;
  resultN: (n: number) => string;
  reverseRoute: string;

  /** RoutePanel */
  routePlanning: string;
  searchPlaceholder: string;

  /** SearchPanel */
  searchPlaces: string;
  searchResult: string;
  setDestinationOnMap: string;
  setOriginOnMap: string;
  shapes: string;
  toggleTagsHint: string;
  toolCircle: string;
  toolDot: string;
  toolLine: string;
  toolMarker: string;

  /** Drawing tool labels */
  toolPan: string;
  toolPolygon: string;
  toolRect: string;
  turnByTurn: (steps: number) => string;

  /** MapStats */
  zoom: string;
}

const en: PlaygroundTranslations = {
  active: (count) => `${count} active`,

  apiKeyError:
    "Set NEXT_PUBLIC_SPHERE_API_KEY in docs/.env.local to use the playground.",
  backToDocs: "Back to docs",

  baseLayer: "Base Layer",
  calculate: "Calculate",
  calculating: "Calculating...",
  center: "Center",
  circleCenter: "Circle Center",
  circleN: (n) => `Circle ${n}`,
  clearAll: "Clear All",
  clearResults: "Clear Results",
  clearRoute: "Clear route",
  clickMapToSet: (point) => `Click on the map to set ${point}`,
  clickOppositeCorner: "Click opposite corner",
  clickToSetRadius: "Click to set radius",
  controlCrosshair: "Crosshair",

  controlDPad: "D-Pad",
  controlFullscreen: "Fullscreen",
  controlGeolocation: "Geolocation",
  controlScale: "Scale",
  controlToolbar: "Toolbar",
  controlZoomBar: "Zoom Bar",
  dataLayers: "Data Layers",
  destination: "Destination",
  distance: "Distance",
  docs: "Docs",
  dotN: (n) => `Dot ${n}`,

  drawingTools: "Drawing Tools",
  duration: "Duration",
  hideDirections: "Hide Directions",
  hintCircle: "Click center, then click to set radius",
  hintDot: "Click on the map to place a dot",
  hintMarker: "Click on the map to place a marker",

  hintNone: "Click and drag to pan the map",
  hintPolygon: "Click to add points, double-click to complete",
  hintPolyline: "Click to add points, double-click to complete",
  hintRectangle: "Click corner, then click opposite corner",
  interactivePlayground: "Interactive Playground",

  language: "Language",
  layerHybrid: "Hybrid",
  layerNight: "Night",

  layerSimple: "Simple",
  layerStreets: "Streets",
  lineN: (n) => `Line ${n}`,
  liveOverlays: "Live Overlays",
  locAyutthaya: "Ayutthaya",
  location: "Location",

  locBangkok: "Bangkok",
  locChiangMai: "Chiang Mai",
  locPattaya: "Pattaya",
  locPhuket: "Phuket",
  locSukhothai: "Sukhothai",

  mapControls: "Map Controls",

  markerN: (n) => `Marker ${n}`,
  modeCheapest: "Cheapest",
  modeShortest: "Shortest",

  modeTraffic: "Traffic",
  notSet: "Not set",
  origin: "Origin",
  overlayDrought: "Drought",
  overlayFlood: "Flood",
  overlayHotspot: "Hotspot",
  overlayImages: "Images",
  overlayPM25: "PM2.5",

  overlayTraffic: "Traffic",

  poiTags: "POI Tags",
  polygonN: (n) => `Polygon ${n}`,
  predefinedAQI: "AQI",

  predefinedCCTV: "CCTV",
  predefinedEvents: "Events",

  quickNavigation: "Quick Navigation",
  rectangleCorner: "Rectangle Corner",
  rectangleN: (n) => `Rectangle ${n}`,
  resultN: (n) => `Result ${n}`,
  reverseRoute: "Reverse route",

  routePlanning: "Route Planning",
  searchPlaceholder: "Search for places...",

  searchPlaces: "Search Places",
  searchResult: "Search Result",
  setDestinationOnMap: "Set destination on map",
  setOriginOnMap: "Set origin on map",
  shapes: "Shapes",
  toggleTagsHint: "Toggle tags to show points of interest",
  toolCircle: "Circle",
  toolDot: "Dot",
  toolLine: "Line",
  toolMarker: "Marker",

  toolPan: "Pan",
  toolPolygon: "Polygon",
  toolRect: "Rect",
  turnByTurn: (steps) => `Turn-by-Turn (${steps} steps)`,

  zoom: "Zoom",
};

const th: PlaygroundTranslations = {
  active: (count) => `${count} ที่ใช้งาน`,

  apiKeyError:
    "ตั้งค่า NEXT_PUBLIC_SPHERE_API_KEY ใน docs/.env.local เพื่อใช้งานสนามทดลอง",
  backToDocs: "กลับไปยังเอกสาร",

  baseLayer: "เลเยอร์ฐาน",
  calculate: "คำนวณเส้นทาง",
  calculating: "กำลังคำนวณ...",
  center: "จุดศูนย์กลาง",
  circleCenter: "จุดศูนย์กลางวงกลม",
  circleN: (n) => `วงกลม ${n}`,
  clearAll: "ล้างทั้งหมด",
  clearResults: "ล้างผลลัพธ์",
  clearRoute: "ล้างเส้นทาง",
  clickMapToSet: (point) => `คลิกบนแผนที่เพื่อกำหนด${point}`,
  clickOppositeCorner: "คลิกมุมตรงข้าม",
  clickToSetRadius: "คลิกเพื่อกำหนดรัศมี",
  controlCrosshair: "เส้นเล็ง",

  controlDPad: "ปุ่มทิศทาง",
  controlFullscreen: "เต็มหน้าจอ",
  controlGeolocation: "ตำแหน่งปัจจุบัน",
  controlScale: "มาตรส่วน",
  controlToolbar: "แถบเครื่องมือ",
  controlZoomBar: "แถบซูม",
  dataLayers: "เลเยอร์ข้อมูล",
  destination: "ปลายทาง",
  distance: "ระยะทาง",
  docs: "เอกสาร",
  dotN: (n) => `จุด ${n}`,

  drawingTools: "เครื่องมือวาด",
  duration: "ระยะเวลา",
  hideDirections: "ซ่อนเส้นทาง",
  hintCircle: "คลิกจุดศูนย์กลาง แล้วคลิกเพื่อกำหนดรัศมี",
  hintDot: "คลิกบนแผนที่เพื่อวางจุด",
  hintMarker: "คลิกบนแผนที่เพื่อวางหมุด",

  hintNone: "คลิกและลากเพื่อเลื่อนแผนที่",
  hintPolygon: "คลิกเพื่อเพิ่มจุด ดับเบิลคลิกเพื่อเสร็จสิ้น",
  hintPolyline: "คลิกเพื่อเพิ่มจุด ดับเบิลคลิกเพื่อเสร็จสิ้น",
  hintRectangle: "คลิกมุมหนึ่ง แล้วคลิกมุมตรงข้าม",
  interactivePlayground: "ทดลองเล่น",

  language: "ภาษา",
  layerHybrid: "ดาวเทียม",
  layerNight: "กลางคืน",

  layerSimple: "เรียบง่าย",
  layerStreets: "ถนน",
  lineN: (n) => `เส้น ${n}`,
  liveOverlays: "โอเวอร์เลย์สด",
  locAyutthaya: "อยุธยา",
  location: "ตำแหน่ง",

  locBangkok: "กรุงเทพฯ",
  locChiangMai: "เชียงใหม่",
  locPattaya: "พัทยา",
  locPhuket: "ภูเก็ต",
  locSukhothai: "สุโขทัย",

  mapControls: "ปุ่มควบคุมแผนที่",

  markerN: (n) => `หมุด ${n}`,
  modeCheapest: "ประหยัดที่สุด",
  modeShortest: "สั้นที่สุด",

  modeTraffic: "ตามการจราจร",
  notSet: "ยังไม่ได้กำหนด",
  origin: "ต้นทาง",
  overlayDrought: "ภัยแล้ง",
  overlayFlood: "น้ำท่วม",
  overlayHotspot: "จุดความร้อน",
  overlayImages: "ภาพถ่าย",
  overlayPM25: "PM2.5",

  overlayTraffic: "จราจร",

  poiTags: "แท็กจุดสนใจ",
  polygonN: (n) => `รูปหลายเหลี่ยม ${n}`,
  predefinedAQI: "คุณภาพอากาศ",

  predefinedCCTV: "กล้อง CCTV",
  predefinedEvents: "เหตุการณ์",

  quickNavigation: "นำทางด่วน",
  rectangleCorner: "มุมสี่เหลี่ยม",
  rectangleN: (n) => `สี่เหลี่ยม ${n}`,
  resultN: (n) => `ผลลัพธ์ ${n}`,
  reverseRoute: "สลับเส้นทาง",

  routePlanning: "วางแผนเส้นทาง",
  searchPlaceholder: "ค้นหาสถานที่...",

  searchPlaces: "ค้นหาสถานที่",
  searchResult: "ผลการค้นหา",
  setDestinationOnMap: "กำหนดปลายทางบนแผนที่",
  setOriginOnMap: "กำหนดต้นทางบนแผนที่",
  shapes: "รูปทรง",
  toggleTagsHint: "เปิด/ปิดแท็กเพื่อแสดงจุดสนใจ",
  toolCircle: "วงกลม",
  toolDot: "จุด",
  toolLine: "เส้น",
  toolMarker: "หมุด",

  toolPan: "เลื่อน",
  toolPolygon: "รูปหลายเหลี่ยม",
  toolRect: "สี่เหลี่ยม",
  turnByTurn: (steps) => `นำทางทีละขั้น (${steps} ขั้นตอน)`,

  zoom: "ระดับซูม",
};

const translations: Record<string, PlaygroundTranslations> = { en, th };

export function getTranslations(lang: string): PlaygroundTranslations {
  return translations[lang] ?? translations.en;
}

export function getDrawingHint(
  t: PlaygroundTranslations,
  mode: DrawingMode
): string {
  const hints: Record<DrawingMode, string> = {
    circle: t.hintCircle,
    dot: t.hintDot,
    marker: t.hintMarker,
    none: t.hintNone,
    polygon: t.hintPolygon,
    polyline: t.hintPolyline,
    rectangle: t.hintRectangle,
  };
  return hints[mode];
}

export type { PlaygroundTranslations };
