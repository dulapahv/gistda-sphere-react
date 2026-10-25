import type {
  AddressResult,
  GeoJSONGeometry,
  Language,
  Location,
} from "@/types";
import type {
  AreaLookupResult,
  CropInfo,
  CropSuitabilityInfo,
  DateRange,
  DisasterRecurringInfo,
  DroughtStatus,
  ElevationPoint,
  EmbedMapOptions,
  FloodStatus,
  GeoTarget,
  HotspotQuery,
  LandSuitabilityInfo,
  NearbyPoiOptions,
  PoiClusterItem,
  PoiDetail,
  PopulationResult,
  RasterTileLayer,
  RequestOptions,
  RouteMatrixRequest,
  RouteMatrixResult,
  RouteRequest,
  RouteServiceResult,
  SearchServiceResult,
  ServiceRouteMode,
  ServiceRouteType,
  ServiceSearchOptions,
  ServiceSuggestOptions,
  SphereServicesOptions,
  StaticMapOptions,
  SuggestServiceResult,
  TagCategoryInfo,
  VectorStyle,
} from "./types";

const DEFAULT_BASE_URL = "https://api.sphere.gistda.or.th/services";
const BASEMAP_URL = "https://basemap.sphere.gistda.or.th";
const DEFAULT_TIMEOUT_MS = 15_000;
/** Longer GET URLs are sent as POST in `"auto"` mode (browsers and proxies cap URL length). */
const MAX_GET_URL_LENGTH = 2000;
/**
 * Body Sphere returns (with HTTP 200) when a key may not use a service, e.g.
 * `sphere Map API key error` or `throw 'Search Service API Key Error';`.
 */
const KEY_ERROR = /api key error/i;

/** Why a service call failed. */
export type SphereServiceErrorCode =
  | "aborted"
  | "http"
  | "key"
  | "network"
  | "parse"
  | "timeout";

/** Error thrown by `createSphereServices` methods. */
export class SphereServiceError extends Error {
  /** Response body excerpt, when available. */
  readonly body?: string;
  readonly code: SphereServiceErrorCode;
  /** Service path that failed, e.g. `route/route`. */
  readonly service: string;
  /** HTTP status, when the server responded. */
  readonly status?: number;

  /** Creates a service error with a human-readable message. */
  constructor(
    message: string,
    details: {
      body?: string;
      cause?: unknown;
      code: SphereServiceErrorCode;
      service: string;
      status?: number;
    }
  ) {
    super(message, { cause: details.cause });
    this.name = "SphereServiceError";
    this.body = details.body;
    this.code = details.code;
    this.service = details.service;
    this.status = details.status;
  }
}

type QueryValue = string | number | boolean | undefined | null;
type Query = Record<string, QueryValue | QueryValue[]>;

const ROUTE_MODE_CODES: Record<ServiceRouteMode, string> = {
  Cost: "c",
  Distance: "d",
  Traffic: "t",
};

const ROUTE_TYPE_FLAGS: Record<ServiceRouteType, number> = {
  Ferry: 8,
  Road: 1,
  Tollway: 16,
};

/** Encodes query parameters, skipping empty values. Arrays become repeated keys. */
function toParams(query: Query): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item !== undefined && item !== null && item !== "") {
        params.append(key, String(item));
      }
    }
  }
  return params;
}

/** Builds a URL with query parameters. Arrays become repeated keys. */
function buildUrl(base: string, query: Query): string {
  const search = toParams(query).toString();
  return search ? `${base}?${search}` : base;
}

/** True when the value is a `{ lon, lat }` location (not a GeoJSON geometry). */
function isLocationTarget(target: GeoTarget): target is Location {
  return !("type" in target) && "lon" in target && "lat" in target;
}

/** Query parameters for a location-or-geometry target. */
function targetQuery(target: GeoTarget, geometryKey: "geo" | "geom"): Query {
  if (isLocationTarget(target)) {
    return { lat: target.lat, lon: target.lon };
  }
  return { [geometryKey]: JSON.stringify(target) };
}

/** Joins tag filters into the comma-separated form the API expects. */
function joinTags(tag: string | string[] | undefined): string | undefined {
  return Array.isArray(tag) ? tag.join(",") : tag;
}

