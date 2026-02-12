import type { DrawingMode } from "./constants";

interface PlaygroundTranslations {
  /** Sidebar */
  interactivePlayground: string;
  docs: string;
  backToDocs: string;

  /** MapStats */
  zoom: string;
  center: string;
  shapes: string;

  /** LayerSelector */
  baseLayer: string;
  dataLayers: string;
  liveOverlays: string;

  /** Base layer labels */
  layerSimple: string;
  layerStreets: string;
  layerNight: string;
  layerHybrid: string;

  /** Overlay layer labels */
  overlayTraffic: string;
  overlayImages: string;
  overlayPM25: string;
  overlayHotspot: string;
  overlayFlood: string;
  overlayDrought: string;

  /** Predefined overlay labels */
  predefinedCCTV: string;
  predefinedEvents: string;
  predefinedAQI: string;

  /** MapControlsPanel */
  mapControls: string;

  /** UI control labels */
  controlDPad: string;
  controlGeolocation: string;
  controlZoomBar: string;
  controlToolbar: string;
  controlFullscreen: string;
  controlCrosshair: string;
  controlScale: string;

  /** Language section */
  language: string;

  /** QuickNav */
  quickNavigation: string;

  /** Location labels */
  locBangkok: string;
  locChiangMai: string;
  locPhuket: string;
  locPattaya: string;
  locAyutthaya: string;
  locSukhothai: string;

  /** DrawingPanel */
  drawingTools: string;
  clearAll: string;

  /** Drawing tool labels */
  toolPan: string;
  toolMarker: string;
  toolDot: string;
  toolPolygon: string;
  toolLine: string;
  toolCircle: string;
  toolRect: string;

  /** Drawing hints */
  hintNone: string;
  hintMarker: string;
  hintDot: string;
  hintPolygon: string;
  hintPolyline: string;
  hintCircle: string;
  hintRectangle: string;

  /** SearchPanel */
  searchPlaces: string;
  searchPlaceholder: string;
  searchResult: string;
  clearResults: string;
  resultN: (n: number) => string;

  /** RoutePanel */
  routePlanning: string;
  origin: string;
  destination: string;
  notSet: string;
  setOriginOnMap: string;
  setDestinationOnMap: string;
  clickMapToSet: (point: string) => string;
  calculating: string;
  calculate: string;
  reverseRoute: string;
  clearRoute: string;
  distance: string;
  duration: string;
  hideDirections: string;
  turnByTurn: (steps: number) => string;

  /** Route mode labels */
  modeTraffic: string;
  modeShortest: string;
  modeCheapest: string;

  /** TagsPanel */
  poiTags: string;
  toggleTagsHint: string;
  active: (count: number) => string;

  /** MapView shape labels */
  markerN: (n: number) => string;
  dotN: (n: number) => string;
  polygonN: (n: number) => string;
  lineN: (n: number) => string;
  circleN: (n: number) => string;
  rectangleN: (n: number) => string;
  circleCenter: string;
  clickToSetRadius: string;
  rectangleCorner: string;
  clickOppositeCorner: string;
  location: string;

  /** Error */
  apiKeyError: string;
}

