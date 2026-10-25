import type {
  GeoJSONFeature,
  GeoJSONGeometry,
  GeoJSONLineString,
  GeoJSONMultiPolygon,
  GeoJSONPoint,
  GeoJSONPolygon,
  Language,
  Location,
  PoiResult,
  SearchResponse,
  SuggestResult,
} from "@/types";

/** Options for `createSphereServices`. */
export interface SphereServicesOptions {
  /** Your Sphere API key (with the services you call enabled). */
  apiKey: string;
  /** Services base URL. Default `https://api.sphere.gistda.or.th/services`. */
  baseUrl?: string;
  /** `fetch` implementation (defaults to the global one). */
  fetch?: typeof fetch;
  /** Extra headers sent with every request, e.g. for your own proxy. */
  headers?: Record<string, string>;
  /** Default language for services that support it. Default `"th"`. */
  locale?: Language;
  /**
   * How to send requests. `"auto"` (default) uses GET, and switches to a
   * form-encoded POST when the URL would be too long, e.g. for large
   * polygons or route matrices. Every Sphere service accepts both.
   */
  method?: "auto" | "get" | "post";
  /**
   * A page URL of a host your key allows, sent as the `Referer` header.
   * Needed on servers when your key is restricted to certain hosts: Sphere
   * checks the referrer, and server requests don't send one. Browsers ignore
   * it and send the page's own referrer.
   */
  referer?: string;
  /** Request timeout in milliseconds. Default `15000`, and `0` disables it. */
  timeout?: number;
}

/** Per-request options. */
export interface RequestOptions {
  /** Abort the request. */
  signal?: AbortSignal;
  /** Override the client timeout (ms) for this request. */
  timeout?: number;
}

/** Either a single location or a GeoJSON geometry (point, line or polygon). */
export type GeoTarget = Location | GeoJSONGeometry;

/** Date range in ISO 8601 (`YYYY-MM-DD`). */
export interface DateRange {
  from?: string;
  to?: string;
}

// ----- Search & POI --------------------------------------------------------

export interface ServiceSuggestOptions extends RequestOptions {
  limit?: number;
  offset?: number;
  /** Also suggest similar-sounding words. */
  soundex?: boolean;
}

export interface ServiceSearchOptions extends RequestOptions {
  limit?: number;
  locale?: Language;
  /** Bias results around this location. */
  near?: Location;
  offset?: number;
  /** Include `distance` (meters) from `near` in results. */
  showDistance?: boolean;
  /** Only places with at least one of these tags (comma-separated or array). */
  tag?: string | string[];
}

export interface NearbyPoiOptions extends RequestOptions {
  limit?: number;
  locale?: Language;
  offset?: number;
  /** Search span with unit `deg`, `m` or `km`, e.g. `"1km"`. */
  span?: string;
  tag?: string | string[];
}

/** A POI with its full geometry, from `poi.get`. */
export interface PoiDetail extends PoiResult {
  geo?: GeoJSONGeometry;
}

/** A POI from `poi.cluster`. */
export interface PoiClusterItem {
  icon?: string;
  id: string;
  lat: number;
  lon: number;
  name: string;
  [key: string]: unknown;
}

export type SuggestServiceResult = SearchResponse<SuggestResult>;
export type SearchServiceResult = SearchResponse<PoiResult>;

// ----- Routing -------------------------------------------------------------

/**
 * Route search mode for the REST service: `Traffic` (fastest, avoiding
 * traffic jams), `Cost` (fastest, without traffic data) or `Distance`
 * (shortest). Fly is JS API only.
 */
export type ServiceRouteMode = "Traffic" | "Cost" | "Distance";

/** Kinds of road the REST router may use. */
export type ServiceRouteType = "Road" | "Ferry" | "Tollway";

export interface RouteRequest extends RequestOptions {
  from: Location;
  /** Guide detail: road names (default) or turn-by-turn instructions. */
  guide?: "roads" | "turns";
  locale?: Language;
  /** Maximum number of alternative routes. */
  maxResults?: number;
  mode?: ServiceRouteMode;
  to: Location;
  /** Allowed route types (default: all). */
  types?: ServiceRouteType[];
  /** Vehicle type (default `"car"`). */
  vehicle?: "car" | "motorcycle";
}

/** Properties of one route step feature. */
export interface RouteStepProperties {
  /** Step distance in meters. */
  distance: number;
  /** Step travel time in seconds. */
  interval: number;
  /** Road name. */
  name: string;
  /** Turn code (see `ROUTE_TURN`). */
  turn: number;
  [key: string]: unknown;
}

/** REST route result: a feature per step plus totals in `data`. */
export interface RouteServiceResult {
  data: { [key: string]: unknown; distance: number; interval: number };
  features: GeoJSONFeature<GeoJSONLineString, RouteStepProperties>[];
  type: "FeatureCollection";
  [key: string]: unknown;
}

export interface RouteMatrixRequest extends RequestOptions {
  from: Location[];
  locale?: Language;
  mode?: ServiceRouteMode;
  to: Location[];
  types?: ServiceRouteType[];
  vehicle?: "car" | "motorcycle";
}

/** Distance (m) and time (s) between one origin and one destination. */
export interface RouteMatrixCell {
  distance: number;
  interval: number;
  [key: string]: unknown;
}

export interface RouteMatrixResult {
  /** `data[i][j]`: from origin `i` to destination `j`. */
  data: RouteMatrixCell[][];
  [key: string]: unknown;
}

