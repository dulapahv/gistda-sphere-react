export interface Location {
  lon: number;
  lat: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Range {
  min: number;
  max: number;
}

export interface Bound {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Tile {
  x: number;
  y: number;
  z: number;
}

export interface Icon {
  url?: string;
  urlHD?: string;
  html?: string;
  offset?: Point;
  size?: Size;
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
  layer?: SphereLayer | string;
  zoom?: number;
  zoomRange?: Range;
  location?: Location;
  placeholder?: HTMLElement;
  ui?: UiComponentMode;
  input?: boolean;
  lastView?: boolean;
  language?: Language;
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
  type?: LayerType;
  url?: string;
  zoomRange?: Range;
  source?: Range;
  opacity?: number;
  zIndex?: number;
  bound?: Bound;
  attribution?: string;
  extraQuery?: string;
  id?: string;
  format?: string;
  srs?: string;
  tileMatrixPrefix?: string;
  styles?: string;
  version?: string;
  refresh?: number;
  zoomOffset?: number;
}

export interface MarkerOptions {
  icon?: Icon;
  title?: string;
  detail?: string;
  popup?: PopupOptions;
  visibleRange?: Range;
  clickable?: boolean;
  draggable?: boolean;
  zIndex?: number;
  rotate?: number;
}

export interface PopupOptions {
  title?: string;
  detail?: string;
  loadDetail?: (element: HTMLElement) => void;
  html?: string;
  loadHtml?: (element: HTMLElement) => void;
  size?: Size;
  closable?: boolean;
}

export interface GeometryOptions {
  title?: string;
  detail?: string;
  label?: string;
  labelOptions?: MarkerOptions;
  popup?: PopupOptions;
  visibleRange?: Range;
  lineWidth?: number;
  lineColor?: string;
  fillColor?: string;
  lineStyle?: LineStyleType;
  pivot?: Location | (() => Location);
  clickable?: boolean;
  draggable?: boolean;
  pointer?: boolean;
  zIndex?: number;
  editable?: boolean;
}

export interface TagOptions {
  source?: string;
  type?: TagType;
  icon?: Icon | "big" | "small";
  visibleRange?: Range;
  label?: Range;
  area?: string;
  dataset?: string;
  name?: string;
  extraQuery?: string;
  version?: string;
}

export interface SearchOptions {
  area?: string;
  tag?: string;
  span?: string;
  offset?: number;
  limit?: number;
  dataset?: string;
}

export interface SuggestOptions {
  area?: string;
  offset?: number;
  limit?: number;
  dataset?: string;
}

export interface AddressOptions {
  limit?: number;
  dataset?: string;
}

export interface NearPoiOptions {
  span?: number;
  zoom?: number;
  limit?: number;
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
  overlay: SphereOverlay;
  location?: Location;
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
  language(value?: Language): Language | this;
  setBase(layer: SphereLayer | object | string): this;
  add(layer: SphereLayer | object, beforeId?: string): this;
  remove(layer: SphereLayer | object): this;
  clear(): this;
  list(): object[];
  size(): number;
}

export interface SphereOverlay {
  location(
    geojson?: Location | Location[] | object,
    animate?: boolean
  ): Location | Location[] | this;
  visibleRange(): Range;
  active(): boolean;
  shift(vector: Location): this;
  distance(
    overlay: Location | SphereOverlay,
    language?: string
  ): number | string;
  intersects(overlay: Location | SphereOverlay): boolean;
  contains(overlay: Location | SphereOverlay): boolean;
  within(overlay: Location | SphereOverlay): boolean;
  toJSON(key?: string): object;
}

export interface SphereMarker extends SphereOverlay {
  popup(): SpherePopup;
  element(): HTMLElement;
  pop(mode?: boolean): this;
  update(newOptions: MarkerOptions): this;
}

export interface SpherePopup extends SphereOverlay {
  element(): HTMLElement;
  title(value?: string): HTMLElement | this;
  detail(value?: string): HTMLElement | this;
}

export interface SpherePolyline extends SphereOverlay {
  popup(): SpherePopup;
  pop(mode?: boolean, location?: Location): this;
  pivot(): Location;
  centroid(): Location;
  bound(): Bound;
  update(newOptions: GeometryOptions): this;
  rotate(angle: number): this;
  size(language?: string): number | string;
  union(overlay: SpherePolyline, options?: GeometryOptions): SpherePolyline;
}

export interface SpherePolygon extends SpherePolyline {
  intersection(
    overlay: SpherePolygon,
    options?: GeometryOptions
  ): SpherePolygon;
  difference(overlay: SpherePolygon, options?: GeometryOptions): SpherePolygon;
  split(splitter: SpherePolygon, options?: GeometryOptions): SpherePolygon[];
}

export interface SphereCircle extends SpherePolyline {
  radius(language?: string): number | string;
}

export interface SphereDot extends SpherePolyline {}

export interface SphereRectangle extends SpherePolygon {}

export interface SphereOverlayCollection {
  add(overlay: SphereOverlay): this;
  remove(overlay: SphereOverlay): this;
  load(mode: object): this;
  unload(mode: object): this;
  clear(): this;
  list(): SphereOverlay[];
  size(): number;
  lastOpenPopup(): SpherePopup;
}

export interface SphereUiControl {
  visible(state?: boolean): boolean | SphereUiControl;
}

export interface SphereContextMenu {
  enableNearPoi(state?: boolean): boolean | SphereContextMenu;
  enableAddress(state?: boolean): boolean | SphereContextMenu;
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
  DPad: SphereUiControl;
  Geolocation: SphereUiControl;
  Zoombar: SphereUiControl;
  Toolbar: SphereUiControl;
  LayerSelector: SphereUiControl;
  Fullscreen: SphereUiControl;
  Crosshair: SphereUiControl;
  Scale: SphereUiControl;
  ContextMenu: SphereContextMenu;
  Keyboard: SphereKeyboard;
  Mouse: SphereMouse;
  language(value?: Language): Language | SphereUiCollection;
  add(control: object): SphereUiCollection;
  remove(control: object): SphereUiCollection;
  lockMap(options?: object): SphereUiCollection;
}

export interface SphereSearch {
  language(value?: Language): Language | this;
  placeholder(value?: HTMLElement, options?: object): HTMLElement | this;
  suggest(keyword: string, options?: SuggestOptions): Promise<object>;
  search(keyword: string, options?: SearchOptions): Promise<object>;
  address(location: Location, options?: AddressOptions): Promise<object>;
  nearPoi(location: Location, options?: NearPoiOptions): Promise<object>;
  clear(): this;
  enablePopup(state?: boolean): boolean | this;
}

export interface SphereTagCollection {
  language(value?: Language): Language | this;
  set(tag: string | ((tile: Tile) => object[]), options?: TagOptions): this;
  add(tag: string | ((tile: Tile) => object[]), options?: TagOptions): this;
  remove(tag: string): this;
  clear(): this;
  list(): string[];
  size(): number;
  enablePopup(state?: boolean): boolean | this;
}

export interface SphereRoute {
  language(value?: Language): Language | this;
  placeholder(value?: HTMLElement): HTMLElement | this;
  enableContextMenu(): this;
  line(type: string, value?: GeometryOptions): GeometryOptions | this;
  auto(state?: boolean): boolean | this;
  mode(value?: RouteMode): RouteMode | this;
  modeOf(index: number, value?: RouteMode): RouteMode | this;
  enableRoute(routeType: RouteType, state?: boolean): boolean | this;
  enableRestrict(routeRestrict: string, state?: boolean): boolean | this;
  label(value?: RouteLabelType): RouteLabelType | this;
  add(destination: SphereMarker | Location, mode?: RouteMode): this;
  insert(
    index: number,
    destination: SphereMarker | Location,
    mode?: RouteMode
  ): this;
  remove(destination: SphereMarker): this;
  removeAt(index: number): this;
  clearDestination(): this;
  clearPath(): this;
  clear(): this;
  list(): SphereMarker[];
  size(): number;
  reverse(): this;
  search(): this;
  distance(format?: boolean): number | string;
  interval(format?: boolean): number | string;
  guide(format?: boolean): object[] | HTMLElement;
  exportRouteLine(options?: GeometryOptions): SpherePolyline;
}

export interface FlyToOptions {
  center?: Location;
  zoom?: number;
  bearing?: number;
  pitch?: number;
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
}

export interface SphereMap {
  Event: SphereEvent;
  Layers: SphereLayerCollection;
  Overlays: SphereOverlayCollection;
  Ui: SphereUiCollection;
  Search: SphereSearch;
  Tags: SphereTagCollection;
  Route: SphereRoute;
  Renderer: {
    on(event: string, handler: () => void): void;
  };

  id(): number;
  resize(): this;
  repaint(): this;
  placeholder(): HTMLElement;
  zoom(value?: number | boolean, animate?: boolean): number | this;
  zoomRange(value?: Range): Range | this;
  location(value?: Location, animate?: boolean): Location | this;
  bound(value?: Bound, options?: object): Bound | this;
  move(offset: Point, animate?: boolean): this;
  language(value?: Language): Language | this;
  rotate(angle?: number, animate?: boolean): number | this;
  pitch(angle?: number): number | this;
  enableFilter(filter?: FilterType | false): FilterType | false | this;
  goTo(target: FlyToOptions, animate?: boolean): this;
}

export interface SphereNamespace {
  Map: new (options?: MapOptions) => SphereMap;
  Marker: new (
    location: Location | object,
    options?: MarkerOptions
  ) => SphereMarker;
  Popup: new (
    location: Location | object,
    options?: PopupOptions
  ) => SpherePopup;
  Polyline: new (
    locationList: Location[] | object,
    options?: GeometryOptions
  ) => SpherePolyline;
  Polygon: new (
    locationList: Location[] | object,
    options?: GeometryOptions
  ) => SpherePolygon;
  Circle: new (
    location: Location | object,
    radius: number,
    options?: GeometryOptions
  ) => SphereCircle;
  Dot: new (
    location: Location | object,
    options?: GeometryOptions
  ) => SphereDot;
  Rectangle: new (
    location: Location,
    size: Size | Location,
    options?: GeometryOptions
  ) => SphereRectangle;
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

  Filter: {
    Dark: FilterType;
    Light: FilterType;
    Protanopia: FilterType;
    Deuteranopia: FilterType;
    None: FilterType;
  };

  EventName: Record<EventName, EventName>;

  TagType: {
    WFS: string;
    OGC: string;
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

  RouteLabel: {
    Distance: string;
    Time: string;
    Hide: string;
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
}

declare global {
  interface Window {
    sphere?: SphereNamespace;
  }
}

export type { SphereNamespace as Sphere };
