export interface Location {
  lat: number;
  lon: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Range {
  max: number;
  min: number;
}

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

export interface Tile {
  x: number;
  y: number;
  z: number;
}

export interface Icon {
  html?: string;
  offset?: Point;
  size?: Size;
  url?: string;
  urlHD?: string;
}

export type LayerType =
  | "Vector"
  | "XYZ"
  | "WMS"
  | "WMTS"
  | "WMTS_REST"
  | "TMS"
  | "Tiles3D"
  | "I3S";

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

export type FilterType =
  | "Dark"
  | "Light"
  | "Protanopia"
  | "Deuteranopia"
  | "None";

export type LineStyleType = "Solid" | "Dashed" | "Dot";

export type Language = "th" | "en";

export type UiComponentMode = "Full" | "Mobile" | "None";

export type RouteMode = "Traffic" | "Cost" | "Distance" | "Fly";

export type RouteType = "Road" | "Ferry" | "Tollway" | "All";

export type RouteLabelType = "Distance" | "Time" | "Hide";

export type TagType = "WFS" | "OGC";

export interface MapOptions {
  input?: boolean;
  language?: Language;
  lastView?: boolean;
  layer?: SphereLayer | string;
  location?: Location;
  placeholder?: HTMLElement;
  ui?: UiComponentMode;
  zoom?: number;
  zoomRange?: Range;
  [key: string]:
    | SphereLayer
    | string
    | number
    | boolean
    | Range
    | Location
    | HTMLElement
    | UiComponentMode
    | undefined;
}

export interface LayerOptions {
  attribution?: string;
  bound?: Bound;
  extraQuery?: string;
  format?: string;
  id?: string;
  opacity?: number;
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

export interface PopupOptions {
  closable?: boolean;
  detail?: string;
  html?: string;
  loadDetail?: (element: HTMLElement) => void;
  loadHtml?: (element: HTMLElement) => void;
  size?: Size;
  title?: string;
}

export interface GeometryOptions {
  clickable?: boolean;
  detail?: string;
  draggable?: boolean;
  editable?: boolean;
  fillColor?: string;
  label?: string;
  labelOptions?: MarkerOptions;
  lineColor?: string;
  lineStyle?: LineStyleType;
  lineWidth?: number;
  pivot?: Location | (() => Location);
  pointer?: boolean;
  popup?: PopupOptions;
  title?: string;
  visibleRange?: Range;
  zIndex?: number;
}

export interface TagOptions {
  area?: string;
  dataset?: string;
  extraQuery?: string;
  icon?: Icon | "big" | "small";
  label?: Range;
  name?: string;
  source?: string;
  type?: TagType;
  version?: string;
  visibleRange?: Range;
}

export interface SearchOptions {
  area?: string;
  dataset?: string;
  limit?: number;
  offset?: number;
  span?: string;
  tag?: string;
}

export interface SuggestOptions {
  area?: string;
  dataset?: string;
  limit?: number;
  offset?: number;
}

export interface AddressOptions {
  dataset?: string;
  limit?: number;
}

export interface NearPoiOptions {
  limit?: number;
  span?: number;
  zoom?: number;
}

export type EventName =
  | "ready"
  | "resize"
  | "repaint"
  | "zoom"
  | "zoomRange"
  | "location"
  | "fullscreen"
  | "rotate"
  | "pitch"
  | "toolbarChange"
  | "drawCreate"
  | "drawDelete"
  | "tooltipChange"
  | "beforeContextmenu"
  | "contextmenu"
  | "mousemove"
  | "click"
  | "doubleClick"
  | "wheel"
  | "drag"
  | "drop"
  | "idle"
  | "layerChange"
  | "tileLoading"
  | "tileLoaded"
  | "overlayChange"
  | "overlayUpdate"
  | "overlayClick"
  | "overlayLoad"
  | "overlayDrag"
  | "overlayDrop"
  | "overlayHover"
  | "overlayLeave"
  | "popupClose"
  | "routeError"
  | "routeComplete"
  | "error";

// biome-ignore lint/suspicious/noConfusingVoidType: Event handlers can return void, undefined, or boolean
export type EventHandler<T = void> = (data: T) => void | undefined | boolean;

export interface OverlayClickEventData {
  location?: Location;
  overlay: SphereOverlay;
}

export type OverlayEventData = SphereOverlay;

export type PopupCloseEventData = SpherePopup;

export interface SphereEvent {
  bind<T = unknown>(eventName: EventName, handler: EventHandler<T>): this;
  unbind<T = unknown>(eventName: EventName, handler: EventHandler<T>): this;
}

export interface SphereLayer {
  name(): string;
  options(): LayerOptions;
}

export interface SphereLayerCollection {
  add(layer: SphereLayer | object, beforeId?: string): this;
  clear(): this;
  language(value?: Language): Language | this;
  list(): object[];
  remove(layer: SphereLayer | object): this;
  setBase(layer: SphereLayer | object | string): this;
  size(): number;
}

export interface SphereOverlay {
  active(): boolean;
  contains(overlay: Location | SphereOverlay): boolean;
  distance(
    overlay: Location | SphereOverlay,
    language?: string
  ): number | string;
  intersects(overlay: Location | SphereOverlay): boolean;
  location(
    geojson?: Location | Location[] | object,
    animate?: boolean
  ): Location | Location[] | this;
  shift(vector: Location): this;
  toJSON(key?: string): object;
  visibleRange(): Range;
  within(overlay: Location | SphereOverlay): boolean;
}

export interface SphereMarker extends SphereOverlay {
  element(): HTMLElement;
  pop(mode?: boolean): this;
  popup(): SpherePopup;
  update(newOptions: MarkerOptions): this;
}

export interface SpherePopup extends SphereOverlay {
  detail(value?: string): HTMLElement | this;
  element(): HTMLElement;
  title(value?: string): HTMLElement | this;
}

export interface SpherePolyline extends SphereOverlay {
  bound(): Bound;
  centroid(): Location;
  pivot(): Location;
  pop(mode?: boolean, location?: Location): this;
  popup(): SpherePopup;
  rotate(angle: number): this;
  size(language?: string): number | string;
  union(overlay: SpherePolyline, options?: GeometryOptions): SpherePolyline;
  update(newOptions: GeometryOptions): this;
}

export interface SpherePolygon extends SpherePolyline {
  difference(overlay: SpherePolygon, options?: GeometryOptions): SpherePolygon;
  intersection(
    overlay: SpherePolygon,
    options?: GeometryOptions
  ): SpherePolygon;
  split(splitter: SpherePolygon, options?: GeometryOptions): SpherePolygon[];
}

export interface SphereCircle extends SpherePolyline {
  radius(language?: string): number | string;
}

export interface SphereDot extends SpherePolyline {}

export interface SphereRectangle extends SpherePolygon {}

export interface SphereOverlayCollection {
  add(overlay: SphereOverlay): this;
  clear(): this;
  lastOpenPopup(): SpherePopup;
  list(): SphereOverlay[];
  load(mode: object): this;
  remove(overlay: SphereOverlay): this;
  size(): number;
  unload(mode: object): this;
}

export interface SphereUiControl {
  visible(state?: boolean): boolean | SphereUiControl;
}

export interface SphereContextMenu {
  enableAddress(state?: boolean): boolean | SphereContextMenu;
  enableNearPoi(state?: boolean): boolean | SphereContextMenu;
}

export interface SphereKeyboard {
  enable(state?: boolean): boolean | SphereKeyboard;
}

export interface SphereMouse {
  enable(state?: boolean): boolean | SphereMouse;
  enableClick(state?: boolean): boolean | SphereMouse;
  enableDrag(state?: boolean): boolean | SphereMouse;
  enableWheel(state?: boolean): boolean | SphereMouse;
}

export interface SphereUiCollection {
  add(control: object): SphereUiCollection;
  ContextMenu: SphereContextMenu;
  Crosshair: SphereUiControl;
  DPad: SphereUiControl;
  Fullscreen: SphereUiControl;
  Geolocation: SphereUiControl;
  Keyboard: SphereKeyboard;
  LayerSelector: SphereUiControl;
  language(value?: Language): Language | SphereUiCollection;
  lockMap(options?: object): SphereUiCollection;
  Mouse: SphereMouse;
  remove(control: object): SphereUiCollection;
  Scale: SphereUiControl;
  Toolbar: SphereUiControl;
  Zoombar: SphereUiControl;
}

export interface SphereSearch {
  address(location: Location, options?: AddressOptions): Promise<object>;
  clear(): this;
  enablePopup(state?: boolean): boolean | this;
  language(value?: Language): Language | this;
  nearPoi(location: Location, options?: NearPoiOptions): Promise<object>;
  placeholder(value?: HTMLElement, options?: object): HTMLElement | this;
  search(keyword: string, options?: SearchOptions): Promise<object>;
  suggest(keyword: string, options?: SuggestOptions): Promise<object>;
}

export interface SphereTagCollection {
  add(tag: string | ((tile: Tile) => object[]), options?: TagOptions): this;
  clear(): this;
  enablePopup(state?: boolean): boolean | this;
  language(value?: Language): Language | this;
  list(): string[];
  remove(tag: string): this;
  set(tag: string | ((tile: Tile) => object[]), options?: TagOptions): this;
  size(): number;
}

export interface SphereRoute {
  add(destination: SphereMarker | Location, mode?: RouteMode): this;
  auto(state?: boolean): boolean | this;
  clear(): this;
  clearDestination(): this;
  clearPath(): this;
  distance(format?: boolean): number | string;
  enableContextMenu(): this;
  enableRestrict(routeRestrict: string, state?: boolean): boolean | this;
  enableRoute(routeType: RouteType, state?: boolean): boolean | this;
  exportRouteLine(options?: GeometryOptions): SpherePolyline;
  guide(format?: boolean): object[] | HTMLElement;
  insert(
    index: number,
    destination: SphereMarker | Location,
    mode?: RouteMode
  ): this;
  interval(format?: boolean): number | string;
  label(value?: RouteLabelType): RouteLabelType | this;
  language(value?: Language): Language | this;
  line(type: string, value?: GeometryOptions): GeometryOptions | this;
  list(): SphereMarker[];
  mode(value?: RouteMode): RouteMode | this;
  modeOf(index: number, value?: RouteMode): RouteMode | this;
  placeholder(value?: HTMLElement): HTMLElement | this;
  remove(destination: SphereMarker): this;
  removeAt(index: number): this;
  reverse(): this;
  search(): this;
  size(): number;
}

export interface FlyToOptions {
  bearing?: number;
  center?: Location;
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
  pitch?: number;
  zoom?: number;
}

export interface SphereMap {
  bound(value?: Bound, options?: object): Bound | this;
  Event: SphereEvent;
  enableFilter(filter?: FilterType | false): FilterType | false | this;
  goTo(target: FlyToOptions, animate?: boolean): this;