/**
 * Tags as `tag[0]`, `tag[1]`… parameters. The POI tile service ignores a
 * plain `tag` parameter.
 */
function tagArrayQuery(tag: string | string[] | undefined): Query {
  const tags = Array.isArray(tag) ? tag : [tag];
  return Object.fromEntries(
    tags
      .filter((item): item is string => Boolean(item))
      .map((item, index) => [`tag[${index}]`, item])
  );
}

/** Combines route type names into the API's bit mask (undefined = all). */
function routeTypeMask(
  types: ServiceRouteType[] | undefined
): number | undefined {
  if (!types?.length) {
    return undefined;
  }
  // Flags are distinct powers of two, so summing unique flags equals OR-ing them.
  return [...new Set(types)].reduce(
    (mask, type) => mask + ROUTE_TYPE_FLAGS[type],
    0
  );
}

/** Links a caller signal and a timeout into one abort signal. */
function createRequestSignal(
  signal: AbortSignal | undefined,
  timeout: number
): { cleanup: () => void; signal: AbortSignal; timedOut: () => boolean } {
  const controller = new AbortController();
  let didTimeOut = false;
  const onAbort = () => controller.abort(signal?.reason);
  if (signal?.aborted) {
    controller.abort(signal.reason);
  } else {
    signal?.addEventListener("abort", onAbort, { once: true });
  }
  const timer =
    timeout > 0
      ? setTimeout(() => {
          didTimeOut = true;
          controller.abort();
        }, timeout)
      : undefined;
  return {
    cleanup: () => {
      if (timer) {
        clearTimeout(timer);
      }
      signal?.removeEventListener("abort", onAbort);
    },
    signal: controller.signal,
    timedOut: () => didTimeOut,
  };
}

/**
 * Creates a typed client for the GISTDA Sphere REST web services (search,
 * POI, routing, geocoding, elevation, maps, agriculture, disasters and
 * population). Works in browsers and Node 18+; no map is needed.
 */
