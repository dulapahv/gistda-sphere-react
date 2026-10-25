/**
 * Type definitions for the GISTDA Sphere Map JavaScript API (`window.sphere`).
 *
 * Friendly names (e.g. `"Dashed"`, `"Traffic"`) are what this library's
 * components and hooks accept. The Sphere runtime itself uses different
 * values for several enums (dash arrays, single letters, bit flags); those
 * are modeled by the `*Value` types and converted for you internally.
 *
 * Reference: https://api.sphere.gistda.or.th/map/doc.html
 */

import type {
  GeoJSON,
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  GeoJSONGeometry,
} from "./geojson";

// ---------------------------------------------------------------------------
// Basic value types
// ---------------------------------------------------------------------------

/** A geographic coordinate in decimal degrees. */
export interface Location {
  lat: number;
  lon: number;
}

/** A 2D screen point in pixels. */
export interface Point {
  x: number;
  y: number;
}

/** An inclusive numeric range, e.g. a zoom range. */
export interface Range {
  max: number;
  min: number;
}

/** A geographic bounding box in decimal degrees. */
export interface Bound {
  maxLat: number;
  maxLon: number;
  minLat: number;
  minLon: number;
}

export interface Size {
  height: number;
  width: number;
}

/** A map tile address. */
export interface Tile {
  x: number;
  y: number;
  z: number;
}

/**
 * Marker icon. Provide either an image (`url`, optionally `urlHD`) or custom
 * HTML (`html`, which overrides `url`).
 */
export interface Icon {
  html?: string;
  offset?: Point;
  size?: Size;
  url?: string;
  urlHD?: string;
}

/** A location that also carries the screen point it came from (map mouse events). */
export interface PointerLocation extends Location, Point {}

/** Payload of the `wheel` event. */
export interface WheelEventData extends Point {
  delta: number;
}

// ---------------------------------------------------------------------------
// Enumerations (friendly names + runtime values)
// ---------------------------------------------------------------------------

/** Tile layer types. Runtime values equal the names. */
export type LayerType =
  | "Vector"
  | "XYZ"
  | "WMS"
  | "WMTS"
  | "WMTS_REST"
  | "TMS"
  | "Tiles3D"
  | "I3S";

/** Built-in layers available on `sphere.Layers`. */
export type BuiltInLayer =
  | "SIMPLE"
  | "STREETS"
  | "STREETS_NIGHT"
  | "HYBRID"
  | "TRAFFIC"
  | "IMAGES"
  | "PM25"
  | "HOTSPOT"
  | "FLOOD"
  | "DROUGHT";

/** Color filters. */
export type FilterType =
  | "Dark"
  | "Light"
  | "Protanopia"
  | "Deuteranopia"
  | "None";

/** Runtime value of `sphere.Filter.*` (`None` is `false`). */
export type FilterValue =
  | "DARK"
  | "LIGHT"
  | "PROTANOPIA"
  | "DEUTERANOPIA"
  | false;

/** Line styles for geometries. */
export type LineStyleType = "Solid" | "Dashed" | "Dot";

/**
 * Runtime value of `sphere.LineStyle.*`: a dash array of `[dash, gap]`
 * lengths (`Solid` is `[0]`). Custom dash arrays are also accepted.
 */
export type LineStyleValue = number[];

/** Map/UI language in ISO 639-1. Sphere supports Thai and English. */
export type Language = "th" | "en";

/** Built-in UI modes. */
export type UiComponentMode = "Full" | "Mobile" | "None";

/** Runtime value of `sphere.UiComponent.*` (`None` is `false`). */
export type UiComponentValue = "FULL" | "MOBILE" | false;

/**
 * Routing modes: `Traffic` (fastest, avoiding traffic jams with live and
 * predicted traffic; the default), `Cost` (fastest by road, without traffic
 * data), `Distance` (shortest) and `Fly` (straight lines, calculated
 * locally without the routing service).
 */
export type RouteMode = "Traffic" | "Cost" | "Distance" | "Fly";

/** Runtime value of `sphere.RouteMode.*`. */
export type RouteModeValue = "t" | "c" | "d" | "f";

/** Kinds of route the router may use. */
export type RouteType = "Road" | "Ferry" | "Tollway" | "All";

/**
 * Runtime value of `sphere.RouteType.*`: a bit flag
 * (`Road` 1, `Ferry` 8, `Tollway` 16, `All` 127).
 */
export type RouteTypeValue = number;

/** Route label display modes. */
export type RouteLabelType = "Distance" | "Time" | "Hide";

/** Runtime value of `sphere.RouteLabel.*` (`Hide` is `false`). */
export type RouteLabelValue = "d" | "t" | false;

/** Parts of a drawn route that can be styled with `Route.line()`. */
export type RouteLineType = "Destination" | "Road" | "Ferry" | "Focus";