  id(): number;
  Layers: SphereLayerCollection;
  language(value?: Language): Language | this;
  location(value?: Location, animate?: boolean): Location | this;
  move(offset: Point, animate?: boolean): this;
  Overlays: SphereOverlayCollection;
  pitch(angle?: number): number | this;
  placeholder(): HTMLElement;
  Renderer: {
    on(event: string, handler: () => void): void;
  };
  Route: SphereRoute;
  repaint(): this;
  resize(): this;
  rotate(angle?: number, animate?: boolean): number | this;
  Search: SphereSearch;
  Tags: SphereTagCollection;
  Ui: SphereUiCollection;
  zoom(value?: number | boolean, animate?: boolean): number | this;
  zoomRange(value?: Range): Range | this;
}

export interface SphereNamespace {
  Circle: new (
    location: Location | object,
    radius: number,
    options?: GeometryOptions
  ) => SphereCircle;
  Dot: new (
    location: Location | object,
    options?: GeometryOptions
  ) => SphereDot;

  EventName: Record<EventName, EventName>;

  Filter: {
    Dark: FilterType;
    Light: FilterType;
    Protanopia: FilterType;
    Deuteranopia: FilterType;
    None: FilterType;
  };
  Layer: new (name: string, options?: LayerOptions) => SphereLayer;

