import { useMemo } from "react";
import { useSphereContext } from "@/context/SphereContext";
import { useActiveMap } from "@/internal/useActiveMap";
import type {
  GeoJSON,
  GeoJSONFeatureCollection,
  GeoJSONGeometry,
  Language,
  SphereMath,
  SphereNamespace,
  SphereUtil,
} from "@/types";

/** Optional Sphere libraries that converters load on demand. */
type SphereLibrary =
  | "esrijson"
  | "gml"
  | "gpx"
  | "kml"
  | "project"
  | "topojson"
  | "wkt";

export interface UseSphereUtilsReturn {
  /** ESRI JSON geometry to GeoJSON. */
  esriJsonToGeoJSON: (json: object) => Promise<GeoJSON>;
  formatArea: (squareMeters: number, language?: Language) => string;
  formatDate: (isoDate: string, language?: Language) => string;
  formatDateTimeRange: (
    startDateTime: string,
    stopDateTime: string,
    language?: Language
  ) => string;
  formatDistance: (meters: number, language?: Language) => string;
  formatInterval: (seconds: number, language?: Language) => string;
  /** Area in Thai units (rai, ngan, square wa). */
  formatThaiArea: (squareMeters: number, language?: Language) => string;
  formatTime: (isoTime: string) => string;
  /** GML (document or text) to GeoJSON. */
  gmlToGeoJSON: (doc: Document | string) => Promise<GeoJSON>;
  /** GPX (document or text) to GeoJSON. */
  gpxToGeoJSON: (doc: Document | string) => Promise<GeoJSONFeatureCollection>;
  isReady: boolean;
  /** KML (document or text) to GeoJSON. */
  kmlToGeoJSON: (doc: Document | string) => Promise<GeoJSONFeatureCollection>;
  /** Length of one degree of latitude at a latitude, in meters. */
  latitudeLength: (lat: number) => number;
  /** Length of one degree of longitude at a latitude, in meters. */
  longitudeLength: (lat: number) => number;
  /** Raw `sphere.Math`, or `null` before the API loads. */
  math: SphereMath | null;
  /**
   * Transform coordinates (`[x, y]` or `{ x, y }`) to another coordinate
   * system given as a proj4 string, from WGS84 or `fromProjection`.
   */
  project: (
    toProjection: string,
    coordinates: number[] | { x: number; y: number },
    fromProjection?: string
  ) => Promise<unknown>;
  /** TopoJSON to GeoJSON for one object (by name or object). */
  topoJsonToGeoJSON: (
    json: object,
    object: object | string
  ) => Promise<GeoJSON>;
  /** Raw `sphere.Util`, or `null` before the API loads. */
  util: SphereUtil | null;
  /** Well-known text (WKT) to a GeoJSON geometry. */
  wktToGeoJSON: (text: string) => Promise<GeoJSONGeometry>;
}

/** Parses XML text into a document for the KML/GPX converters. */
function toXmlDocument(doc: Document | string): Document {
  return typeof doc === "string"
    ? new DOMParser().parseFromString(doc, "application/xml")
    : doc;
}

/**
 * Sphere's formatting helpers and geodata converters. Converters load the
 * optional library they need (`Util.initLibrary`) automatically. Formatters
 * default to the map's language.
 */
export function useSphereUtils(): UseSphereUtilsReturn {
  const { sphere } = useSphereContext();
  const { map } = useActiveMap();

  return useMemo<UseSphereUtilsReturn>(() => {
    const requireUtil = (): SphereNamespace["Util"] => {
      if (!sphere?.Util) {
        throw new Error("Sphere API is not loaded yet.");
      }
      return sphere.Util;
    };
    const withLibrary = async <T>(
      library: SphereLibrary,
      run: (util: SphereUtil) => T
    ): Promise<T> => {
      const util = requireUtil();
      await util.initLibrary(library);
      return run(util);
    };
    const languageOf = (language?: Language): Language => {
      if (language) {
        return language;
      }
      return map?.language() === "en" ? "en" : "th";
    };

    return {
      esriJsonToGeoJSON: (json) =>
        withLibrary("esrijson", (util) => util.EsriJSONToGeoJSON(json)),
      formatArea: (squareMeters, language) =>
        requireUtil().formatArea(squareMeters, languageOf(language)),
      formatDate: (isoDate, language) =>
        requireUtil().formatDate(isoDate, languageOf(language)),
      formatDateTimeRange: (start, stop, language) =>
        requireUtil().formatDateTimeRange(start, stop, languageOf(language)),
      formatDistance: (meters, language) =>
        requireUtil().formatDistance(meters, languageOf(language)),
      formatInterval: (seconds, language) =>
        requireUtil().formatInterval(seconds, languageOf(language)),
      formatThaiArea: (squareMeters, language) =>
        requireUtil().formatThaiArea(squareMeters, languageOf(language)),
      formatTime: (isoTime) => requireUtil().formatTime(isoTime),
      gmlToGeoJSON: (doc) =>
        withLibrary("gml", (util) => util.GMLToGeoJSON(doc)),
      gpxToGeoJSON: (doc) =>
        withLibrary("gpx", (util) => util.GPXToGeoJSON(toXmlDocument(doc))),
      isReady: Boolean(sphere?.Util),
      kmlToGeoJSON: (doc) =>
        withLibrary("kml", (util) => util.KMLToGeoJSON(toXmlDocument(doc))),
      latitudeLength: (lat) => requireUtil().latitudeLength(lat),
      longitudeLength: (lat) => requireUtil().longitudeLength(lat),
      math: sphere?.Math ?? null,
      project: (toProjection, coordinates, fromProjection) =>
        withLibrary("project", (util) =>
          // Sphere only accepts the 3-argument form with a real source CRS.
          fromProjection
            ? util.project(fromProjection, toProjection, coordinates)
            : util.project(toProjection, coordinates)
        ),
      topoJsonToGeoJSON: (json, object) =>
        withLibrary("topojson", (util) => util.TopoJSONToGeoJSON(json, object)),
      util: sphere?.Util ?? null,
      wktToGeoJSON: (text) =>
        withLibrary("wkt", (util) => util.WKTToGeoJSON(text)),
    };
  }, [sphere, map]);
}