/** Runtime value of `sphere.RouteLine.*`. */
export type RouteLineValue = "destination" | "road" | "ferry" | "focus";

/** Vehicle restrictions for routing. `Bike` avoids roads closed to motorcycles. */
export type RouteRestrictType = "Bike";

/** Remote tag (WFS/OGC) source types. Runtime values equal the names. */
export type TagType = "WFS" | "OGC";

/** Live data overlays available on `sphere.Overlays`. */
export type PredefinedOverlay = "cameras" | "events" | "aqi";

/** Names of the built-in UI controls on `map.Ui`. */
export type UiControlName =
  | "DPad"
  | "Geolocation"
  | "Zoombar"
  | "Toolbar"
  | "LayerSelector"
  | "Fullscreen"
  | "Crosshair"
  | "Scale"
  | "ContextMenu";

/**
 * Turn codes used in route guides (`RouteGuideStep.turn`).
 * 0 left, 1 right, 2 slight left, 3 slight right, 4 head toward,
 * 5 straight, 6 enter (expressway), 7 U-turn, 9 arrive, 11 ferry.
 */
export type RouteTurnCode = number;

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/**
 * Options for `new sphere.Map()`. Any MapLibre `MapOptions` (e.g. `maxPitch`,
 * `minPitch`, `hash`) are passed through to the renderer.
 */
export interface MapOptions {
  input?: boolean;
  language?: Language;
  lastView?: boolean;
  layer?: SphereLayer;
  location?: Location;
  placeholder?: HTMLElement;
  ui?: UiComponentValue;
  zoom?: number;
  zoomRange?: Range;
  [key: string]: unknown;
}

/** Information passed to a 3D tileset's `onTilesetLoad` callback. */
export interface TilesetInfo {
  /** `[lon, lat, height]` of the tileset center. */
  cartographicCenter?: number[];
  zoom?: number;
  [key: string]: unknown;
}

/** Options for `new sphere.Layer(name, options)`. */
export interface LayerOptions {
  attribution?: string;
  bound?: Bound;
  extraQuery?: string;
  /** MIME type (WMS/WMTS) or file extension (XYZ/TMS/WMTS_REST). `false` omits the extension. */
  format?: string | false;
  id?: string;
  /** Tiles3D/I3S: loaders.gl options under `3d-tiles`, `i3s` or `tileset` keys. */
  loadOptions?: Record<string, unknown>;
  /** Tiles3D/I3S: called with tileset info once it has loaded. */
  onTilesetLoad?: (tileset: TilesetInfo) => void;
  opacity?: number;
  /** Tiles3D: point cloud point radius in pixels. */
  pointSize?: number;
  /** Auto-refresh interval in seconds. */
  refresh?: number;
  source?: Range;
  srs?: string;
  styles?: string;
  tileMatrixPrefix?: string;
  type?: LayerType;
  url?: string;
  version?: string;
  zIndex?: number;
  zoomOffset?: number;
  zoomRange?: Range;
}

/** Options for `new sphere.Popup(location, options)`. */
export interface PopupOptions {
  closable?: boolean;
  detail?: string;
  html?: string;
  loadDetail?: (element: HTMLElement) => void;
  loadHtml?: (element: HTMLElement) => void;
  size?: Size;
  title?: string;
}

/** Options for `new sphere.Marker(location, options)`. */
export interface MarkerOptions {
  clickable?: boolean;
  detail?: string;
  draggable?: boolean;
  icon?: Icon;
  popup?: PopupOptions;
  rotate?: number;
  title?: string;
  visibleRange?: Range;
  zIndex?: number;
}

/**
 * Geometry options as accepted by this library's components. `lineStyle`
 * takes a friendly name or a custom dash array.
 */
export interface GeometryOptions {
  clickable?: boolean;
  detail?: string;
  draggable?: boolean;
  /** Allow the user to edit vertices (polygons and rectangles). */
  editable?: boolean;
  fillColor?: string;
  /** Text label shown at the pivot, or `true` to use the title. */
  label?: string | boolean;
  labelOptions?: MarkerOptions;
  lineColor?: string;
  lineStyle?: LineStyleType | LineStyleValue;
  lineWidth?: number;
  pivot?: Location | (() => Location);
  pointer?: boolean;
  popup?: PopupOptions;
  title?: string;
  visibleRange?: Range;
  zIndex?: number;
}

/** Geometry options exactly as the Sphere runtime expects them. */
export interface SphereGeometryOptions
  extends Omit<GeometryOptions, "lineStyle" | "label"> {
  label?: string | boolean | object;
  lineStyle?: LineStyleValue;
}

/** Extra options for `sphere.Overlays.Object`. */
export interface ObjectOptions {
  /** Combine multiple objects into one. */
  combine?: boolean;
  /** Skip small fragments of the object. */
  ignorefragment?: boolean;
  /** Simplification tolerance, roughly 0.00005 (fine) to 0.001 (rough). */
  simplify?: number;
}