  Layers: {
    SIMPLE: SphereLayer;
    STREETS: SphereLayer;
    STREETS_NIGHT: SphereLayer;
    HYBRID: SphereLayer;
    TRAFFIC: SphereLayer;
    IMAGES: SphereLayer;
    PM25: SphereLayer;
    HOTSPOT: SphereLayer;
    FLOOD: SphereLayer;
    DROUGHT: SphereLayer;
  };

  LayerType: {
    Vector: string;
    XYZ: string;
    WMS: string;
    WMTS: string;
    WMTS_REST: string;
    TMS: string;
    Tiles3D: string;
    I3S: string;
  };

  LineStyle: {
    Solid: string;
    Dashed: string;
    Dot: string;
  };
  Map: new (options?: MapOptions) => SphereMap;
  Marker: new (
    location: Location | object,
    options?: MarkerOptions
  ) => SphereMarker;

  Math: {
    distance(dx: number, dy: number): number;
    closestPointOnLine(
      x: number,
      y: number,
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ): Point;
    lineIntersectPoint(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      u1: number,
      v1: number,
      u2: number,
      v2: number,
      skipOverlap?: boolean
    ): Point | number[] | null;
  };

  Overlays: {
    cameras: { popup?: boolean; motion?: boolean };
    events: { popup?: boolean };
    aqi: { popup?: boolean };
    Object: new (
      id: string,
      dataset?: string,
      options?: object
    ) => SphereOverlay;
  };
  Polygon: new (
    locationList: Location[] | object,
    options?: GeometryOptions
  ) => SpherePolygon;
  Polyline: new (
    locationList: Location[] | object,
    options?: GeometryOptions
  ) => SpherePolyline;
  Popup: new (
    location: Location | object,
    options?: PopupOptions
  ) => SpherePopup;
  Rectangle: new (
    location: Location,
    size: Size | Location,
    options?: GeometryOptions
  ) => SphereRectangle;

