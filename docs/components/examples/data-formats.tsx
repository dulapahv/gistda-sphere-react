"use client";

import {
  type GeoJSON,
  type GeoJSONFeature,
  GeoJson,
  SphereMap,
  useSphereUtils,
} from "gistda-sphere-react";
import { useEffect, useState } from "react";

type Format = "GeoJSON" | "KML" | "GPX" | "WKT";
const FORMATS: Format[] = ["GeoJSON", "KML", "GPX", "WKT"];

const GEOJSON_SAMPLE: GeoJSON = {
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
};

const KML_SAMPLE = `<kml xmlns="http://www.opengis.net/kml/2.2"><Document>
  <Placemark><name>Democracy Monument</name><Point><coordinates>100.5018,13.7567</coordinates></Point></Placemark>
  <Placemark><name>Ratchadamnoen Avenue</name><LineString><coordinates>100.4930,13.7560 100.5018,13.7567 100.5100,13.7570</coordinates></LineString></Placemark>
</Document></kml>`;

const GPX_SAMPLE = `<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1">
  <wpt lat="13.7465" lon="100.4927"><name>Wat Pho</name></wpt>
  <trk><name>Riverside walk</name><trkseg>
    <trkpt lat="13.7516" lon="100.4887"/><trkpt lat="13.7465" lon="100.4904"/><trkpt lat="13.7410" lon="100.4920"/>
  </trkseg></trk>
</gpx>`;

const WKT_SAMPLE =
  "POLYGON((100.50 13.76, 100.54 13.76, 100.54 13.73, 100.50 13.73, 100.50 13.76))";

/** Converts KML, GPX and WKT with `useSphereUtils`, then draws them with `<GeoJson>`. */
export function DataFormats() {
  const { gpxToGeoJSON, isReady, kmlToGeoJSON, wktToGeoJSON } =
    useSphereUtils();
  const [format, setFormat] = useState<Format>("GeoJSON");
  const [data, setData] = useState<GeoJSON | null>(null);
  const [message, setMessage] = useState("Click a shape to see its name.");

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const converters: Record<Format, () => Promise<GeoJSON>> = {
      GeoJSON: () => Promise.resolve(GEOJSON_SAMPLE),
      GPX: () => gpxToGeoJSON(GPX_SAMPLE),
      KML: () => kmlToGeoJSON(KML_SAMPLE),
      WKT: () => wktToGeoJSON(WKT_SAMPLE),
    };
    let isCurrent = true;
    converters[format]()
      .then((result) => {
        if (isCurrent) {
          setData(result);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setMessage(`Couldn't read the data: ${String(error)}`);
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [format, isReady, gpxToGeoJSON, kmlToGeoJSON, wktToGeoJSON]);

  const showName = (feature: GeoJSONFeature) => {
    setMessage(`Clicked: ${String(feature.properties?.name ?? "(no name)")}`);
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.75, lon: 100.5 }}
        style={{ height: 400 }}
        zoom={13}
      >
        {data ? (
          <GeoJson
            data={data}
            fitBounds={{ maxZoom: 16, padding: 40 }}
            onClick={showName}
            style={{
              fillColor: "rgba(16, 185, 129, 0.25)",
              lineColor: "rgb(5, 150, 105)",
              lineWidth: 3,
            }}
          />
        ) : null}
      </SphereMap>
      <div className="controls">
        {FORMATS.map((option) => (
          <button
            aria-pressed={format === option}
            key={option}
            onClick={() => setFormat(option)}
            type="button"
          >
            {option}
          </button>
        ))}
        <small>{message}</small>
      </div>
    </>
  );
}
