"use client";

import {
  type GeoJSON,
  type GeoJSONFeature,
  GeoJson,
  SphereMap,
  useSphereUtils,
} from "gistda-sphere-react";
import { useEffect, useState } from "react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

type Format = "geojson" | "kml" | "gpx" | "wkt";
const FORMATS: readonly Format[] = ["geojson", "kml", "gpx", "wkt"];

const SAMPLES: Record<Format, string> = {
  geojson: JSON.stringify({
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
  }),
  gpx: `<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1">
  <wpt lat="13.7465" lon="100.4927"><name>Wat Pho</name></wpt>
  <trk><name>Riverside walk</name><trkseg>
    <trkpt lat="13.7516" lon="100.4887"/><trkpt lat="13.7465" lon="100.4904"/><trkpt lat="13.7410" lon="100.4920"/>
  </trkseg></trk>
</gpx>`,
  kml: `<kml xmlns="http://www.opengis.net/kml/2.2"><Document>
  <Placemark><name>Democracy Monument</name><Point><coordinates>100.5018,13.7567</coordinates></Point></Placemark>
  <Placemark><name>Ratchadamnoen Avenue</name><LineString><coordinates>100.4930,13.7560 100.5018,13.7567 100.5100,13.7570</coordinates></LineString></Placemark>
</Document></kml>`,
  wkt: "POLYGON((100.50 13.76, 100.54 13.76, 100.54 13.73, 100.50 13.73, 100.50 13.76))",
};

const TEXT = {
  en: {
    clicked: (name: string) => `Clicked: ${name}`,
    error: (message: string) => `Couldn't read the data: ${message}`,
    hint: "Click a shape to see its name.",
    unnamed: "(no name)",
  },
  th: {
    clicked: (name: string) => `คลิก: ${name}`,
    error: (message: string) => `อ่านข้อมูลไม่สำเร็จ: ${message}`,
    hint: "คลิกรูปทรงเพื่อดูชื่อ",
    unnamed: "(ไม่มีชื่อ)",
  },
};

/** Converts each sample with `useSphereUtils` and shows it with `<GeoJson>`. */
function FormatViewer() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const { gpxToGeoJSON, isReady, kmlToGeoJSON, wktToGeoJSON } =
    useSphereUtils();
  const [format, setFormat] = useState<Format>("geojson");
  const [data, setData] = useState<GeoJSON | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    let active = true;
    const convert = async (): Promise<GeoJSON> => {
      switch (format) {
        case "kml":
          return await kmlToGeoJSON(SAMPLES.kml);
        case "gpx":
          return await gpxToGeoJSON(SAMPLES.gpx);
        case "wkt":
          return await wktToGeoJSON(SAMPLES.wkt);
        default:
          return JSON.parse(SAMPLES.geojson) as GeoJSON;
      }
    };
    convert()
      .then((result) => {
        if (active) {
          setData(result);
          setMessage(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setMessage(text.error(String(reason)));
        }
      });
    return () => {
      active = false;
    };
  }, [format, isReady, gpxToGeoJSON, kmlToGeoJSON, wktToGeoJSON, text]);

  const showName = (feature: GeoJSONFeature) =>
    setMessage(text.clicked(String(feature.properties?.name ?? text.unnamed)));

  return (
    <>
      <SphereMap
        center={{ lat: 13.75, lon: 100.5 }}
        language={language}
        style={{ height: "400px", width: "100%" }}
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
      <DemoBar>
        {FORMATS.map((option) => (
          <DemoButton
            active={format === option}
            key={option}
            onClick={() => setFormat(option)}
          >
            {option.toUpperCase()}
          </DemoButton>
        ))}
        <DemoNote>{message ?? text.hint}</DemoNote>
      </DemoBar>
    </>
  );
}

export function GeoJsonDemo() {
  return (
    <DemoFrame height="460px">
      <FormatViewer />
    </DemoFrame>
  );
}
