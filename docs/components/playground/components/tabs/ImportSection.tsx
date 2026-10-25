"use client";

import {
  FileArrowUpIcon,
  MagicWandIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { type GeoJSON, useSphereUtils } from "gistda-sphere-react";
import { type ChangeEvent, useId, useState } from "react";
import {
  IMPORT_FORMATS,
  IMPORT_SAMPLES,
  type ImportFormat,
} from "../../constants";
import type { PlaygroundTranslations } from "../../translations";
import type { GeoJsonLayer } from "../../types";
import {
  Button,
  ErrorNote,
  Hint,
  Panel,
  Row,
  Section,
  TextArea,
  Toggle,
} from "../ui";

const EXTENSION_FORMATS: Record<string, ImportFormat> = {
  geojson: "geojson",
  gpx: "gpx",
  json: "geojson",
  kml: "kml",
  txt: "wkt",
  wkt: "wkt",
};

/** Counts the features in GeoJSON for the summary line. */
function countFeatures(data: GeoJSON): number {
  if (data.type === "FeatureCollection") {
    return data.features.length;
  }
  return 1;
}

/** Import tab section: GeoJSON, WKT, KML and GPX via `useSphereUtils`. */
export function ImportSection({
  imported,
  onImport,
  t,
}: {
  imported: GeoJsonLayer | null;
  onImport: (layer: GeoJsonLayer | null) => void;
  t: PlaygroundTranslations;
}) {
  const { gpxToGeoJSON, kmlToGeoJSON, wktToGeoJSON } = useSphereUtils();
  const [format, setFormat] = useState<ImportFormat>("geojson");
  const [text, setText] = useState(IMPORT_SAMPLES.geojson);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputId = useId();

  const convert = async (
    source: string,
    sourceFormat: ImportFormat
  ): Promise<GeoJSON | null> => {
    switch (sourceFormat) {
      case "wkt":
        return await wktToGeoJSON(source.trim());
      case "kml":
        return await kmlToGeoJSON(source);
      case "gpx":
        return await gpxToGeoJSON(source);
      default:
        return JSON.parse(source) as GeoJSON | null;
    }
  };

  const importText = async (
    source: string,
    sourceFormat: ImportFormat,
    label: string
  ) => {
    setError(null);
    if (!source.trim()) {
      setError(t.draw.import.empty);
      return;
    }
    setBusy(true);
    try {
      const data = await convert(source, sourceFormat);
      if (!data?.type) {
        throw new Error(t.draw.import.unrecognized);
      }
      onImport({ data, label });
    } catch (reason) {
      setError(
        t.draw.import.failed(
          reason instanceof Error ? reason.message : String(reason)
        )
      );
    } finally {
      setBusy(false);
    }
  };

  const chooseFormat = (next: ImportFormat) => {
    setFormat(next);
    setText(IMPORT_SAMPLES[next]);
    setError(null);
  };

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const fileFormat = EXTENSION_FORMATS[extension];
    if (!fileFormat) {
      setError(t.draw.import.unsupportedFile(file.name));
      return;
    }
    const content = await file.text();
    setFormat(fileFormat);
    setText(content);
    await importText(content, fileFormat, file.name);
  };

  return (
    <Section hint={t.draw.import.hint} title={t.draw.import.title}>
      <Row>
        {IMPORT_FORMATS.map((id) => (
          <Toggle
            active={format === id}
            key={id}
            label={t.draw.import.format[id]}
            onClick={() => chooseFormat(id)}
          />
        ))}
      </Row>
      <div className="mt-2">
        <TextArea
          label={t.draw.import.title}
          onChange={setText}
          placeholder={t.draw.import.placeholder}
          value={text}
        />
      </div>
      <div className="mt-1.5">
        <Row>
          <Button
            busy={busy}
            icon={UploadSimpleIcon}
            label={t.draw.import.show}
            onClick={() =>
              importText(text, format, t.draw.import.format[format])
            }
            primary
          />
          <label
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-fd-border bg-fd-secondary px-2.5 py-1.5 font-medium text-fd-secondary-foreground text-xs hover:border-fd-ring hover:bg-fd-accent"
            htmlFor={fileInputId}
          >
            <FileArrowUpIcon size={14} />
            {t.draw.import.openFile}
          </label>
          <input
            accept=".geojson,.json,.wkt,.txt,.kml,.gpx"
            className="sr-only"
            id={fileInputId}
            onChange={loadFile}
            type="file"
          />
          <Button
            icon={MagicWandIcon}
            label={t.draw.import.sample}
            onClick={() => setText(IMPORT_SAMPLES[format])}
          />
        </Row>
      </div>
      {imported ? (
        <Panel>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span>
              {t.draw.import.shown(
                imported.label,
                countFeatures(imported.data)
              )}
            </span>
            <Button
              icon={TrashIcon}
              onClick={() => onImport(null)}
              title={t.common.remove}
            />
          </div>
        </Panel>
      ) : (
        <Hint>{t.draw.import.formatsNote}</Hint>
      )}
      {error ? <ErrorNote>{error}</ErrorNote> : null}
    </Section>
  );
}