/** A menu bar button. */
export interface MenuItem {
  label: string;
  value?: unknown;
}

/** Options for `new sphere.MenuBar(options)`. */
export interface MenuBarOptions {
  button: MenuItem[];
  change?: (current: MenuItem, previous: MenuItem | null) => void;
}

/** Options for `map.Search.placeholder(element, options)`. */
export interface SearchUiOptions {
  /** Result marker icon, or `false` to search without markers. */
  icon?: Icon | boolean;
}

export interface SuggestOptions {
  area?: string;
  dataset?: string;
  limit?: number;
  offset?: number;
}

export interface SearchOptions {
  area?: string;
  dataset?: string;
  limit?: number;
  offset?: number;
  /** Search span with a unit, e.g. `"5km"`, `"500m"`, `"0.1deg"`. */
  span?: string;
  tag?: string;
}

export interface AddressOptions {
  dataset?: string;
  limit?: number;
}

export interface NearPoiOptions {
  limit?: number;
  /** Search span in degrees. */
  span?: number;
  zoom?: number;
}

/**
 * Options for `map.Tags.set/add`. WFS/OGC tags also accept deck.gl
 * `GeoJsonLayer` props (e.g. `pickable`, `getLineWidth`, `onClick`).
 */
export interface TagOptions {
  area?: string;
  dataset?: string;
  extraQuery?: string;
  /** Icon, or `"big"`/`"small"` for the default icons at another size. */
  icon?: Icon | "big" | "small";
  /** Label visibility range, or `true` to always show labels. */
  label?: Range | boolean;
  /** WFS/OGC: data name. */
  name?: string;
  source?: string;
  type?: TagType;
  version?: string;
  visibleRange?: Range;
  [key: string]: unknown;
}

/** Options for `map.goTo()` (MapLibre `EaseToOptions`/`JumpToOptions`). */
export interface FlyToOptions {
  bearing?: number;
  center?: Location | [number, number];
  duration?: number;
  padding?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
  pitch?: number;
  zoom?: number;
  [key: string]: unknown;
}

/** Options for `map.bound(value, options)` (MapLibre `FitBoundsOptions`). */
export interface FitBoundsOptions {
  duration?: number;
  linear?: boolean;
  maxZoom?: number;
  padding?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
  [key: string]: unknown;
}

/** Options for `map.Ui.lockMap()` (official option names). */
export interface LockMapOptions {
  lockButtonClassName: string;
  onLockLabel: string;
  onUnlockLabel: string;
  unlockButtonClassName: string;
}

// ---------------------------------------------------------------------------
// Results returned by the API
// ---------------------------------------------------------------------------

/** One turn-by-turn instruction of a route leg. */
export interface RouteGuideStep {
  /** Distance of this step in meters. */
  distance: number;
  /** Estimated travel time of this step in seconds (absent in Fly mode). */
  interval?: number;
  /** Road name. */
  name: string;
  /** Turn code, see {@link RouteTurnCode}. */
  turn: RouteTurnCode;
}

/** Summary of one route leg. */
export interface RouteLegData {
  /** Total distance in meters (includes the walk to/from the road). */
  distance: number;
  /** Distance from the origin to the nearest road, in meters. */
  fdistance?: number;
  /** Total travel time in seconds. */
  interval: number;
  /** Distance from the nearest road to the destination, in meters. */
  tdistance?: number;
  [key: string]: unknown;
}

/** One calculated leg between two consecutive destinations. */
export interface RouteResult {
  data: RouteLegData;
  guide?: RouteGuideStep[];
  meta?: { [key: string]: unknown; status?: number };
  path?: SpherePolyline[];
}

/** Envelope shared by search-style results. */
export interface SearchMeta {
  end?: number;
  hasmore?: boolean;
  keyword?: string;
  lat?: number;
  lon?: number;
  start?: number;
  [key: string]: unknown;
}

/** A place returned by search or nearby POI lookups. */
export interface PoiResult {
  address?: string;
  contributor?: string;
  /** Distance from the requested location in meters (when available). */
  distance?: number;
  icon?: string;
  id: string;
  lat: number;
  lon: number;
  name: string;
  obsoleted?: boolean;
  tag?: string[];
  tel?: string;
  type?: string;
  url?: string;
  verified?: boolean;
  [key: string]: unknown;
}

/** A suggestion returned by `Search.suggest`. */
export interface SuggestResult {
  dataset?: string;
  /** Suggestion with the matched part wrapped in HTML. */
  highlight?: string;
  name: string;
}

export interface SearchResponse<T> {
  data: T[];
  meta?: SearchMeta;
}