// ----- Geo -----------------------------------------------------------------

/** Height above mean sea level at a point. */
export interface ElevationPoint {
  /** Meters above mean sea level. */
  elevation: number;
  lat?: number;
  /** Position along a LineString, from 0 to 1. */
  location?: number;
  lon?: number;
  [key: string]: unknown;
}

// ----- Maps ------------------------------------------------------------------

/** Base maps available to the static map service. */
export type StaticMapStyle =
  | "sphere_streets"
  | "sphere_streets_en"
  | "sphere_hybrid"
  | "sphere_hybrid_en"
  | "thailand_images";

/** Drawing properties for static map features. */
export interface StaticMapFeatureStyle {
  /** Polygon / text background color. */
  fillcolor?: string;
  /** Image URL to draw instead of a point (max 100 kB). */
  icon?: string;
  /** Point/line/outline/text color. */
  linecolor?: string;
  /** Point size / line width in pixels. */
  linewidth?: number;
  /** Horizontal offset in pixels, or `left`/`center`/`right`. */
  offsetx?: number | "left" | "center" | "right";
  /** Vertical offset in pixels, or `top`/`center`/`bottom`. */
  offsety?: number | "top" | "center" | "bottom";
  /** Text to draw instead of a point. */
  text?: string;
  [key: string]: unknown;
}

export interface StaticMapOptions {
  /** Map center (omit to fit the drawn features). */
  center?: Location;
  /** Features to draw, styled through their properties. */
  features?:
    | GeoJSONFeature<GeoJSONGeometry, StaticMapFeatureStyle>
    | GeoJSONFeature<GeoJSONGeometry, StaticMapFeatureStyle>[];
  /** Image height in pixels (default 400, max 2048). */
  height?: number;
  /** Base map (default `"sphere_streets"`). */
  map?: StaticMapStyle;
  /** Image width in pixels (default 500, max 2048). */
  width?: number;
  zoom?: number;
}

export interface EmbedMapOptions {
  center?: Location;
  locale?: Language;
  /** Base map type. */
  map?: string;
  /** Show a marker at the center. */
  marker?: boolean;
  /** POI ID to pin. */
  poi?: string;
  /** Route to show. */
  route?: string;
  /** Keyword to search and pin. */
  search?: string;
  /** Show POI tags. */
  tags?: boolean;
  zoom?: number;
}

/** Raster base layers available as tiles. */
export type RasterTileLayer =
  | "sphere_streets"
  | "sphere_hybrid"
  | "thailand_images"
  | "sphere_protanopia"
  | "sphere_deuteranopia";

/** Vector styles available for the vector tiles. */
export type VectorStyle = "streets" | "hybrid" | "protanopia" | "deuteranopia";

// ----- Information ---------------------------------------------------------

/** Economic crop information at a location. */
export interface CropInfo {
  cost?: number;
  date?: unknown;
  price?: { max?: number; min?: number; status?: number; unit?: string };
  /** Crop code, e.g. `majorrice`, `maize`, `cassava`, `rubber`, `palm`. */
  type: string;
  [key: string]: unknown;
}

/** Land suitability for a crop at a location. */
export interface LandSuitabilityInfo {
  cost?: number;
  suitability: string;
  type: string;
  [key: string]: unknown;
}

/** Crop suitability within an area or at a point. */
export interface CropSuitabilityInfo {
  geom?: GeoJSONPolygon | GeoJSONMultiPolygon | "";
  name: string;
  suitability: string;
  [key: string]: unknown;
}

export interface FloodStatus {
  date: string;
  status: string;
  [key: string]: unknown;
}

export interface DroughtStatus {
  date: string;
  /** Soil moisture level. */
  value: number | string;
  [key: string]: unknown;
}

export interface HotspotQuery extends DateRange, RequestOptions {
  /** Amphoe/district name in Thai. */
  district?: string;
  /** Polygon area to search. */
  geo?: GeoJSONPolygon | GeoJSONMultiPolygon;
  /** Center of a radius search. */
  location?: Location;
  /** Province name in Thai. */
  province?: string;
  /** Radius around `location` in meters (default 1 km, at most 10 km). */
  radius?: number;
  /** Tambon/subdistrict name in Thai. */
  subdistrict?: string;
}

/** Disaster statistics per type for an area. */
export interface DisasterRecurringInfo {
  drought?: unknown;
  flood?: unknown;
  hotspot?: unknown;
  location?: { ap_tn?: string; pv_tn?: string; tb_tn?: string };
  [key: string]: unknown;
}

/** Recurrence/plot area lookup result. */
export interface AreaLookupResult {
  /** Area in rai. */
  area?: number | string;
  geom?: GeoJSONGeometry;
  month?: number | string;
  /** `"found"` or `"not found"`. */
  result: string;
  update?: string;
  year?: number | string;
  /** Average yield in tons per rai (bi-weekly crop services). */
  yield_avg?: number | string;
  [key: string]: unknown;
}

export interface PopulationResult {
  data: unknown;
  meta: unknown;
  [key: string]: unknown;
}

/** A tag category with its tags, from the public category list. */
export interface TagCategoryInfo {
  icon: string;
  name: { en: string; th: string };
  /** Tags in the category. `name.th` is the tag ID used with `Tags.set/add`. */
  sub?: Array<{ icon: string; name: { en: string; th: string } }>;
}

/** Targets accepted by point-only lookups. */
export type PointTarget = Location | GeoJSONPoint;