const en: PlaygroundTranslations = {
  interactivePlayground: "Interactive Playground",
  docs: "Docs",
  backToDocs: "Back to docs",

  zoom: "Zoom",
  center: "Center",
  shapes: "Shapes",

  baseLayer: "Base Layer",
  dataLayers: "Data Layers",
  liveOverlays: "Live Overlays",

  layerSimple: "Simple",
  layerStreets: "Streets",
  layerNight: "Night",
  layerHybrid: "Hybrid",

  overlayTraffic: "Traffic",
  overlayImages: "Images",
  overlayPM25: "PM2.5",
  overlayHotspot: "Hotspot",
  overlayFlood: "Flood",
  overlayDrought: "Drought",

  predefinedCCTV: "CCTV",
  predefinedEvents: "Events",
  predefinedAQI: "AQI",

  mapControls: "Map Controls",

  controlDPad: "D-Pad",
  controlGeolocation: "Geolocation",
  controlZoomBar: "Zoom Bar",
  controlToolbar: "Toolbar",
  controlFullscreen: "Fullscreen",
  controlCrosshair: "Crosshair",
  controlScale: "Scale",

  language: "Language",

  quickNavigation: "Quick Navigation",

  locBangkok: "Bangkok",
  locChiangMai: "Chiang Mai",
  locPhuket: "Phuket",
  locPattaya: "Pattaya",
  locAyutthaya: "Ayutthaya",
  locSukhothai: "Sukhothai",

  drawingTools: "Drawing Tools",
  clearAll: "Clear All",

  toolPan: "Pan",
  toolMarker: "Marker",
  toolDot: "Dot",
  toolPolygon: "Polygon",
  toolLine: "Line",
  toolCircle: "Circle",
  toolRect: "Rect",

  hintNone: "Click and drag to pan the map",
  hintMarker: "Click on the map to place a marker",
  hintDot: "Click on the map to place a dot",
  hintPolygon: "Click to add points, double-click to complete",
  hintPolyline: "Click to add points, double-click to complete",
  hintCircle: "Click center, then click to set radius",
  hintRectangle: "Click corner, then click opposite corner",

  searchPlaces: "Search Places",
  searchPlaceholder: "Search for places...",
  searchResult: "Search Result",
  clearResults: "Clear Results",
  resultN: (n) => `Result ${n}`,

  routePlanning: "Route Planning",
  origin: "Origin",
  destination: "Destination",
  notSet: "Not set",
  setOriginOnMap: "Set origin on map",
  setDestinationOnMap: "Set destination on map",
  clickMapToSet: (point) => `Click on the map to set ${point}`,
  calculating: "Calculating...",
  calculate: "Calculate",
  reverseRoute: "Reverse route",
  clearRoute: "Clear route",
  distance: "Distance",
  duration: "Duration",
  hideDirections: "Hide Directions",
  turnByTurn: (steps) => `Turn-by-Turn (${steps} steps)`,

  modeTraffic: "Traffic",
  modeShortest: "Shortest",
  modeCheapest: "Cheapest",

  poiTags: "POI Tags",
  toggleTagsHint: "Toggle tags to show points of interest",
  active: (count) => `${count} active`,

  markerN: (n) => `Marker ${n}`,
  dotN: (n) => `Dot ${n}`,
  polygonN: (n) => `Polygon ${n}`,
  lineN: (n) => `Line ${n}`,
  circleN: (n) => `Circle ${n}`,
  rectangleN: (n) => `Rectangle ${n}`,
  circleCenter: "Circle Center",
  clickToSetRadius: "Click to set radius",
  rectangleCorner: "Rectangle Corner",
  clickOppositeCorner: "Click opposite corner",
  location: "Location",

  apiKeyError:
    "Set NEXT_PUBLIC_SPHERE_API_KEY in docs/.env.local to use the playground.",
};