/** Reverse-geocoded address. */
export interface AddressResult {
  address?: string;
  district?: string;
  geocode?: string | number;
  postcode?: string | number;
  province?: string;
  road?: string;
  subdistrict?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** Payload of the `beforeContextmenu` event. Return `false` to cancel the menu. */
export interface MenuEvent {
  add: (element: Element | string) => void;
  location: Location;
}

/**
 * Arguments passed to handlers of each Sphere event, as verified against
 * the runtime. Handlers may return `false` to cancel cancellable events.
 */
export interface SphereEventMap {
  beforeContextmenu: [menu: MenuEvent];
  click: [location: PointerLocation];
  contextmenu: [];
  doubleClick: [location: PointerLocation];
  drag: [];
  drawCreate: [features: GeoJSONFeature[]];
  drawDelete: [features: GeoJSONFeature[]];
  drop: [];
  error: [error: unknown];
  fullscreen: [isFullscreen: boolean];
  idle: [];
  layerChange: [
    added: SphereLayer | object | undefined,
    removed?: SphereLayer | object,
  ];
  location: [];
  mousemove: [location: PointerLocation];
  overlayChange: [overlay?: SphereOverlay];
  overlayClick: [overlay: SphereOverlay, location: Location];
  overlayDrag: [overlay: SphereOverlay];
  overlayDrop: [overlay: SphereOverlay];
  overlayHover: [overlay: SphereOverlay];
  overlayLeave: [overlay: SphereOverlay];
  overlayLoad: [data: unknown];
  overlayUpdate: [overlay: SphereOverlay];
  pitch: [];
  popupClose: [popup: SpherePopup];
  ready: [];
  repaint: [];
  resize: [];
  rotate: [];
  routeComplete: [routes: RouteResult[]];
  routeError: [status: number];
  tileLoaded: [sourceId: string];
  tileLoading: [sourceId: string];
  toolbarChange: [mode: string];
  tooltipChange: [message: unknown];
  wheel: [data: WheelEventData];
  zoom: [];
  zoomRange: [range: Range];
}

export type EventName = keyof SphereEventMap;

/** Handler for a specific event. Return `false` to cancel cancellable events. */
export type SphereEventHandler<K extends EventName> = (
  ...args: SphereEventMap[K]
  // biome-ignore lint/suspicious/noConfusingVoidType: handlers may return nothing or a cancel flag
) => void | boolean;

/**
 * Generic single-argument handler kept for backward compatibility.
 * Prefer {@link SphereEventHandler}.
 */
// biome-ignore lint/suspicious/noConfusingVoidType: Event handlers can return void, undefined, or boolean
export type EventHandler<T = void> = (data: T) => void | undefined | boolean;

/** `{ overlay, location }` shape used by `useOverlayClick`. */
export interface OverlayClickEventData {
  location?: Location;
  overlay: SphereOverlay;
}

export type OverlayEventData = SphereOverlay;

export type PopupCloseEventData = SpherePopup;

export interface SphereEvent {
  bind: <K extends EventName>(
    eventName: K,
    handler: SphereEventHandler<K>
  ) => SphereEvent;
  /** Undocumented: fire an event manually. */
  fire?: <K extends EventName>(
    eventName: K,
    ...args: SphereEventMap[K]
  ) => boolean;
  unbind: <K extends EventName>(
    eventName: K,
    handler: SphereEventHandler<K>
  ) => SphereEvent;
}

// ---------------------------------------------------------------------------
// Renderer (MapLibre)
// ---------------------------------------------------------------------------

/** A MapLibre control (`IControl`). */
export interface MapLibreControl {
  getDefaultPosition?: () => string;
  onAdd: (map: MapLibreMap) => HTMLElement;
  onRemove: (map: MapLibreMap) => void;
}

/**
 * The MapLibre GL `Map` instance behind `map.Renderer`. Only commonly used
 * members are typed; everything else is still reachable.
 */
export interface MapLibreMap {
  addControl: (
    control: MapLibreControl | object,
    position?: string
  ) => MapLibreMap;
  addLayer: (layer: object, beforeId?: string) => MapLibreMap;
  addSource: (id: string, source: object) => MapLibreMap;
  easeTo: (options: object) => MapLibreMap;
  fitBounds: (bounds: unknown, options?: object) => MapLibreMap;
  flyTo: (options: object) => MapLibreMap;
  getBearing: () => number;
  getCanvas: () => HTMLCanvasElement;
  getContainer: () => HTMLElement;
  getLayer: (id: string) => unknown;
  getPitch: () => number;
  getSource: (id: string) => unknown;
  getStyle: () => {
    [key: string]: unknown;
    layers: Array<{ id: string; type: string }>;
  };
  getZoom: () => number;
  hasControl: (control: MapLibreControl | object) => boolean;
  loaded: () => boolean;
  off: (type: string, ...args: unknown[]) => MapLibreMap;
  on: (type: string, ...args: unknown[]) => MapLibreMap;
  once: (type: string, ...args: unknown[]) => unknown;
  queryRenderedFeatures: (...args: unknown[]) => GeoJSONFeature[];
  querySourceFeatures: (
    sourceId: string,
    parameters?: object
  ) => GeoJSONFeature[];
  remove: () => void;
  removeControl: (control: MapLibreControl | object) => MapLibreMap;
  removeLayer: (id: string) => MapLibreMap;
  removeSource: (id: string) => MapLibreMap;
  resize: () => MapLibreMap;
  setLayoutProperty: (
    layerId: string,
    name: string,
    value: unknown
  ) => MapLibreMap;
  setPaintProperty: (
    layerId: string,
    name: string,
    value: unknown
  ) => MapLibreMap;
  triggerRepaint: () => void;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Instances
// ---------------------------------------------------------------------------

/** A Sphere layer. Its `style` is a MapLibre style, style URL, or deck.gl layer factory. */
export interface SphereLayer {
  id?: string;
  style?: unknown;
  [key: string]: unknown;
}

export interface SphereLayerCollection {
  add: (
    layer: SphereLayer | object,
    beforeId?: string
  ) => SphereLayerCollection;
  clear: () => SphereLayerCollection;
  /** Undocumented alias of `add(layer, beforeId)` with the arguments swapped. */
  insert: (
    beforeId: string,
    layer: SphereLayer | object
  ) => SphereLayerCollection;
  language: (value?: Language) => Language | SphereLayerCollection | null;
  list: () => object[];
  remove: (layer: SphereLayer | object) => SphereLayerCollection;
  /** Set the base layer: a Sphere layer, a MapLibre style object, or a style URL. */
  setBase: (layer: SphereLayer | object | string) => SphereLayerCollection;
  size: () => number;
}

/** Members shared by every overlay. Spatial predicates require an overlay argument at runtime. */
export interface SphereOverlay {
  active: () => boolean;
  contains: (overlay: SphereOverlay) => boolean;
  distance: (overlay: SphereOverlay, language?: string) => number | string;
  intersects: (overlay: SphereOverlay) => boolean;
  /** Get the location, or move the overlay (`animate`: `true` = 150 ms or a duration in ms). */
  location: (
    geojson?: Location | Location[] | GeoJSON,
    animate?: boolean | number
  ) => Location | Location[] | SphereOverlay;
  shift: (vector: Location) => SphereOverlay;
  toJSON: (key?: string) => GeoJSONFeature;
  visibleRange: () => Range;
  within: (overlay: SphereOverlay) => boolean;
}

export interface SphereMarker extends SphereOverlay {
  /** The marker's DOM element (HTML icons only). */
  element: () => HTMLElement | undefined;
  pop: (mode?: boolean) => SphereMarker;
  popup: () => SpherePopup | null;
  /** Only `draggable` and `rotate` can be updated. */
  update: (
    newOptions: Pick<MarkerOptions, "draggable" | "rotate">
  ) => SphereMarker;
}

export interface SpherePopup extends SphereOverlay {
  detail: (value?: string) => HTMLElement | SpherePopup;
  element: () => HTMLElement | undefined;
  title: (value?: string) => HTMLElement | SpherePopup;
}

export interface SpherePolyline extends SphereOverlay {
  bound: () => Bound;
  centroid: () => Location;
  pivot: () => Location;
  pop: (mode?: boolean, location?: Location) => SpherePolyline;
  popup: () => SpherePopup | null;
  rotate: (angle: number) => SpherePolyline;
  /** Length in meters, or formatted text when a language is given. */
  size: (language?: string) => number | string;
  /** Combine with another geometry of the same kind. */
  // biome-ignore lint/style/useConsistentMethodSignatures: method syntax lets SpherePolygon narrow the parameter, mirroring Sphere's class hierarchy
  union(
    overlay: SpherePolyline,
    options?: SphereGeometryOptions
  ): SpherePolyline;
  /** Only `lineWidth`, `lineColor`, `fillColor` and `lineStyle` can be updated. */
  update: (
    newOptions: Pick<
      SphereGeometryOptions,
      "lineWidth" | "lineColor" | "fillColor" | "lineStyle"
    >
  ) => SpherePolyline;
}

export interface SpherePolygon extends SpherePolyline {
  difference: (
    overlay: SpherePolygon,
    options?: SphereGeometryOptions
  ) => SpherePolygon;
  intersection: (
    overlay: SpherePolygon,
    options?: SphereGeometryOptions
  ) => SpherePolygon;
  split: (
    splitter: SpherePolygon,
    options?: SphereGeometryOptions
  ) => SpherePolygon[];
  // biome-ignore lint/style/useConsistentMethodSignatures: narrows SpherePolyline.union (see there)
  union(overlay: SpherePolygon, options?: SphereGeometryOptions): SpherePolygon;
}

export interface SphereCircle extends SpherePolyline {
  /** Radius in meters, or formatted text when a language is given. */
  radius: (language?: string) => number | string;
}

export interface SphereDot extends SpherePolyline {}

export interface SphereRectangle extends SpherePolygon {}

/** An instance of `sphere.Overlays.Object`. */
export interface SphereObjectOverlay {
  items?: unknown[];
  /** Overlays created once the object has loaded. */
  overlays?: Array<SphereMarker | SpherePolyline | SpherePolygon>;
  popup: boolean;
  url: string;
  [key: string]: unknown;
}

/** Configuration object of a predefined overlay (`sphere.Overlays.cameras` etc.). */
export interface PredefinedOverlayConfig {
  /** Cameras only: enable motion (video) cameras. */
  motion?: boolean;
  popup?: boolean;
  /** Auto-refresh interval in seconds. */
  refresh?: number;
  [key: string]: unknown;
}

export interface SphereOverlayCollection {
  add: (overlay: SphereOverlay) => SphereOverlayCollection;
  clear: () => SphereOverlayCollection;
  lastOpenPopup: () => SpherePopup | null;
  list: () => SphereOverlay[];
  load: (
    mode: PredefinedOverlayConfig | SphereObjectOverlay
  ) => SphereOverlayCollection;
  remove: (overlay: SphereOverlay) => SphereOverlayCollection;
  size: () => number;
  unload: (
    mode: PredefinedOverlayConfig | SphereObjectOverlay
  ) => SphereOverlayCollection;
}

/** A UI control that can be shown or hidden. */
export interface SphereUiControl {
  visible: (state?: boolean) => boolean | SphereUiControl | undefined;
}

/** The geolocation control (a MapLibre `GeolocateControl`). */
export interface SphereGeolocationControl extends SphereUiControl {
  /** Hide the current-location marker. */
  removeMarker: () => void;
  /** Locate the user and show the current-location marker. */
  trigger: () => boolean;
  [key: string]: unknown;
}

export interface SphereContextMenu extends SphereUiControl {
  enableAddress: (state?: boolean) => boolean | SphereContextMenu;
  enableNearPoi: (state?: boolean) => boolean | SphereContextMenu;
}

export interface SphereKeyboard {
  enable: (state?: boolean) => boolean | SphereKeyboard;
}

export interface SphereMouse {
  enable: (state?: boolean) => boolean | SphereMouse;
  enableClick: (state?: boolean) => boolean | SphereMouse;
  enableDrag: (state?: boolean) => boolean | SphereMouse;
  enableWheel: (state?: boolean) => boolean | SphereMouse;
}

export interface SphereLayerSelector extends SphereUiControl {
  language: (value?: Language) => Language | SphereLayerSelector;
}

/**
 * Built-in UI controls. Controls are absent when the map was created with
 * `ui: "None"`; `Toolbar` and `Fullscreen` are absent or hidden in mobile mode
 * (narrower than 600px or `ui: "Mobile"`).
 */
export interface SphereUiCollection {
  add: (
    control: MapLibreControl | SphereCustomControl | object
  ) => SphereUiCollection;
  ContextMenu?: SphereContextMenu;
  Crosshair?: SphereUiControl;
  DPad?: SphereUiControl;
  Fullscreen?: SphereUiControl;
  Geolocation?: SphereGeolocationControl;
  Keyboard?: SphereKeyboard;
  LayerSelector?: SphereLayerSelector;
  language: (value?: Language) => Language | SphereUiCollection;
  /** Cover the map with a lock overlay and toggle button. Starts locked. */
  lockMap: (options: LockMapOptions) => void;
  Mouse?: SphereMouse;
  remove: (
    control: MapLibreControl | SphereCustomControl | object
  ) => SphereUiCollection;
  Scale?: SphereUiControl;
  /** Drawing toolbar (desktop only). Becomes a MapboxDraw instance once shown. */
  Toolbar?: SphereUiControl & { [key: string]: unknown };
  Zoombar?: SphereUiControl;
}

export interface SphereSearch {
  address: (
    location: Location,
    options?: AddressOptions
  ) => Promise<AddressResult | null>;
  clear: () => SphereSearch;
  enablePopup: (state?: boolean) => boolean | SphereSearch;
  language: (value?: Language) => Language | SphereSearch;
  nearPoi: (
    location: Location,
    options?: NearPoiOptions
  ) => Promise<SearchResponse<PoiResult> | null>;
  placeholder: (
    value?: HTMLElement,
    options?: SearchUiOptions
  ) => HTMLElement | SphereSearch | undefined;
  search: (
    keyword: string,
    options?: SearchOptions
  ) => Promise<SearchResponse<PoiResult> | null>;
  suggest: (
    keyword: string,
    options?: SuggestOptions
  ) => Promise<SearchResponse<SuggestResult> | null>;
}

export interface SphereTagCollection {
  add: (
    tag: string | ((tile: Tile) => object[]),
    options?: TagOptions
  ) => SphereTagCollection;
  clear: () => SphereTagCollection;
  enablePopup: (state?: boolean) => boolean | SphereTagCollection;
  language: (value?: Language) => Language | SphereTagCollection;
  list: () => string[];
  remove: (tag: string) => SphereTagCollection;
  set: (
    tag: string | ((tile: Tile) => object[]),
    options?: TagOptions
  ) => SphereTagCollection;
  size: () => number;
}

export interface SphereRoute {
  add: (
    destination: SphereMarker | Location,
    mode?: RouteModeValue
  ) => SphereRoute;
  auto: (state?: boolean) => boolean | SphereRoute;
  clear: () => SphereRoute;
  clearDestination: () => SphereRoute;
  clearPath: () => SphereRoute;
  distance: (format?: boolean) => number | string;
  enableContextMenu: () => SphereRoute;
  enableRestrict: (
    routeRestrict: number,
    state?: boolean
  ) => boolean | SphereRoute;
  /** Getter without arguments returns the enabled route-type bit mask. */
  enableRoute: (
    routeType?: RouteTypeValue,
    state?: boolean
  ) => boolean | number | SphereRoute;
  exportRouteLine: (options?: SphereGeometryOptions) => SpherePolyline;
  /** Legs without `format`, or a formatted guide `DocumentFragment` with `format`. */
  guide: (format?: boolean) => RouteResult[] | DocumentFragment;
  insert: (
    index: number,
    destination: SphereMarker | Location,
    mode?: RouteModeValue
  ) => SphereRoute;
  interval: (format?: boolean) => number | string;
  label: (value?: RouteLabelValue) => RouteLabelValue | SphereRoute;
  language: (value?: Language) => Language | SphereRoute;
  line: (
    type: RouteLineValue,
    value?: SphereGeometryOptions
  ) => SphereGeometryOptions | SphereRoute;
  list: () => SphereMarker[];
  mode: (value?: RouteModeValue) => RouteModeValue | SphereRoute;
  modeOf: (
    index: number,
    value?: RouteModeValue
  ) => RouteModeValue | SphereRoute;
  placeholder: (value?: HTMLElement) => HTMLElement | SphereRoute | undefined;
  remove: (destination: SphereMarker) => SphereRoute;
  removeAt: (index: number) => SphereRoute;
  reverse: () => SphereRoute;
  search: () => SphereRoute;
  size: () => number;
}

/** A `sphere.Map` instance. */
export interface SphereMap {
  /** Get the visible bounding box, or fit the map to one. */
  bound: (value?: Bound, options?: FitBoundsOptions) => Bound | SphereMap;
  Event: SphereEvent;
  enableFilter: (filter?: FilterValue) => FilterValue | "OTHER" | SphereMap;
  goTo: (target: FlyToOptions, animate?: boolean) => SphereMap;
  id: () => number;
  Layers: SphereLayerCollection;
  language: (value?: Language) => Language | SphereMap;
  location: (value?: Location, animate?: boolean) => Location | SphereMap;
  move: (offset: Point, animate?: boolean) => SphereMap;
  Overlays: SphereOverlayCollection;
  pitch: (angle?: number) => number | SphereMap;
  placeholder: () => HTMLElement;
  /** The underlying MapLibre GL map. */
  Renderer: MapLibreMap;
  Route: SphereRoute;
  repaint: () => SphereMap;
  resize: () => SphereMap;
  rotate: (angle?: number, animate?: boolean) => number | SphereMap;
  Search: SphereSearch;
  Tags: SphereTagCollection;
  Ui: SphereUiCollection;
  /** Get the zoom, set it, or pass `true`/`false` to zoom in/out one level. */
  zoom: (value?: number | boolean, animate?: boolean) => number | SphereMap;
  zoomRange: (value?: Range) => Range | SphereMap;
}

/** A `sphere.CustomControl`: a MapLibre control with HTML content. */
export interface SphereCustomControl extends MapLibreControl {
  visible: (state?: boolean) => boolean | SphereCustomControl;
}

/** A `sphere.MenuBar`. */
export interface SphereMenuBar extends SphereCustomControl {
  /** Select a button by index; a negative index clears the selection. */
  selectIndex: (index: number) => SphereMenuBar;
}

// ---------------------------------------------------------------------------
// Namespace (`window.sphere`)
// ---------------------------------------------------------------------------

/** Positions/overlay input accepted by geometry constructors. */
export type GeometryInput = Array<Location | null> | GeoJSON;

/** Utility functions on `sphere.Util`. */
export interface SphereUtil {
  append: (
    element: Element,
    childName: string,
    propertyMap?: object
  ) => HTMLElement;
  bound: (value: number, min: number, max: number) => number;
  EsriJSONToGeoJSON: (json: object) => GeoJSON;
  empty: (element: Element) => Element;
  formatArea: (area: number, language: string) => string;
  formatDate: (date: string, language: string) => string;
  formatDateTimeRange: (
    startDatetime: string,
    stopDatetime: string,
    language: string
  ) => string;
  formatDistance: (distance: number, language: string) => string;
  formatInterval: (interval: number, language: string) => string;
  /** Override to customize the default POI popup content. */
  formatPoi?: (poi: PoiResult, language: string) => HTMLElement;
  formatThaiArea: (area: number, language: string) => string;
  formatTime: (time: string) => string;
  GMLToGeoJSON: (doc: Document | string) => GeoJSON;
  GPXToGeoJSON: (doc: Document | string) => GeoJSONFeatureCollection;
  getJson: (url: string) => Promise<unknown>;
  /** Load an optional library (`wkt`, `kml`, `gpx`, `gml`, `esrijson`, `topojson`, `project`, `i3s`). */
  initLibrary: (library: string) => Promise<unknown>;
  isAbsInRange: (value: number, range: number) => boolean;
  isHD: () => number;
  KMLToGeoJSON: (doc: Document | string) => GeoJSONFeatureCollection;
  latitudeLength: (lat: number) => number;
  loadScript: (url: string, callback?: (isLoad: boolean) => void) => void;
  loadStyle: (url: string, media?: string) => void;
  longitudeLength: (lat: number) => number;
  /** Override to replace the default POI popup options. */
  poiPopupOptions?: (
    source: string,
    id: string,
    name: string,
    language: string
  ) => PopupOptions;
  prepend: (
    element: Element,
    childName: string,
    propertyMap?: object,
    beforeElement?: Element
  ) => HTMLElement;
  /** `project(to, coordinates)` or `project(from, to, coordinates)`. Requires `initLibrary("project")`. */
  project: (
    ...args: [string, object | number[]] | [string, string, object | number[]]
  ) => unknown;
  sameLocation: (a: Location, b: Location) => boolean;
  TopoJSONToGeoJSON: (json: object, object: object | string) => GeoJSON;
  validateLocation: (location: Location) => boolean;
  WKTToGeoJSON: (text: string) => GeoJSONGeometry;
  [key: string]: unknown;
}

/** Geometry math helpers on `sphere.Math`. */
export interface SphereMath {
  closestPointOnLine: (
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => Point;
  distance: (dx: number, dy: number) => number;
  lineIntersectPoint: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    u1: number,
    v1: number,
    u2: number,
    v2: number,
    skipOverlap?: boolean
  ) => Point | number[] | null;
  [key: string]: unknown;
}

export interface SphereNamespace {
  Circle: new (
    location: Location | GeoJSON,
    radius: number,
    options?: SphereGeometryOptions
  ) => SphereCircle;
  CustomControl: new (content: string) => SphereCustomControl;
  Dot: new (
    location: Location | GeoJSON,
    options?: SphereGeometryOptions
  ) => SphereDot;
  EventName: Record<string, EventName>;
  Filter: Record<FilterType, FilterValue>;
  Layer: new (
    nameOrStyle: string | object,
    options?: LayerOptions
  ) => SphereLayer;
  Layers: Record<BuiltInLayer, SphereLayer>;
  LayerType: Record<LayerType, LayerType>;
  LineStyle: Record<LineStyleType, LineStyleValue>;
  Map: new (options?: MapOptions) => SphereMap;
  /** Theme and label configuration (undocumented). */
  MapTheme?: { [key: string]: unknown };
  Marker: new (
    location: Location | GeoJSON,
    options?: MarkerOptions
  ) => SphereMarker;
  Math: SphereMath;
  MenuBar: new (options: MenuBarOptions) => SphereMenuBar;
  ObjectLabel: { Title: object };
  Overlays: Record<PredefinedOverlay, PredefinedOverlayConfig> & {
    Object: new (
      id: string,
      dataset?: string,
      options?: object
    ) => SphereObjectOverlay;
  };
  Polygon: new (
    locationList: GeometryInput,
    options?: SphereGeometryOptions
  ) => SpherePolygon;
  Polyline: new (
    locationList: GeometryInput,
    options?: SphereGeometryOptions
  ) => SpherePolyline;
  Popup: new (
    location: Location | GeoJSON,
    options?: PopupOptions
  ) => SpherePopup;
  Rectangle: new (
    location: Location,
    size: Size | Location,
    options?: SphereGeometryOptions
  ) => SphereRectangle;
  RouteLabel: Record<RouteLabelType, RouteLabelValue>;
  RouteLine: Record<RouteLineType, RouteLineValue>;
  RouteMode: Record<RouteMode, RouteModeValue>;
  RouteRestrict: Record<RouteRestrictType, number>;
  RouteType: Record<RouteType, RouteTypeValue>;
  /** Base URLs of Sphere services (undocumented). */
  Server?: { [key: string]: string };
  TagType: Record<TagType, TagType>;
  UiComponent: Record<UiComponentMode, UiComponentValue>;
  Util: SphereUtil;
}

declare global {
  interface Window {
    sphere?: SphereNamespace;
  }
}

export type { SphereNamespace as Sphere };