export function createSphereServices(options: SphereServicesOptions) {
  const {
    apiKey,
    baseUrl = DEFAULT_BASE_URL,
    locale: defaultLocale = "th",
    method = "auto",
    timeout: defaultTimeout = DEFAULT_TIMEOUT_MS,
  } = options;
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const extraHeaders: Record<string, string> = {
    ...options.headers,
    ...(options.referer ? { Referer: options.referer } : {}),
  };
  const headers = Object.keys(extraHeaders).length ? extraHeaders : undefined;

  if (!apiKey) {
    throw new Error("createSphereServices: an apiKey is required.");
  }

  /** URL of a service path with the key and query appended. */
  const serviceUrl = (path: string, query: Query = {}) =>
    buildUrl(`${baseUrl}/${path}`, { ...query, key: apiKey });

  /** Performs a GET request and parses the JSON response. */
  async function request<T>(
    path: string,
    query: Query,
    requestOptions: RequestOptions = {},
    authenticated = true
  ): Promise<T> {
    if (typeof fetchImpl !== "function") {
      throw new SphereServiceError(
        "No fetch implementation available. Pass `fetch` to createSphereServices.",
        { code: "network", service: path }
      );
    }
    const fullQuery = authenticated ? { ...query, key: apiKey } : query;
    const getUrl = buildUrl(`${baseUrl}/${path}`, fullQuery);
    const usePost =
      method === "post" ||
      (method === "auto" && getUrl.length > MAX_GET_URL_LENGTH);
    const { cleanup, signal, timedOut } = createRequestSignal(
      requestOptions.signal,
      requestOptions.timeout ?? defaultTimeout
    );
    let response: Response;
    let text: string;
    try {
      response = usePost
        ? await fetchImpl(`${baseUrl}/${path}`, {
            body: toParams(fullQuery),
            headers,
            method: "POST",
            signal,
          })
        : await fetchImpl(getUrl, headers ? { headers, signal } : { signal });
      text = await response.text();
    } catch (error) {
      if (timedOut()) {
        throw new SphereServiceError(
          `The Sphere ${path} service did not respond in time.`,
          { cause: error, code: "timeout", service: path }
        );
      }
      if (signal.aborted) {
        throw new SphereServiceError(`The ${path} request was aborted.`, {
          cause: error,
          code: "aborted",
          service: path,
        });
      }
      throw new SphereServiceError(
        `Could not reach the Sphere ${path} service. Check your network connection.`,
        { cause: error, code: "network", service: path }
      );
    } finally {
      cleanup();
    }

    if (KEY_ERROR.test(text)) {
      throw new SphereServiceError(
        `The API key was rejected by the Sphere ${path} service. Enable this service for your key at https://sphere.gistda.or.th/ and check the allowed domains.`,
        {
          body: text.slice(0, 200),
          code: "key",
          service: path,
          status: response.status,
        }
      );
    }
    if (!response.ok) {
      throw new SphereServiceError(
        `The Sphere ${path} service returned HTTP ${response.status}.`,
        {
          body: text.slice(0, 200),
          code: "http",
          service: path,
          status: response.status,
        }
      );
    }
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new SphereServiceError(
        `The Sphere ${path} service returned an unexpected response.`,
        {
          body: text.slice(0, 200),
          cause: error,
          code: "parse",
          service: path,
          status: response.status,
        }
      );
    }
  }

  const locale = (value?: Language) => value ?? defaultLocale;

  return {
    agri: {
      /** Cassava plots (bi-weekly) at a point or within an area. */
      cassava: (target: GeoTarget, range: DateRange & RequestOptions = {}) =>
        request<AreaLookupResult>(
          "agri/cassava-biweekly-50m",
          { ...targetQuery(target, "geom"), from: range.from, to: range.to },
          range
        ),
      /** Maize plots (bi-weekly). */
      maize: (target: GeoTarget, range: DateRange & RequestOptions = {}) =>
        request<AreaLookupResult>(
          "agri/maize-biweekly-50m",
          { ...targetQuery(target, "geom"), from: range.from, to: range.to },
          range
        ),
      /** Oil palm plantations (yearly). */
      palm: (
        target: GeoTarget,
        opts: { year?: number } & RequestOptions = {}
      ) =>
        request<AreaLookupResult>(
          "agri/palm-yearly-50m",
          { ...targetQuery(target, "geom"), year: opts.year },
          opts
        ),
      /** Rice paddies (bi-weekly), including average yield. */
      rice: (target: GeoTarget, range: DateRange & RequestOptions = {}) =>
        request<AreaLookupResult>(
          "agri/rice-biweekly-50m",
          { ...targetQuery(target, "geom"), from: range.from, to: range.to },
          range
        ),
      /** Para rubber plantations (yearly). */
      rubber: (
        target: GeoTarget,
        opts: { year?: number } & RequestOptions = {}
      ) =>
        request<AreaLookupResult>(
          "agri/rubber-yearly-50m",
          { ...targetQuery(target, "geom"), year: opts.year },
          opts
        ),
      /** Sugarcane fields (bi-weekly). */
      sugarcane: (target: GeoTarget, range: DateRange & RequestOptions = {}) =>
        request<AreaLookupResult>(
          "agri/sugarcane-biweekly-50m",
          { ...targetQuery(target, "geom"), from: range.from, to: range.to },
          range
        ),
    },
    geo: {
      /** Reverse geocode: province, district, subdistrict, postcode and geocode. */
      address: (
        location: Location,
        opts: { locale?: Language } & RequestOptions = {}
      ) =>
        request<AddressResult>(
          "geo/address",
          { lat: location.lat, locale: locale(opts.locale), lon: location.lon },
          opts
        ),
      /** Height above sea level at a point, or along a GeoJSON LineString. */
      elevation: (
        target: Location | GeoJSONGeometry,
        opts: RequestOptions = {}
      ) =>
        request<ElevationPoint[]>(
          "geo/elevation",
          targetQuery(target, "geo"),
          opts
        ),
    },
    info: {
      /** Economic crop information (type, cost, price). */
      crop: (target: GeoTarget, range: DateRange & RequestOptions = {}) =>
        request<CropInfo[]>(
          "info/crop",
          { ...targetQuery(target, "geo"), from: range.from, to: range.to },
          range
        ),
      /** Suitability of each crop at a point or within an area. */
      cropSuitability: (target: GeoTarget, opts: RequestOptions = {}) =>
        request<CropSuitabilityInfo[]>(
          "info/crop-suitability",
          targetQuery(target, "geom"),
          opts
        ),
      /** Disaster statistics (flood, drought, hotspot) for an area. */
      disasterRecurring: (
        target: GeoTarget,
        opts: DateRange &
          RequestOptions & {
            types?: Array<"flood" | "drought" | "hotspot">;
            version?: 1 | 2;
          } = {}
      ) =>
        request<DisasterRecurringInfo>(
          opts.version === 2
            ? "info/disaster-recurring/v2"
            : "info/disaster-recurring",
          {
            ...targetQuery(target, "geo"),
            disaster_type: opts.types?.join(","),
            from: opts.from,
            to: opts.to,
          },
          opts
        ),
      /** Daily drought (soil moisture) history at a point. */
      drought: (location: Location, range: DateRange & RequestOptions = {}) =>
        request<DroughtStatus[]>(
          "info/disaster-drought",
          {
            from: range.from,
            lat: location.lat,
            lon: location.lon,
            to: range.to,
          },
          range
        ),
      /** Repeated-drought area lookup. */
      droughtRecurrence: (target: GeoTarget, opts: RequestOptions = {}) =>
        request<AreaLookupResult>(
          "info/disasters/drought-recurrence",
          targetQuery(target, "geom"),
          opts
        ),
      /** Daily flood status history at a point. */
      flood: (location: Location, range: DateRange & RequestOptions = {}) =>
        request<FloodStatus[]>(
          "info/disaster-flood",
          {
            from: range.from,
            lat: location.lat,
            lon: location.lon,
            to: range.to,
          },
          range
        ),
      /** Repeated-flood area lookup. */
      floodRecurrence: (target: GeoTarget, opts: RequestOptions = {}) =>
        request<AreaLookupResult>(
          "info/disasters/flood-recurrence",
          targetQuery(target, "geom"),
          opts
        ),
      /** Fire hotspots by administrative area, radius or polygon. */
      hotspot: (query: HotspotQuery) =>
        request<Record<string, unknown>>(
          "info/disaster-hotspot",
          {
            ap_tn: query.district,
            from: query.from,
            geo: query.geo ? JSON.stringify(query.geo) : undefined,
            lat: query.location?.lat,
            lon: query.location?.lon,
            pv_tn: query.province,
            radius: query.radius,
            tb_tn: query.subdistrict,
            to: query.to,
          },
          query
        ),
      /** Land suitability for major crops at a point. */
      landSuitability: (location: Location, opts: RequestOptions = {}) =>
        request<LandSuitabilityInfo[]>(
          "info/land-suitability",
          { lat: location.lat, lon: location.lon },
          opts
        ),
    },
    maps: {
      /** URL of an interactive map page to show in an `<iframe>`. */
      embedUrl: (opts: EmbedMapOptions = {}) =>
        serviceUrl("snippet/embed", {
          lat: opts.center?.lat,
          locale: opts.locale ? locale(opts.locale) : undefined,
          lon: opts.center?.lon,
          map: opts.map,
          marker: opts.marker,
          poi: opts.poi,
          route: opts.route,
          search: opts.search,
          tags: opts.tags,
          zoom: opts.zoom,
        }),
      /** Raster tile URL template (`{z}/{x}/{y}`) for a base layer, e.g. for `<Layer type="XYZ">` or QGIS. */
      rasterTileUrl: (layer: RasterTileLayer = "sphere_streets") =>
        `${BASEMAP_URL}/tiles/${layer}/EPSG3857/{z}/{x}/{y}.jpeg?key=${apiKey}`,
      /** URL of a static map image for an `<img>`. */
      staticMapUrl: (opts: StaticMapOptions = {}) => {
        const features = Array.isArray(opts.features)
          ? { features: opts.features, type: "FeatureCollection" }
          : opts.features;
        return serviceUrl("snippet/static", {
          geo: features ? JSON.stringify(features) : undefined,
          height: opts.height,
          lat: opts.center?.lat,
          lon: opts.center?.lon,
          map: opts.map ?? "sphere_streets",
          width: opts.width,
          zoom: opts.zoom,
        });
      },
      /** URL of a Sphere MapLibre style, usable as `baseLayer`/`<Layer style>`. */
      vectorStyleUrl: (style: VectorStyle = "streets") =>
        `${BASEMAP_URL}/vector/sphere_${style}.json`,
      /** Vector tile URL template (`{z}/{x}/{y}.pbf`). */
      vectorTileUrl: () =>
        `${BASEMAP_URL}/maps/sphere/{z}/{x}/{y}.pbf?key=${apiKey}`,
      /** WMTS capabilities URL (for desktop GIS such as QGIS). */
      wmtsCapabilitiesUrl: () => `${BASEMAP_URL}/service?key=${apiKey}`,
    },
    poi: {
      /** POIs within a map tile. */
      cluster: (
        tile: { x: number; y: number; z: number },
        opts: {
          locale?: Language;
          tag?: string | string[];
        } & RequestOptions = {}
      ) =>
        request<PoiClusterItem[]>(
          `poi/cluster/${tile.z}/${tile.x}/${tile.y}/${locale(opts.locale)}`,
          tagArrayQuery(opts.tag),
          opts
        ),
      /** A POI (or area) by ID, including its geometry. */
      get: (id: string, opts: { locale?: Language } & RequestOptions = {}) =>
        request<PoiDetail>(
          "poi/get",
          { id, locale: locale(opts.locale) },
          opts
        ),
      /** POIs near a location. */
      nearby: (location: Location, opts: NearbyPoiOptions = {}) =>
        request<SearchServiceResult>(
          "poi/search",
          {
            lat: location.lat,
            limit: opts.limit,
            locale: locale(opts.locale),
            lon: location.lon,
            offset: opts.offset,
            span: opts.span,
            tag: joinTags(opts.tag),
          },
          opts
        ),
    },
    population: {
      /** Population estimate within a WKT area (max 1,000 km²), using Meta's density maps. */
      get: (wkt: string, opts: { year?: number } & RequestOptions = {}) =>
        request<PopulationResult>(
          "population/facebook",
          { wkt, year: opts.year },
          opts
        ),
    },
    route: {
      /** Distance/time matrix between several origins and destinations. */
      matrix: (req: RouteMatrixRequest) =>
        request<RouteMatrixResult>(
          "route/matrix",
          {
            flat: req.from.map((point) => point.lat),
            flon: req.from.map((point) => point.lon),
            locale: locale(req.locale),
            mode: req.mode ? ROUTE_MODE_CODES[req.mode] : undefined,
            restrict: req.vehicle === "motorcycle" ? 1 : undefined,
            tlat: req.to.map((point) => point.lat),
            tlon: req.to.map((point) => point.lon),
            type: routeTypeMask(req.types),
          },
          req
        ),
      /** A route with step-by-step features and totals. */
      route: (req: RouteRequest) =>
        request<RouteServiceResult>(
          "route/route",
          {
            flat: req.from.lat,
            flon: req.from.lon,
            guide: req.guide === "turns" ? "n" : undefined,
            locale: locale(req.locale),
            maxresult: req.maxResults,
            mode: req.mode ? ROUTE_MODE_CODES[req.mode] : undefined,
            restrict: req.vehicle === "motorcycle" ? 1 : undefined,
            tlat: req.to.lat,
            tlon: req.to.lon,
            type: routeTypeMask(req.types),
          },
          req
        ),
    },
    search: {
      /** Places matching a keyword. */
      search: (keyword: string, opts: ServiceSearchOptions = {}) =>
        request<SearchServiceResult>(
          "search/search",
          {
            keyword,
            lat: opts.near?.lat,
            limit: opts.limit,
            locale: locale(opts.locale),
            lon: opts.near?.lon,
            offset: opts.offset,
            showdistance: opts.showDistance,
            tag: joinTags(opts.tag),
          },
          opts
        ),
      /** Autocomplete suggestions for a partial keyword. */
      suggest: (keyword: string, opts: ServiceSuggestOptions = {}) =>
        request<SuggestServiceResult>(
          "search/suggest",
          {
            keyword,
            limit: opts.limit,
            offset: opts.offset,
            sdx: opts.soundex,
          },
          opts
        ),
    },
    tags: {
      /** All tag categories and their tags (public, no key needed). */
      categories: (opts: RequestOptions = {}) =>
        request<TagCategoryInfo[]>("category/all", {}, opts, false),
    },
  };
}

/** The client returned by `createSphereServices`. */
export type SphereServices = ReturnType<typeof createSphereServices>;