const th: PlaygroundTranslations = {
  interactivePlayground: "ทดลองเล่น",
  docs: "เอกสาร",
  backToDocs: "กลับไปยังเอกสาร",

  zoom: "ระดับซูม",
  center: "จุดศูนย์กลาง",
  shapes: "รูปทรง",

  baseLayer: "เลเยอร์ฐาน",
  dataLayers: "เลเยอร์ข้อมูล",
  liveOverlays: "โอเวอร์เลย์สด",

  layerSimple: "เรียบง่าย",
  layerStreets: "ถนน",
  layerNight: "กลางคืน",
  layerHybrid: "ดาวเทียม",

  overlayTraffic: "จราจร",
  overlayImages: "ภาพถ่าย",
  overlayPM25: "PM2.5",
  overlayHotspot: "จุดความร้อน",
  overlayFlood: "น้ำท่วม",
  overlayDrought: "ภัยแล้ง",

  predefinedCCTV: "กล้อง CCTV",
  predefinedEvents: "เหตุการณ์",
  predefinedAQI: "คุณภาพอากาศ",

  mapControls: "ปุ่มควบคุมแผนที่",

  controlDPad: "ปุ่มทิศทาง",
  controlGeolocation: "ตำแหน่งปัจจุบัน",
  controlZoomBar: "แถบซูม",
  controlToolbar: "แถบเครื่องมือ",
  controlFullscreen: "เต็มหน้าจอ",
  controlCrosshair: "เส้นเล็ง",
  controlScale: "มาตรส่วน",

  language: "ภาษา",

  quickNavigation: "นำทางด่วน",

  locBangkok: "กรุงเทพฯ",
  locChiangMai: "เชียงใหม่",
  locPhuket: "ภูเก็ต",
  locPattaya: "พัทยา",
  locAyutthaya: "อยุธยา",
  locSukhothai: "สุโขทัย",

  drawingTools: "เครื่องมือวาด",
  clearAll: "ล้างทั้งหมด",

  toolPan: "เลื่อน",
  toolMarker: "หมุด",
  toolDot: "จุด",
  toolPolygon: "รูปหลายเหลี่ยม",
  toolLine: "เส้น",
  toolCircle: "วงกลม",
  toolRect: "สี่เหลี่ยม",

  hintNone: "คลิกและลากเพื่อเลื่อนแผนที่",
  hintMarker: "คลิกบนแผนที่เพื่อวางหมุด",
  hintDot: "คลิกบนแผนที่เพื่อวางจุด",
  hintPolygon: "คลิกเพื่อเพิ่มจุด ดับเบิลคลิกเพื่อเสร็จสิ้น",
  hintPolyline: "คลิกเพื่อเพิ่มจุด ดับเบิลคลิกเพื่อเสร็จสิ้น",
  hintCircle: "คลิกจุดศูนย์กลาง แล้วคลิกเพื่อกำหนดรัศมี",
  hintRectangle: "คลิกมุมหนึ่ง แล้วคลิกมุมตรงข้าม",

  searchPlaces: "ค้นหาสถานที่",
  searchPlaceholder: "ค้นหาสถานที่...",
  searchResult: "ผลการค้นหา",
  clearResults: "ล้างผลลัพธ์",
  resultN: (n) => `ผลลัพธ์ ${n}`,

  routePlanning: "วางแผนเส้นทาง",
  origin: "ต้นทาง",
  destination: "ปลายทาง",
  notSet: "ยังไม่ได้กำหนด",
  setOriginOnMap: "กำหนดต้นทางบนแผนที่",
  setDestinationOnMap: "กำหนดปลายทางบนแผนที่",
  clickMapToSet: (point) => `คลิกบนแผนที่เพื่อกำหนด${point}`,
  calculating: "กำลังคำนวณ...",
  calculate: "คำนวณเส้นทาง",
  reverseRoute: "สลับเส้นทาง",
  clearRoute: "ล้างเส้นทาง",
  distance: "ระยะทาง",
  duration: "ระยะเวลา",
  hideDirections: "ซ่อนเส้นทาง",
  turnByTurn: (steps) => `นำทางทีละขั้น (${steps} ขั้นตอน)`,

  modeTraffic: "ตามการจราจร",
  modeShortest: "สั้นที่สุด",
  modeCheapest: "ประหยัดที่สุด",

  poiTags: "แท็กจุดสนใจ",
  toggleTagsHint: "เปิด/ปิดแท็กเพื่อแสดงจุดสนใจ",
  active: (count) => `${count} ที่ใช้งาน`,

  markerN: (n) => `หมุด ${n}`,
  dotN: (n) => `จุด ${n}`,
  polygonN: (n) => `รูปหลายเหลี่ยม ${n}`,
  lineN: (n) => `เส้น ${n}`,
  circleN: (n) => `วงกลม ${n}`,
  rectangleN: (n) => `สี่เหลี่ยม ${n}`,
  circleCenter: "จุดศูนย์กลางวงกลม",
  clickToSetRadius: "คลิกเพื่อกำหนดรัศมี",
  rectangleCorner: "มุมสี่เหลี่ยม",
  clickOppositeCorner: "คลิกมุมตรงข้าม",
  location: "ตำแหน่ง",

  apiKeyError:
    "ตั้งค่า NEXT_PUBLIC_SPHERE_API_KEY ใน docs/.env.local เพื่อใช้งานสนามทดลอง",
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
    none: t.hintNone,
    marker: t.hintMarker,
    dot: t.hintDot,
    polygon: t.hintPolygon,
    polyline: t.hintPolyline,
    circle: t.hintCircle,
    rectangle: t.hintRectangle,
  };
  return hints[mode];
}

export type { PlaygroundTranslations };