  RouteLabel: {
    Distance: string;
    Time: string;
    Hide: string;
  };

  RouteMode: {
    Traffic: string;
    Cost: string;
    Distance: string;
    Fly: string;
  };

  RouteType: {
    Road: string;
    Ferry: string;
    Tollway: string;
    All: string;
  };

  TagType: {
    WFS: string;
    OGC: string;
  };

  Util: {
    append(
      element: HTMLElement,
      childName: string,
      propertyMap?: object
    ): HTMLElement;
    prepend(
      element: HTMLElement,
      childName: string,
      propertyMap?: object,
      beforeElement?: HTMLElement
    ): HTMLElement;
    empty(element: HTMLElement): HTMLElement;
    loadStyle(url: string, media?: string): void;
    loadScript(url: string, callback?: (isLoad: boolean) => void): void;
    getJson(url: string): Promise<object>;
    isHD(): number;
    validateLocation(location: Location): boolean;
    sameLocation(a: Location, b: Location): boolean;
    longitudeLength(lat: number): number;
    latitudeLength(lat: number): number;
    isAbsInRange(value: number, range: number): boolean;
    bound(value: number, min: number, max: number): number;
    formatDate(date: string, language: string): string;
    formatTime(time: string): string;
    formatDateTimeRange(
      startDatetime: string,
      stopDatetime: string,
      language: string
    ): string;
    formatInterval(interval: number, language: string): string;
    formatDistance(distance: number, language: string): string;
    formatArea(area: number, language: string): string;
    formatThaiArea(area: number, language: string): string;
    initLibrary(library: string): Promise<void>;
    project(
      fromProjection: string | undefined,
      toProjection: string,
      coordinates: object | unknown[]
    ): object;
    WKTToGeoJSON(text: string): object;
    EsriJSONToGeoJSON(json: object): object;
    TopoJSONToGeoJSON(json: object, obj: object | string): object;
    GMLToGeoJSON(doc: Document | string): object;
    GPXToGeoJSON(doc: Document | string): object;
    KMLToGeoJSON(doc: Document | string): object;
    formatPoi?: (poi: object, lang: string) => HTMLElement;
    poiPopupOptions?: (
      source: string,
      id: string,
      name: string,
      language: string
    ) => PopupOptions;
  };
}

declare global {
  interface Window {
    sphere?: SphereNamespace;
  }
}

export type { SphereNamespace as Sphere };
